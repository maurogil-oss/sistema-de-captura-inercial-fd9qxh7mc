import { useState, useEffect, useCallback, useRef } from 'react'

export type SyncStatus = 'Offline' | 'Waiting' | 'Connected' | 'Syncing' | 'Local-Only'

export function useCloudSync(sessionId: string, isCapturing: boolean) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<any[]>([])
  const [remoteStats, setRemoteStats] = useState<any>(null)
  const [isReceiving, setIsReceiving] = useState(false)

  const channelRef = useRef<BroadcastChannel | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channelRef.current = new BroadcastChannel('orbis_cloud_sync')
        setSyncStatus('Waiting')

        const handleMessage = (event: MessageEvent) => {
          const { type, sId, payload } = event.data
          if (sId === sessionId && type === 'SYNC_BATCH') {
            if (!isCapturing) {
              setRemoteData(payload.data)
              setRemoteStats(payload.stats)

              setIsReceiving(true)
              if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
              receivingTimeoutRef.current = setTimeout(() => {
                setIsReceiving(false)
              }, 1500)
            }

            setSyncStatus('Syncing')
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = setTimeout(() => {
              setSyncStatus('Connected')
            }, 300)
          }
        }

        channelRef.current.addEventListener('message', handleMessage)

        return () => {
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
          if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
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
          setSyncStatus('Syncing')

          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
          syncTimeoutRef.current = setTimeout(() => {
            setSyncStatus('Connected')
          }, 300)
        } catch (err) {
          setSyncStatus('Local-Only')
        }
      }
    },
    [sessionId, isCapturing],
  )

  return { syncStatus, sendBatch, remoteData, remoteStats, isReceiving }
}
