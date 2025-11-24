import { SDK, SchemaEncoder } from '@somnia-chain/streams'
import { toHex } from 'viem'
import type { PublicClient, WalletClient } from 'viem'

const signalQualitySchema = `uint64 timestamp,bytes32 deviceId,uint32 frequency,int16 snr,int32 latitude,int32 longitude,uint8 interferenceLevel,uint256 bidPrice`

export class IoTDevice {
  private deviceId: number
  private baselineSNR: number = 15
  private microwaveActive: boolean = false
  private schemaEncoder: SchemaEncoder
  private sdk: SDK
  private schemaId: `0x${string}`
  
  // Shimla, India coordinates
  private latitude: number = 31083000  // 31.083° N
  private longitude: number = 77173000 // 77.173° E
  
  constructor(
    deviceId: number,
    publicClient: PublicClient,
    walletClient: WalletClient,
    schemaId: string
  ) {
    this.deviceId = deviceId
    this.schemaId = schemaId as `0x${string}`
    this.schemaEncoder = new SchemaEncoder(signalQualitySchema)
    
    this.sdk = new SDK({
      public: publicClient,
      wallet: walletClient
    })
  }
  
  /**
   * Calculate SNR with realistic interference patterns
   */
  private calculateSNR(): number {
    let snr = this.baselineSNR + (Math.random() * 4 - 2) // ±2dB variance
    
    // Microwave interference (sharp drop)
    if (this.microwaveActive) {
      snr -= 8
    }
    
    // Add some random interference events
    if (Math.random() > 0.95) {
      snr -= 3 // Random interference spike
    }
    
    return Math.max(0, Math.floor(snr))
  }
  
  /**
   * Calculate bid price based on signal quality
   * Desperate devices (low SNR) bid higher
   */
  private calculateBid(snr: number): bigint {
    const baseBid = 1000000000000000n // 0.001 STT
    
    if (snr < 5) return baseBid * 10n      // 10x when critical
    if (snr < 10) return baseBid * 5n      // 5x when poor
    if (snr < 12) return baseBid * 2n      // 2x when marginal
    
    return baseBid // Normal price
  }
  
  /**
   * Get interference level (0-5)
   */
  private getInterferenceLevel(snr: number): number {
    if (snr >= 15) return 0  // No interference
    if (snr >= 12) return 1  // Low
    if (snr >= 10) return 2  // Medium
    if (snr >= 7) return 3   // High
    if (snr >= 5) return 4   // Very high
    return 5                 // Critical
  }
  
  /**
   * Start streaming signal quality at 10Hz
   */
  async startStreaming() {
    console.log(`🚀 Device ${this.deviceId} started (10Hz streaming)`)
    
    setInterval(async () => {
      const snr = this.calculateSNR()
      const bidPrice = this.calculateBid(snr)
      const interferenceLevel = this.getInterferenceLevel(snr)
      
      // Encode data
      const encodedData = this.schemaEncoder.encodeData([
        { name: 'timestamp', value: Date.now().toString(), type: 'uint64' },
        { name: 'deviceId', value: toHex(`device-${this.deviceId}`, { size: 32 }), type: 'bytes32' },
        { name: 'frequency', value: '2400', type: 'uint32' }, // 2400 MHz = 2.4 GHz
        { name: 'snr', value: snr.toString(), type: 'int16' },
        { name: 'latitude', value: this.latitude.toString(), type: 'int32' },
        { name: 'longitude', value: this.longitude.toString(), type: 'int32' },
        { name: 'interferenceLevel', value: interferenceLevel.toString(), type: 'uint8' },
        { name: 'bidPrice', value: bidPrice.toString(), type: 'uint256' }
      ])
      
      // Publish to SDS
      const dataId = toHex(`device-${this.deviceId}-${Date.now()}`, { size: 32 })
      
      try {
        await this.sdk.streams.set([{
          id: dataId,
          schemaId: this.schemaId,
          data: encodedData
        }])
        
        // Log with color based on SNR
        const emoji = snr >= 10 ? '✅' : '⚠️'
        console.log(`${emoji} Device ${this.deviceId}: SNR=${snr}dB | Interference=${interferenceLevel} | Bid=${Number(bidPrice)/1e15}mSTT`)
        
      } catch (error: any) {
        console.error(`❌ Device ${this.deviceId} publish failed:`, error.message)
      }
      
    }, 1000) // 1Hz = every 1000ms
  }
  
  /**
   * Trigger microwave interference
   */
  triggerMicrowave(duration: number = 3000) {
    console.log(`🔥 Device ${this.deviceId}: Microwave interference for ${duration}ms`)
    this.microwaveActive = true
    
    setTimeout(() => {
      this.microwaveActive = false
      console.log(`✅ Device ${this.deviceId}: Microwave interference cleared`)
    }, duration)
  }
}
