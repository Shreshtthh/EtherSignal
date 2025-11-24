// This schema is used by simulator, provider, and dashboard
export const signalQualitySchema = `
  uint64 timestamp,
  bytes32 deviceId,
  uint32 frequency,
  int16 snr,
  int32 latitude,
  int32 longitude,
  uint8 interferenceLevel,
  uint256 bidPrice
`

// Helper types for TypeScript
export interface SignalData {
  timestamp: number
  deviceId: string
  frequency: number
  snr: number
  latitude: number
  longitude: number
  interferenceLevel: number
  bidPrice: bigint
}
