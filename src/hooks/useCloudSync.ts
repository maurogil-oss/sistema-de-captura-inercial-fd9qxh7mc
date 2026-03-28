import { useState, useEffect, useCallback, useRef } from 'react'
import { SkipCloud, ConnectionStatus } from '@/lib/skip-cloud'
import { TripEvent } from './useInertialSensors'

export type SyncStatus =
  | 'Offline'
  | 'Conectando...'
  | 'Aguardando dispositivo móvel'
  | 'Aguardando dados...'
  | 'Ocioso (Edge AI)'
  | 'Sincronizando...'
  | 'Online'
  | 'Recebendo Atualizações'
  | 'Reconectando...'
  | 'Erro de Conexão'

export function useCloudSync(sessionId: string, isCapturing: boolean, retryTrigger: number = 0) {
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
      setSyncStatus((prev) =>
        prev === 'Erro de Conexão' || prev === 'Conectando...' || prev === 'Reconectando...'
          ? prev
          : mobileConnected
            ? 'Aguardando dados...'
            : 'Aguardando dispositivo móvel',
      )
    }
  }, [isCapturing, mobileConnected])

  // Connection Error Handling
  useEffect(() => {
    const handleOffline = () => setSyncStatus('Erro de Conexão')
    const handleOnline = () => {
      // Re-trigger visual update. SkipCloud will auto-reconnect EventSource and trigger onConnectionChange
    }

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

    setRemoteData([])
    setRemoteStats(null)
    setRemoteEventLog([])
    setMobileConnected(false)
    setSyncStatus(isCapturingRef.current ? 'Ocioso (Edge AI)' : 'Conectando...')
    setIsOnline(false)

    let isMounted = true

    const fetchInitialData = async (retryCount = 0) => {
      try {
        const result = await SkipCloud.collection('telemetry').getList(1, 1, {
          filter: `sessionId = '${sessionId}'`,
          sort: '-created',
        })

        if (!isMounted) return

        if (result.items.length > 0 && !isCapturingRef.current) {
          const latest = result.items[0]
          const hasData = latest.data && latest.data.length > 0

          const timeSinceCreated = Date.now() - new Date(latest.created).getTime()
          const isRecent = timeSinceCreated < 5000

          if (isRecent && (latest.type === 'PRESENCE' || hasData)) {
            setMobileConnected(true)
            lastHeartbeatRef.current = Date.now()
          }

          if (latest.data) setRemoteData(latest.data)
          if (latest.stats) setRemoteStats(latest.stats)
          if (latest.events) setRemoteEventLog(latest.events)

          if (isRecent) {
            setSyncStatus(hasData ? 'Online' : 'Aguardando dados...')
          } else {
            setSyncStatus('Aguardando dispositivo móvel')
          }
        } else if (!isCapturingRef.current) {
          setSyncStatus('Aguardando dispositivo móvel')
        }
      } catch (error) {
        if (!isMounted) return
        if (retryCount < 3) {
          console.warn(`SkipCloud: Fetch failed, retrying (${retryCount + 1}/3)...`)
          setTimeout(() => fetchInitialData(retryCount + 1), 3000)
        } else {
          console.error('Failed to fetch initial telemetry data', error)
          setSyncStatus('Erro de Conexão')
          setIsOnline(false)
        }
      }
    }

    fetchInitialData()

    SkipCloud.onConnectionChange((status: ConnectionStatus) => {
      if (!isMounted) return
      setIsOnline(status === 'connected')

      setSyncStatus((prev) => {
        if (status === 'error') return 'Erro de Conexão'
        if (status === 'reconnecting') return 'Reconectando...'
        if (status === 'connecting') return 'Conectando...'

        // if connected
        if (!isCapturingRef.current) {
          return mobileConnectedRef.current
            ? prev === 'Aguardando dados...'
              ? prev
              : 'Online'
            : 'Aguardando dispositivo móvel'
        }
        return 'Ocioso (Edge AI)'
      })
    })

    // Subscribe to real-time Skip Cloud (PocketBase) updates
    const unsubscribe = SkipCloud.collection('telemetry').subscribe(
      `sessionId = '${sessionId}'`,
      (event) => {
        if (isCapturingRef.current) return

        const payload = event.record

        lastHeartbeatRef.current = Date.now()
        setIsOnline(true)

        if (payload.type === 'PRESENCE') {
          setMobileConnected(true)
          if (!isCapturingRef.current && navigator.onLine) {
            setSyncStatus((prev) =>
              prev === 'Aguardando dispositivo móvel' ||
              prev === 'Offline' ||
              prev === 'Conectando...' ||
              prev === 'Reconectando...'
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
          return merged.slice(-60) // Keep last 60 points for charts
        })

        if (payload.stats) setRemoteStats(payload.stats)
        if (payload.events) setRemoteEventLog(payload.events)

        setIsReceiving(true)
        setSyncStatus('Recebendo Atualizações')

        if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
        receivingTimeoutRef.current = setTimeout(() => {
          setIsReceiving(false)
          if (!isCapturingRef.current && navigator.onLine) setSyncStatus('Online')
        }, 500)
      },
    )

    return () => {
      isMounted = false
      unsubscribe()
      if (receivingTimeoutRef.current) clearTimeout(receivingTimeoutRef.current)
    }
  }, [sessionId, retryTrigger])

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
            prev !== 'Erro de Conexão' && prev !== 'Reconectando...' && prev !== 'Conectando...'
              ? 'Aguardando dispositivo móvel'
              : prev,
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
        }, 500)
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
