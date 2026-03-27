import { useState, useEffect, useCallback, useRef } from 'react'
import { SkipCloud } from '@/lib/skip-cloud'
import { TripEvent } from './useInertialSensors'

export type SyncStatus =
  | 'Offline'
  | 'Aguardando dados...'
  | 'Ocioso (Edge AI)'
  | 'Sincronizando...'
  | 'Conectado à Nuvem'
  | 'Recebendo Atualizações'
  | 'Erro de Conexão'

export function useCloudSync(sessionId: string, isCapturing: boolean) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<any[]>([])
  const [remoteStats, setRemoteStats] = useState<any>(null)
  const [remoteEventLog, setRemoteEventLog] = useState<TripEvent[]>([])
  const [isReceiving, setIsReceiving] = useState(false)

  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isCapturingRef = useRef(isCapturing)

  useEffect(() => {
    isCapturingRef.current = isCapturing
    if (isCapturing) {
      setSyncStatus('Ocioso (Edge AI)')
    } else {
      setSyncStatus('Aguardando dados...')
    }
  }, [isCapturing])

  // Connection Error Handling
  useEffect(() => {
    const handleOffline = () => setSyncStatus('Erro de Conexão')
    const handleOnline = () =>
      setSyncStatus(isCapturingRef.current ? 'Ocioso (Edge AI)' : 'Aguardando dados...')

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Initial fetch and subscription
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return

    const fetchInitialData = async () => {
      try {
        const result = await SkipCloud.collection('telemetry').getList(1, 1, {
          filter: `sessionId = '${sessionId}'`,
          sort: '-created',
        })

        if (result.items.length > 0 && !isCapturingRef.current) {
          const latest = result.items[0]
          if (latest.data) setRemoteData(latest.data)
          if (latest.stats) setRemoteStats(latest.stats)
          if (latest.events) setRemoteEventLog(latest.events)
          setSyncStatus('Conectado à Nuvem')
        }
      } catch (error) {
        console.error('Failed to fetch initial telemetry data', error)
      }
    }

    fetchInitialData()

    // Subscribe to real-time Skip Cloud (PocketBase) updates
    const unsubscribe = SkipCloud.collection('telemetry').subscribe(
      `sessionId = '${sessionId}'`,
      (event) => {
        if (isCapturingRef.current) return // Sender doesn't need to receive its own updates

        const payload = event.record

        setRemoteData((prev) => {
          if (payload.type === 'TRIP_SUMMARY') return payload.data
          const merged = [...prev, ...(payload.data || [])]
          return merged.slice(-60)
        })

        if (payload.stats) setRemoteStats(payload.stats)
        if (payload.events) setRemoteEventLog(payload.events)

        setIsReceiving(true)
        setSyncStatus('Recebendo Atualizações')

        if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
        receivingTimeoutRef.current = setTimeout(() => {
          setIsReceiving(false)
          if (!isCapturingRef.current && navigator.onLine) setSyncStatus('Conectado à Nuvem')
        }, 2500)
      },
    )

    return () => {
      unsubscribe()
      if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
    }
  }, [sessionId])

  const sendEvent = useCallback(
    async (
      data: any[],
      stats: any,
      events: TripEvent[],
      type: 'CRITICAL_EVENT' | 'TRIP_SUMMARY' | 'TELEMETRY_UPDATE',
    ) => {
      if (!isCapturingRef.current) return

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus('Erro de Conexão')
        return
      }

      try {
        setSyncStatus('Sincronizando...')
        await SkipCloud.collection('telemetry').create({
          sessionId,
          type,
          data,
          stats,
          events,
        })

        setTimeout(() => {
          if (isCapturingRef.current && navigator.onLine) setSyncStatus('Ocioso (Edge AI)')
        }, 600)
      } catch (err) {
        setSyncStatus('Erro de Conexão')
      }
    },
    [sessionId],
  )

  return { syncStatus, sendEvent, remoteData, remoteStats, remoteEventLog, isReceiving }
}
