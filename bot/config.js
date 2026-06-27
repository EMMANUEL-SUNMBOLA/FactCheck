import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  tgToken: process.env.TGTOKEN,
  contractAddress: process.env.CONTRACT_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
};

const missing = [];
if (!config.tgToken) missing.push('TGTOKEN');
if (!config.contractAddress) missing.push('CONTRACT_ADDRESS');

if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

export default config;
