# { "Depends": "py-genlayer:test" }

from genlayer import *
from dataclasses import dataclass
import typing


@allow_storage
@dataclass
class Check:
    url: str
    question: str
    answer: str


class FactCheck(gl.Contract):
    checks: TreeMap[u256, Check]
    next_id: u256

    def __init__(self):
        self.next_id = u256(1)

    @gl.public.write
    def verify(self, url: str, question: str) -> u256:
        check_id = self.next_id
        self.next_id += 1

        def fetch_content() -> str:
            return gl.get_webpage(url, mode="text")

        content = gl.eq_principle_strict_eq(fetch_content)

        def run_llm() -> str:
            prompt = (
                f"You are a fact-checker. Read this content from {url}:\n\n"
                f"{content}\n\n"
                f"Question: {question}\n\n"
                f"Answer concisely based ONLY on the content above."
            )
            return gl.nondet.exec_prompt(prompt).strip()

        answer = gl.eq_principle.prompt_comparative(
            run_llm,
            principle="Answers should convey the same factual information regarding the question. Different phrasings are acceptable as long as the factual content is equivalent.",
        )

        self.checks[check_id] = Check(
            url=url,
            question=question,
            answer=answer,
        )
        return check_id

    @gl.public.view
    def get_result(self, check_id: u256) -> typing.Optional[TreeMap[str, typing.Any]]:
        if check_id not in self.checks:
            return None
        return self.checks[check_id]

    @gl.public.view
    def total_checks(self) -> u256:
        return self.next_id - 1
