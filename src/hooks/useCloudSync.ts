import { useState, useEffect, useCallback, useRef } from 'react'

export type SyncStatus =
  | 'Offline'
  | 'Aguardando dados de telemetria...'
  | 'Conectado: Recebendo dados'
  | 'Conexão Perdida'
  | 'Apenas Local'

export function useCloudSync(sessionId: string, isCapturing: boolean) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<any[]>([])
  const [remoteStats, setRemoteStats] = useState<any>(null)
  const [isReceiving, setIsReceiving] = useState(false)

  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const connectionLostTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const dbKey = `orbis_cloud_db_${sessionId}`
    setSyncStatus('Aguardando dados de telemetria...')

    const processPayload = (payloadStr: string) => {
      if (isCapturing) return
      try {
        const payload = JSON.parse(payloadStr)
        setRemoteData(payload.data)
        setRemoteStats(payload.stats)

        setIsReceiving(true)
        setSyncStatus('Conectado: Recebendo dados')

        if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
        receivingTimeoutRef.current = setTimeout(() => {
          setIsReceiving(false)
        }, 1500)

        if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
        connectionLostTimeoutRef.current = setTimeout(() => {
          setSyncStatus('Conexão Perdida')
        }, 5000)
      } catch (e) {
        // ignore
      }
    }

    // Cloud database listener mock (cross-tab/cross-window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === dbKey && e.newValue) {
        processPayload(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const initialData = localStorage.getItem(dbKey)
    if (initialData && !isCapturing) {
      try {
        const payload = JSON.parse(initialData)
        const isStale = Date.now() - payload.timestamp > 5000
        if (!isStale) {
          processPayload(initialData)
        }
      } catch (err) {
        // ignore
      }
    }

    // High-frequency fast path (fallback for same browser)
    let channel: BroadcastChannel | null = null
    if (window.BroadcastChannel) {
      channel = new BroadcastChannel('orbis_cloud_sync')
      channel.onmessage = (event) => {
        const { type, sId, payload } = event.data
        if (sId === sessionId && type === 'SYNC_BATCH' && !isCapturing) {
          setRemoteData(payload.data)
          setRemoteStats(payload.stats)
          setIsReceiving(true)
          setSyncStatus('Conectado: Recebendo dados')

          if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
          receivingTimeoutRef.current = setTimeout(() => {
            setIsReceiving(false)
          }, 1500)

          if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
          connectionLostTimeoutRef.current = setTimeout(() => {
            setSyncStatus('Conexão Perdida')
          }, 5000)
        }
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (channel) channel.close()
      if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
      if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
    }
  }, [sessionId, isCapturing])

  const sendBatch = useCallback(
    (data: any[], stats: any) => {
      if (isCapturing) {
        try {
          const payload = { data, stats, timestamp: Date.now() }
          // Write to cloud mock
          localStorage.setItem(`orbis_cloud_db_${sessionId}`, JSON.stringify(payload))

          if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('orbis_cloud_sync')
            channel.postMessage({
              type: 'SYNC_BATCH',
              sId: sessionId,
              payload,
            })
            channel.close()
          }

          setSyncStatus('Conectado: Recebendo dados')
        } catch (err) {
          setSyncStatus('Apenas Local')
        }
      }
    },
    [sessionId, isCapturing],
  )

  return { syncStatus, sendBatch, remoteData, remoteStats, isReceiving }
}
