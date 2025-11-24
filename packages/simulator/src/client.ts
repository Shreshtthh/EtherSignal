import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

// Somnia Testnet
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] }
  },
  testnet: true
})

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)

export const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(process.env.RPC_URL || 'https://dream-rpc.somnia.network')
})

export const walletClient = createWalletClient({
  account,
  chain: somniaTestnet,
  transport: http(process.env.RPC_URL || 'https://dream-rpc.somnia.network')
})

export const deviceWallet = account.address

console.log(`✅ Device wallet: ${account.address}`)
