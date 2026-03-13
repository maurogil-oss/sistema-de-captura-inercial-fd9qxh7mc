import { useState, useEffect, useCallback, useRef } from 'react'

export type SyncStatus =
  | 'Offline'
  | 'Waiting for telemetry data...'
  | 'Receiving Live Data'
  | 'Connection Lost'
  | 'Local-Only'

export function useCloudSync(sessionId: string, isCapturing: boolean) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<any[]>([])
  const [remoteStats, setRemoteStats] = useState<any>(null)
  const [isReceiving, setIsReceiving] = useState(false)

  const channelRef = useRef<BroadcastChannel | null>(null)
  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const connectionLostTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channelRef.current = new BroadcastChannel('orbis_cloud_sync')
        setSyncStatus('Waiting for telemetry data...')

        const handleMessage = (event: MessageEvent) => {
          const { type, sId, payload } = event.data
          if (sId === sessionId && type === 'SYNC_BATCH') {
            if (!isCapturing) {
              setRemoteData(payload.data)
              setRemoteStats(payload.stats)

              setIsReceiving(true)
              setSyncStatus('Receiving Live Data')

              if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
              receivingTimeoutRef.current = setTimeout(() => {
                setIsReceiving(false)
              }, 1500)

              if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
              connectionLostTimeoutRef.current = setTimeout(() => {
                setSyncStatus('Connection Lost')
              }, 5000)
            }
          }
        }

        channelRef.current.addEventListener('message', handleMessage)

        return () => {
          if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
          if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
          channelRef.current?.removeEventListener('message', handleMessage)
          channelRef.current?.close()
        }
      } catch (err) {
        setSyncStatus('Local-Only')
      }
    } else {
      setSyncStatus('Local-Only')
    }
  }, [sessionId, isCapturing])

  const sendBatch = useCallback(
    (data: any[], stats: any) => {
      if (channelRef.current && isCapturing) {
        try {
          channelRef.current.postMessage({
            type: 'SYNC_BATCH',
            sId: sessionId,
            payload: { data, stats },
          })
          setSyncStatus('Receiving Live Data')
        } catch (err) {
          setSyncStatus('Local-Only')
        }
      }
    },
    [sessionId, isCapturing],
  )

  return { syncStatus, sendBatch, remoteData, remoteStats, isReceiving }
}
