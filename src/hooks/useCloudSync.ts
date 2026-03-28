import { useState, useEffect, useCallback, useRef } from 'react'
import { pb, ConnectionStatus } from '@/lib/skip-cloud'
import { FFTFeatures } from '@/lib/fft'

export type SyncStatus =
  | 'Offline'
  | 'Conectando...'
  | 'Connected'
  | 'Reconnecting'
  | 'Aguardando dispositivo móvel'

export interface TelemetryPayload {
  deviceId: string
  sessionId: string
  timestamp: string
  sensorType: string
  features: FFTFeatures
  quality: {
    signalConfidence: number
    anomalyScore: number
  }
}

export function useCloudSync(sessionId: string, isCapturing: boolean, retryTrigger: number = 0) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [remoteData, setRemoteData] = useState<TelemetryPayload[]>([])
  const [mobileConnected, setMobileConnected] = useState(false)

  const isCapturingRef = useRef(isCapturing)
  const mobileConnectedRef = useRef(mobileConnected)

  useEffect(() => {
    mobileConnectedRef.current = mobileConnected
  }, [mobileConnected])

  useEffect(() => {
    isCapturingRef.current = isCapturing
    if (!isCapturing && !mobileConnected) {
      setSyncStatus('Aguardando dispositivo móvel')
    }
  }, [isCapturing, mobileConnected])

  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return

    setRemoteData([])
    setMobileConnected(false)
    setSyncStatus('Conectando...')

    let isMounted = true

    const fetchInitialData = async (retryCount = 0) => {
      try {
        const result = await pb.collection('telemetry').getList(1, 50, {
          filter: `sessionId = '${sessionId}'`,
          sort: '-created',
        })

        if (!isMounted) return

        if (result.items.length > 0) {
          setMobileConnected(true)
          const validItems = result.items
            .filter((i) => i.features)
            .reverse() as unknown as TelemetryPayload[]
          setRemoteData(validItems)
          setSyncStatus('Connected')
        } else if (!isCapturingRef.current) {
          setSyncStatus('Aguardando dispositivo móvel')
        }
      } catch (error) {
        if (!isMounted) return
        if (retryCount < 3) {
          // Silent re-validation
          setTimeout(() => fetchInitialData(retryCount + 1), 2000)
        } else {
          setSyncStatus('Offline')
        }
      }
    }

    fetchInitialData()

    pb.onConnectionChange((status: ConnectionStatus) => {
      if (!isMounted) return
      if (status === 'error') setSyncStatus('Offline')
      if (status === 'reconnecting') setSyncStatus('Reconnecting')
      if (status === 'connecting') setSyncStatus('Conectando...')
      if (status === 'connected')
        setSyncStatus(mobileConnectedRef.current ? 'Connected' : 'Aguardando dispositivo móvel')
    })

    // Subscribe to real-time events
    pb.collection('telemetry').subscribe(`sessionId = '${sessionId}'`, (event: any) => {
      if (isCapturingRef.current) return

      const payload = event.record as TelemetryPayload
      setMobileConnected(true)
      setSyncStatus('Connected')

      if (payload.features) {
        setRemoteData((prev) => [...prev, payload].slice(-60))
      }
    })

    return () => {
      isMounted = false
      pb.collection('telemetry').unsubscribe(`sessionId = '${sessionId}'`)
    }
  }, [sessionId, retryTrigger])

  const sendPayload = useCallback(async (payload: TelemetryPayload) => {
    if (!isCapturingRef.current) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('Offline')
      return
    }

    try {
      await pb.collection('telemetry').create(payload)
      if (navigator.onLine) setSyncStatus('Connected')
    } catch (err) {
      setSyncStatus('Offline')
    }
  }, [])

  return { syncStatus, sendPayload, remoteData, mobileConnected }
}
