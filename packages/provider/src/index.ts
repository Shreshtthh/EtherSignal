import { SDK, SchemaEncoder } from '@somnia-chain/streams'
import { parseEther, decodeAbiParameters, parseAbiParameters } from 'viem'
import { publicClient, walletClient, somniaTestnet } from './clients.js'
import { SpectrumMarketABI } from '../../../shared/SpectrumMarketABI.js'
import PQueue from 'p-queue'
import * as dotenv from 'dotenv'

dotenv.config()

// Transaction queue (prevents nonce collisions)
const txQueue = new PQueue({ concurrency: 1 })

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}`
const SCHEMA_ID = process.env.SCHEMA_ID as `0x${string}`
const PUBLISHER_ADDRESS = process.env.PUBLISHER_ADDRESS as `0x${string}`
const MIN_SNR = Number(process.env.MIN_SNR || 10)

const signalQualitySchema = `uint64 timestamp,bytes32 deviceId,uint32 frequency,int16 snr,int32 latitude,int32 longitude,uint8 interferenceLevel,uint256 bidPrice`

interface DeviceState {
  hasGrant: boolean
  grantExpires: number
  lastSNR: number
}

class SpectrumProvider {
  private deviceStates = new Map<string, DeviceState>()
  private schemaEncoder: SchemaEncoder
  private sdk: SDK
  
  constructor() {
    this.schemaEncoder = new SchemaEncoder(signalQualitySchema)
    this.sdk = new SDK({
      public: publicClient,
      wallet: walletClient
    })
  }
  
  async start() {
    console.log('🚀 Spectrum Provider Starting...')
    console.log(`Contract: ${CONTRACT_ADDRESS}`)
    console.log(`Schema ID: ${SCHEMA_ID}`)
    console.log(`Publisher: ${PUBLISHER_ADDRESS}`)
    console.log(`Min SNR: ${MIN_SNR}dB\n`)
    
    // Poll for new data (simpler approach)
    await this.pollForSignals()
  }
  
  private async pollForSignals() {
    console.log('👂 Polling for device signals...\n')
    
    let lastProcessedIndex = -1n
    
    setInterval(async () => {
      try {
        // Get total count of published data
        const total = await this.sdk.streams.totalPublisherDataForSchema(
          SCHEMA_ID,
          PUBLISHER_ADDRESS
        )
        
        if (!total || total === 0n) {
          return
        }
        
        const totalNum = Number(total)
        
        // Process new records
        for (let i = Number(lastProcessedIndex) + 1; i < totalNum; i++) {
          const data = await this.sdk.streams.getAtIndex(
            SCHEMA_ID,
            PUBLISHER_ADDRESS,
            BigInt(i)
          )
          
          if (data) {
            await this.handleSignalData(data)
            lastProcessedIndex = BigInt(i)
          }
        }
        
      } catch (error: any) {
        console.error('Polling error:', error.message)
      }
    }, 500) // Poll every 500ms
  }
  
  private async handleSignalData(rawData: any) {
  try {
    const fields = rawData[0]
    
    if (!fields || !Array.isArray(fields)) {
      console.error('Unexpected data format')
      return
    }
    
    // Access the nested .value.value structure
    const deviceId = fields[1].value.value.toString() as `0x${string}`
    const snr = Number(fields[3].value.value)  // Already a number!
    const bidPrice = BigInt(fields[7].value.value)  // Already a BigInt!
    
    const now = Date.now()
    const currentState = this.deviceStates.get(deviceId) || {
      hasGrant: false,
      grantExpires: 0,
      lastSNR: 0
    }
    
    const shouldHaveGrant = snr >= MIN_SNR
    const grantExpired = currentState.grantExpires < now
    
    // Case 1: GRANT
    if (shouldHaveGrant && (!currentState.hasGrant || grantExpired)) {
      console.log(`⚡ GRANT | Device: ${deviceId.slice(0, 10)}... | SNR: ${snr}dB | Bid: ${Number(bidPrice)/1e15}mSTT`)
      
      this.deviceStates.set(deviceId, {
        hasGrant: true,
        grantExpires: now + 10000,
        lastSNR: snr
      })
      
      await txQueue.add(async () => {
  try {
    console.log(`  📤 Sending grant transaction...`)
    console.log(`     Device ID: ${deviceId}`)
    console.log(`     Frequency: 2400 MHz`)
    console.log(`     Duration: 10 seconds`)
    console.log(`     Payment: 0.001 STT`)
    
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: SpectrumMarketABI,
      functionName: 'grantAccess',
      args: [deviceId, 2400, 10],
      value: parseEther('0.001'),
      gas: 200000n 
    })
    
    console.log(`  ✅ Grant TX: ${hash.slice(0, 10)}...`)
    console.log(`     View: https://shannon-explorer.somnia.network/tx/${hash}`)
  } catch (error: any) {
    console.error(`  ❌ Grant failed:`, error.message)
    
    // Check specific error reasons
    if (error.message.includes('InsufficientPayment')) {
      console.error('     Reason: Payment too low (need 0.001 STT)')
    } else if (error.message.includes('InvalidDuration')) {
      console.error('     Reason: Duration out of range (must be 1-3600 seconds)')
    } else if (error.message.includes('InvalidFrequency')) {
      console.error('     Reason: Frequency is 0')
    } else {
      console.error('     Full error:', error)
    }
    
    this.deviceStates.set(deviceId, currentState)
  }
})

    }
    
    // Case 2: REVOKE
    else if (!shouldHaveGrant && currentState.hasGrant && !grantExpired) {
      console.log(`🛑 REVOKE | Device: ${deviceId.slice(0, 10)}... | SNR: ${snr}dB`)
      
      this.deviceStates.set(deviceId, {
        hasGrant: false,
        grantExpires: 0,
        lastSNR: snr
      })
      
      await txQueue.add(async () => {
        try {
          const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: SpectrumMarketABI,
            functionName: 'revokeAccess',
            args: [deviceId],
            gas: 100000n
          })
          
          console.log(`  ✅ Revoke TX: ${hash.slice(0, 10)}...`)
        } catch (error: any) {
          console.error(`  ❌ Revoke failed:`, error.message.slice(0, 100))
        }
      })
    }
    
  } catch (error: any) {
    console.error('Error handling signal:', error.message)
  }
}

}

// Start provider
const provider = new SpectrumProvider()
provider.start().catch(console.error)

process.on('SIGINT', () => {
  console.log('\n👋 Provider shutting down...')
  process.exit(0)
})
