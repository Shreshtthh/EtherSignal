import { publicClient, walletClient } from './client.js'
import { IoTDevice } from './device.js'
import * as dotenv from 'dotenv'

dotenv.config()

const SCHEMA_ID = process.env.SCHEMA_ID!
const NUM_DEVICES = Number(process.env.NUM_DEVICES || 3)

async function main() {
  console.log('🚀 EtherSignal Device Simulator Starting...')
  console.log(`Schema ID: ${SCHEMA_ID}`)
  console.log(`Number of devices: ${NUM_DEVICES}`)
  
  // Create and start devices
  const devices: IoTDevice[] = []
  
  for (let i = 1; i <= NUM_DEVICES; i++) {
    const device = new IoTDevice(i, publicClient, walletClient, SCHEMA_ID)
    devices.push(device)
    await device.startStreaming()
    
    // Stagger startup by 50ms
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  console.log(`\n✅ All ${NUM_DEVICES} devices streaming at 10Hz`)
  console.log('Press Ctrl+C to stop\n')
  
  // Demo: Trigger microwave interference on device 1 after 10 seconds
  setTimeout(() => {
    devices[0].triggerMicrowave(3000)
  }, 10000)
}

main().catch(console.error)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping simulator...')
  process.exit(0)
})
