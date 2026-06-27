import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient, createAccount } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('PRIVATE_KEY required in .env');
  process.exit(1);
}

const account = createAccount(privateKey);
console.log('Deployer address:', account.address);

const client = createClient({ chain: studionet, account });
await client.initializeConsensusSmartContract();

const contractPath = path.resolve(__dirname, 'FactCheck.py');
const contractCode = new Uint8Array(readFileSync(contractPath));

console.log('Deploying FactCheck.py to StudioNet...');
const hash = await client.deployContract({ code: contractCode, args: [] });
console.log('Deploy tx:', hash);

const receipt = await client.waitForTransactionReceipt({ hash, retries: 200 });
console.log('Receipt status:', receipt.statusName);

const contractAddress = receipt.data.contract_address;
console.log('Contract deployed at:', contractAddress);
