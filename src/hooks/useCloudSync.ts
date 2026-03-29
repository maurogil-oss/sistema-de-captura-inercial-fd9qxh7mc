import { useState, useEffect, useCallback, useRef } from 'react'
import { z } from 'zod'
import { pb, ConnectionStatus, SkipCloudError } from '@/lib/skip-cloud'
import { FFTFeatures } from '@/lib/fft'
import { useDebug } from '@/stores/DebugContext'

export type SyncStatus =
  | 'Offline'
  | 'Conectando...'
  | 'Connected'
  | 'Reconnecting'
  | 'Aguardando dispositivo móvel'

export type SyncErrorType =
  | 'none'
  | 'timeout'
  | 'auth'
  | 'cors'
  | 'server'
  | 'serialization'
  | 'payload_size'
  | 'network'
  | 'schema'

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
  protocolVersion?: string
}

const payloadSchema = z.object({
  deviceId: z.string().min(1),
  sessionId: z.string().min(1),
  timestamp: z.string(),
  sensorType: z.string(),
  features: z
    .object({
      fftPeak: z.number().nullable().optional(),
      fftEnergy: z.number().nullable().optional(),
    })
    .passthrough(),
  quality: z.object({
    signalConfidence: z.number(),
    anomalyScore: z.number(),
  }),
  protocolVersion: z.string().optional(),
})

