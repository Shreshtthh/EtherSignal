import { SDK } from '@somnia-chain/streams'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import { toHex } from 'viem'
import * as dotenv from 'dotenv'

dotenv.config()

// Somnia Testnet chain config
const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] }
  },
  testnet: true
})

// Signal quality schema (must match shared/schema.ts)
const signalQualitySchema = `uint64 timestamp,bytes32 deviceId,uint32 frequency,int16 snr,int32 latitude,int32 longitude,uint8 interferenceLevel,uint256 bidPrice`

async function main() {
  console.log('🔧 Registering Signal Quality Schema on Somnia...')
  
  // Setup clients
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
  
  const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL)
  })
  
  const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http(process.env.RPC_URL)
  })
  
  console.log(`Using wallet: ${account.address}`)
  
  // Check balance
  const balance = await publicClient.getBalance({ address: account.address })
  console.log(`Balance: ${Number(balance) / 1e18} STT`)
  
  if (balance === 0n) {
    throw new Error('No testnet tokens! Get some from https://testnet.somnia.network')
  }
  
  // Initialize SDK
  const sdk = new SDK({
    public: publicClient,
    wallet: walletClient
  })
  
  // Compute schema ID
  const schemaId = await sdk.streams.computeSchemaId(signalQualitySchema)
  
  // Handle null case
  if (!schemaId) {
    throw new Error('Failed to compute schema ID')
  }
  
  console.log(`\nComputed Schema ID: ${schemaId}`)
  
  // Check if already registered
  try {
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId)
    
    if (isRegistered) {
      console.log(`\n⚠️ Schema already registered!`)
      console.log(`Schema ID: ${schemaId}`)
      console.log(`Publisher Address: ${account.address}`)
      console.log(`\nAdd to .env files:`)
      console.log(`SCHEMA_ID=${schemaId}`)
      console.log(`\nAdd to dashboard .env.local:`)
      console.log(`NEXT_PUBLIC_SCHEMA_ID=${schemaId}`)
      console.log(`NEXT_PUBLIC_PUBLISHER_ADDRESS=${account.address}`)
      return
    }
  } catch (error) {
    // isDataSchemaRegistered might not exist, continue to register
    console.log('Could not check if schema exists, attempting registration...')
  }
  
  // Register schema - CORRECTED: Only 1 argument
  try {
    console.log('\nRegistering schema...')
    
    const tx = await sdk.streams.registerDataSchemas([
      {
        id: toHex('SignalQuality', { size: 32 }),
        schema: signalQualitySchema,
        parentSchemaId: '0x0000000000000000000000000000000000000000000000000000000000000000'
      }
    ])
    
    console.log(`\n✅ Schema registered successfully!`)
    console.log(`Transaction hash: ${tx}`)
    console.log(`\n📋 SAVE THESE VALUES:\n`)
    console.log(`Schema ID: ${schemaId}`)
    console.log(`Publisher Address: ${account.address}`)
    console.log(`\nAdd to .env files:`)
    console.log(`SCHEMA_ID=${schemaId}`)
    console.log(`\nAdd to dashboard .env.local:`)
    console.log(`NEXT_PUBLIC_SCHEMA_ID=${schemaId}`)
    console.log(`NEXT_PUBLIC_PUBLISHER_ADDRESS=${account.address}`)
    
  } catch (error: any) {
    if (error.message?.includes('already registered') || error.message?.includes('SchemaAlreadyRegistered')) {
      console.log(`\n⚠️ Schema already registered (this is OK)`)
      console.log(`Schema ID: ${schemaId}`)
      console.log(`Publisher Address: ${account.address}`)
    } else {
      console.error('\n❌ Error registering schema:')
      console.error(error.message || error)
      throw error
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
