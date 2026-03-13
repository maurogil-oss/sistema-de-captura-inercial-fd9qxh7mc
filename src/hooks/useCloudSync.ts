import { useState, useEffect, useCallback, useRef } from 'react'
import { TripEvent } from './useInertialSensors'

export type SyncStatus =
  | 'Offline'
  | 'Aguardando dados de telemetria...'
  | 'Antena Ociosa (Edge AI)'
  | 'Transmitindo Evento Crítico'
  | 'Resumo de Viagem Enviado'
  | 'Recebendo Evento Crítico'
  | 'Resumo de Viagem Recebido'
  | 'Conexão Perdida'
  | 'Apenas Local'

export function useCloudSync(sessionId: string, isCapturing: boolean) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<any[]>([])
  const [remoteStats, setRemoteStats] = useState<any>(null)
  const [remoteEventLog, setRemoteEventLog] = useState<TripEvent[]>([])
  const [isReceiving, setIsReceiving] = useState(false)

  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const connectionLostTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isCapturingRef = useRef(isCapturing)

  useEffect(() => {
    isCapturingRef.current = isCapturing
    if (isCapturing) {
      setSyncStatus('Antena Ociosa (Edge AI)')
    } else {
      setSyncStatus('Aguardando dados de telemetria...')
    }
  }, [isCapturing])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const dbKey = `orbis_cloud_db_${sessionId}`

    const processPayload = (payloadStr: string) => {
      if (isCapturingRef.current) return
      try {
        const payload = JSON.parse(payloadStr)

        if (payload.type === 'TRIP_SUMMARY') {
          setRemoteData(payload.data)
          setSyncStatus('Resumo de Viagem Recebido')
        } else {
          setRemoteData((prev) => {
            const merged = [...prev, ...payload.data]
            return merged.slice(-60)
          })
          setSyncStatus('Recebendo Evento Crítico')
        }

        setRemoteStats(payload.stats)
        if (payload.events && Array.isArray(payload.events)) {
          setRemoteEventLog(payload.events)
        }

        setIsReceiving(true)

        if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
        receivingTimeoutRef.current = setTimeout(() => {
          setIsReceiving(false)
          if (!isCapturingRef.current) setSyncStatus('Aguardando dados de telemetria...')
        }, 2500)

        if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
        connectionLostTimeoutRef.current = setTimeout(() => {
          if (!isCapturingRef.current) setSyncStatus('Conexão Perdida')
        }, 15000)
      } catch (e) {
        // ignore
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === dbKey && e.newValue) {
        processPayload(e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    let channel: BroadcastChannel | null = null
    if (window.BroadcastChannel) {
      channel = new BroadcastChannel('orbis_cloud_sync')
      channel.onmessage = (event) => {
        const { type, sId, payload } = event.data
        if (sId === sessionId && type === 'SYNC_EVENT' && !isCapturingRef.current) {
          processPayload(JSON.stringify(payload))
        }
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (channel) channel.close()
      if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
      if (connectionLostTimeoutRef.current) clearTimeout(connectionLostTimeoutRef.current)
    }
  }, [sessionId])

  const sendEvent = useCallback(
    (data: any[], stats: any, events: TripEvent[], type: 'CRITICAL_EVENT' | 'TRIP_SUMMARY') => {
      if (isCapturingRef.current) {
        try {
          const payload = { data, stats, events, type, timestamp: Date.now() }
          localStorage.setItem(`orbis_cloud_db_${sessionId}`, JSON.stringify(payload))

          if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('orbis_cloud_sync')
            channel.postMessage({
              type: 'SYNC_EVENT',
              sId: sessionId,
              payload,
            })
            channel.close()
          }

          setSyncStatus(
            type === 'CRITICAL_EVENT' ? 'Transmitindo Evento Crítico' : 'Resumo de Viagem Enviado',
          )
          setTimeout(() => {
            if (isCapturingRef.current) setSyncStatus('Antena Ociosa (Edge AI)')
          }, 2000)
        } catch (err) {
          setSyncStatus('Apenas Local')
        }
      }
    },
    [sessionId],
  )

  return { syncStatus, sendEvent, remoteData, remoteStats, remoteEventLog, isReceiving }
}