export function useCloudSync(sessionId: string, isCapturing: boolean, retryTrigger: number = 0) {
  const { addLog } = useDebug()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [syncErrorType, setSyncErrorType] = useState<SyncErrorType>('none')
  const [remoteData, setRemoteData] = useState<TelemetryPayload[]>([])
  const [mobileConnected, setMobileConnected] = useState(false)

  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [latency, setLatency] = useState(0)
  const [timestampDrift, setTimestampDrift] = useState(0)

  const isCapturingRef = useRef(isCapturing)
  const offlineQueue = useRef<TelemetryPayload[]>([])
  const mobileConnectedRef = useRef(mobileConnected)
  const lastTimestampRef = useRef<number>(0)

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
    setSyncErrorType('none')

    let isMounted = true

    const fetchInitialData = async (retryCount = 0) => {
      try {
        const result = await pb.collection('telemetry').getList(1, 50, {
          filter: `sessionId = '${sessionId}'`,
          sort: '-created',
        })

        if (!isMounted) return
        setSyncErrorType('none')

        if (result.items.length > 0) {
          setMobileConnected(true)
          const validItems = result.items
            .filter((i: any) => i.features)
            .reverse() as unknown as TelemetryPayload[]
          setRemoteData(validItems)
          setSyncStatus('Connected')
        } else if (!isCapturingRef.current) {
          setSyncStatus('Aguardando dispositivo móvel')
        }
      } catch (error: any) {
        if (!isMounted) return
        if (error.type) {
          setSyncErrorType(error.type as SyncErrorType)
          addLog('error', `Initial sync failed: ${error.message}`, 'Network')
        }
        if (retryCount < 3) {
          setTimeout(() => fetchInitialData(retryCount + 1), 2000)
        } else {
          setSyncStatus('Offline')
        }
      }
    }

    fetchInitialData()

    pb.onConnectionChange((status: ConnectionStatus, error?: SkipCloudError) => {
      if (!isMounted) return
      if (status === 'error') {
        setSyncStatus('Offline')
        if (error && error.type) {
          setSyncErrorType(error.type as SyncErrorType)
          addLog('error', `Connection error: ${error.message}`, 'Network')
        } else {
          addLog('error', 'Connection lost to Skip Cloud', 'Network')
        }
      }
      if (status === 'reconnecting') setSyncStatus('Reconnecting')
      if (status === 'connecting') setSyncStatus('Conectando...')
      if (status === 'connected') {
        setSyncStatus(mobileConnectedRef.current ? 'Connected' : 'Aguardando dispositivo móvel')
        setSyncErrorType('none')
        addLog('info', 'Connected to Skip Cloud', 'Network')
      }
    })

    pb.collection('telemetry').subscribe(`sessionId = '${sessionId}'`, (event: any) => {
      if (isCapturingRef.current) return

      const payload = event.record as TelemetryPayload
      setMobileConnected(true)
      setSyncStatus('Connected')
      setSyncErrorType('none')

      if (payload.protocolVersion && payload.protocolVersion !== '1.0.0') {
        addLog(
          'warning',
          `Protocol version mismatch: Expected 1.0.0, got ${payload.protocolVersion}`,
          'Protocol',
        )
      }

      if (payload.timestamp) {
        const currentTimestamp = new Date(payload.timestamp).getTime()
        if (lastTimestampRef.current && currentTimestamp < lastTimestampRef.current) {
          addLog('warning', 'Out-of-order packet detected (timestamp older than previous)', 'Sync')
        }
        lastTimestampRef.current = currentTimestamp

        const drift = Math.abs(Date.now() - currentTimestamp)
        setTimestampDrift(drift)
        if (drift > 500) {
          addLog('warning', `High timestamp drift detected: ${drift}ms (> 500ms)`, 'Sync')
        }
      }

      if (payload.features) {
        const { fftPeak, fftEnergy } = payload.features
        if (fftPeak == null || isNaN(fftPeak) || fftEnergy == null || isNaN(fftEnergy)) {
          addLog(
            'error',
            'Received invalid features (null/NaN). Dropping payload.',
            'Data Validation',
          )
          return
        }
        setRemoteData((prev) => [...prev, payload].slice(-60))
      }
    })

    const latencyInterval = setInterval(async () => {
      const start = Date.now()
      try {
        await pb.collection('telemetry').getList(1, 1)
        const ms = Date.now() - start
        setLatency(ms)
        if (ms > 1000) addLog('warning', `High API latency: ${ms}ms`, 'Network')
        setSyncErrorType('none')
      } catch (err: any) {
        setLatency(-1)
        if (err.type) {
          setSyncErrorType(err.type as SyncErrorType)
          addLog('error', `API health check failed: ${err.message}`, 'Network')
        } else {
          addLog('error', 'API health check failed', 'Network')
        }
      }
    }, 5000)

    return () => {
      isMounted = false
      clearInterval(latencyInterval)
      pb.collection('telemetry').unsubscribe(`sessionId = '${sessionId}'`)
    }
  }, [sessionId, retryTrigger, addLog])

  const sendPayload = useCallback(
    async (payload: TelemetryPayload) => {
      if (!isCapturingRef.current) return

      payload.protocolVersion = '1.0.0'

      try {
        payloadSchema.parse(payload)
      } catch (err) {
        addLog('error', 'Payload schema validation failed: Missing required fields', 'Validation')
        setSyncErrorType('schema')
        return
      }

      let serialized = ''
      try {
        serialized = JSON.stringify(payload)
      } catch (err) {
        addLog('error', 'Payload serialization failed (Invalid JSON)', 'Serialization')
        setSyncErrorType('serialization')
        return
      }

      const payloadSize = new Blob([serialized]).size
      if (payloadSize > 100 * 1024) {
        addLog('error', `Payload Too Large: ${payloadSize} bytes`, 'Network')
        setSyncErrorType('payload_size')
        return
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        offlineQueue.current.push(payload)
        setPendingSyncCount(offlineQueue.current.length)
        setSyncStatus('Offline')
        addLog('warning', 'Device offline. Payload queued.', 'Network')
        return
      }

      try {
        if (offlineQueue.current.length > 0) {
          addLog('info', `Flushing ${offlineQueue.current.length} queued payloads...`, 'Network')
          for (const p of offlineQueue.current) {
            await pb.collection('telemetry').create(p)
          }
          offlineQueue.current = []
          setPendingSyncCount(0)
        }

        await pb.collection('telemetry').create(payload)
        if (navigator.onLine) {
          setSyncStatus('Connected')
          setSyncErrorType('none')
        }
      } catch (err: any) {
        offlineQueue.current.push(payload)
        setPendingSyncCount(offlineQueue.current.length)
        setSyncStatus('Offline')

        if (err.type) {
          setSyncErrorType(err.type as SyncErrorType)
          addLog('error', `Transmission failed: ${err.message}`, 'Network')
        } else {
          setSyncErrorType('network')
          addLog('error', 'Failed to send payload. Queued.', 'Network')
        }
      }
    },
    [addLog],
  )

  const forceReconnect = useCallback(() => {
    addLog('info', 'Forcing reconnection to Skip Cloud...', 'Network')
    setSyncErrorType('none')
    pb.reconnect()
  }, [addLog])

  return {
    syncStatus,
    syncErrorType,
    sendPayload,
    remoteData,
    mobileConnected,
    pendingSyncCount,
    latency,
    timestampDrift,
    forceReconnect,
  }
}
