import { useState, useEffect, useCallback, useRef } from 'react'
import { SkipCloud } from '@/lib/skip-cloud'
import { TripEvent } from './useInertialSensors'

export type SyncStatus =
  | 'Offline'
  | 'Aguardando dispositivo móvel'
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
  const [mobileConnected, setMobileConnected] = useState(false)
  const [isOnline, setIsOnline] = useState(false)

  const receivingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isCapturingRef = useRef(isCapturing)
  const lastHeartbeatRef = useRef<number>(0)
  const mobileConnectedRef = useRef(mobileConnected)

  useEffect(() => {
    mobileConnectedRef.current = mobileConnected
  }, [mobileConnected])

  useEffect(() => {
    isCapturingRef.current = isCapturing
    if (isCapturing) {
      setSyncStatus('Ocioso (Edge AI)')
    } else {
      setSyncStatus(mobileConnected ? 'Aguardando dados...' : 'Aguardando dispositivo móvel')
    }
  }, [isCapturing, mobileConnected])

  // Connection Error Handling
  useEffect(() => {
    const handleOffline = () => setSyncStatus('Erro de Conexão')
    const handleOnline = () =>
      setSyncStatus(
        isCapturingRef.current
          ? 'Ocioso (Edge AI)'
          : mobileConnected
            ? 'Aguardando dados...'
            : 'Aguardando dispositivo móvel',
      )

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [mobileConnected])

  // Initial fetch and subscription
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return

    setRemoteData([])
    setRemoteStats(null)
    setRemoteEventLog([])
    setMobileConnected(false)
    setSyncStatus(isCapturingRef.current ? 'Ocioso (Edge AI)' : 'Aguardando dispositivo móvel')

    const fetchInitialData = async () => {
      try {
        const result = await SkipCloud.collection('telemetry').getList(1, 1, {
          filter: `sessionId = '${sessionId}'`,
          sort: '-created',
        })

        if (result.items.length > 0 && !isCapturingRef.current) {
          const latest = result.items[0]
          const hasData = latest.data && latest.data.length > 0

          const timeSinceCreated = Date.now() - new Date(latest.created).getTime()
          const isRecent = timeSinceCreated < 5000

          if (isRecent && (latest.type === 'PRESENCE' || hasData)) {
            setMobileConnected(true)
            lastHeartbeatRef.current = Date.now()
            setIsOnline(true)
          }

          if (latest.data) setRemoteData(latest.data)
          if (latest.stats) setRemoteStats(latest.stats)
          if (latest.events) setRemoteEventLog(latest.events)

          if (isRecent) {
            setSyncStatus(hasData ? 'Conectado à Nuvem' : 'Aguardando dados...')
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial telemetry data', error)
        setSyncStatus('Erro de Conexão')
        setIsOnline(false)
      }
    }

    fetchInitialData()

    SkipCloud.onConnectionChange((connected) => {
      setIsOnline(connected)
      setSyncStatus((prev) => {
        if (!connected && !isCapturingRef.current) return 'Erro de Conexão'
        if (connected && prev === 'Erro de Conexão') {
          return mobileConnectedRef.current ? 'Aguardando dados...' : 'Aguardando dispositivo móvel'
        }
        return prev
      })
    })

    // Subscribe to real-time Skip Cloud (PocketBase) updates
    const unsubscribe = SkipCloud.collection('telemetry').subscribe(
      `sessionId = '${sessionId}'`,
      (event) => {
        if (isCapturingRef.current) return // Sender doesn't need to receive its own updates

        const payload = event.record

        lastHeartbeatRef.current = Date.now()
        setIsOnline(true)

        if (payload.type === 'PRESENCE') {
          setMobileConnected(true)
          if (!isCapturingRef.current && navigator.onLine) {
            setSyncStatus((prev) =>
              prev === 'Aguardando dispositivo móvel' || prev === 'Offline'
                ? 'Aguardando dados...'
                : prev,
            )
          }
          return
        }

        setRemoteData((prev) => {
          if (payload.type === 'TRIP_SUMMARY') return payload.data
          const newItems = payload.data || []
          if (newItems.length === 0) return prev

          // Efficient merge and deduplicate by time to prevent overlap jitter
          const existingTimes = new Set(prev.map((p) => p.time))
          const uniqueNewItems = newItems.filter((item: any) => !existingTimes.has(item.time))

          const merged = [...prev, ...uniqueNewItems]
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
        }, 1500)
      },
    )

    return () => {
      unsubscribe()
      if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
    }
  }, [sessionId])

  // Heartbeat monitor for receiver
  useEffect(() => {
    if (isCapturing) {
      setIsOnline(navigator.onLine)
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    } else {
      const interval = setInterval(() => {
        if (lastHeartbeatRef.current > 0 && Date.now() - lastHeartbeatRef.current > 5000) {
          setMobileConnected(false)
          setSyncStatus((prev) =>
            prev !== 'Erro de Conexão' ? 'Aguardando dispositivo móvel' : prev,
          )
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isCapturing])

  const sendPresence = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    try {
      await SkipCloud.collection('telemetry').create({
        sessionId,
        type: 'PRESENCE',
        data: [],
        stats: null,
        events: [],
      })
    } catch (err) {
      console.error('Failed to send presence', err)
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

  return {
    syncStatus,
    sendEvent,
    sendPresence,
    remoteData,
    remoteStats,
    remoteEventLog,
    isReceiving,
    mobileConnected,
    isOnline,
  }
}
