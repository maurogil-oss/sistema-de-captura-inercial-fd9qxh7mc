import { useState, useEffect, useCallback, useRef } from 'react'
import { z } from 'zod'
import { pb, ConnectionStatus, SkipCloudError } from '@/lib/skip-cloud'
import { FFTFeatures } from '@/lib/fft'
import { useDebug } from '@/stores/DebugContext'

export type SyncStatus =
  | 'Offline'
  | 'Connecting'
  | 'Connected'
  | 'Creating Transmission'
  | 'Transmission Active'
  | 'Retrying'
  | 'Aguardando dispositivo móvel'

export type SyncErrorType =
  | 'none'
  | 'timeout'
  | 'auth'
  | 'cors'
  | 'server'
  | 'serialization'
  | 'payload_size'
  | 'buffer_full'
  | 'network'
  | 'schema'

export interface TelemetryPoint {
  timestamp: string
  features: FFTFeatures
  quality: {
    signalConfidence: number
    anomalyScore: number
  }
}

export interface TelemetryPayload {
  deviceId: string
  sessionId: string
  transmissionId?: string
  timestamp: string
  sensorType: string
  features?: FFTFeatures
  quality?: {
    signalConfidence: number
    anomalyScore: number
  }
  points?: TelemetryPoint[]
  protocolVersion?: string
}

const payloadSchema = z.object({
  deviceId: z.string().min(1),
  sessionId: z.string().min(1),
  transmissionId: z.string().optional(),
  timestamp: z.string(),
  sensorType: z.string(),
  features: z.any().optional(),
  quality: z.any().optional(),
  points: z.array(z.any()).optional(),
  protocolVersion: z.string().optional(),
})

export function useCloudSync(sessionId: string, isCapturing: boolean, retryTrigger: number = 0) {
  const { addLog } = useDebug()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('Offline')
  const [syncErrorType, setSyncErrorType] = useState<SyncErrorType>('none')
  const [remoteData, setRemoteData] = useState<TelemetryPayload[]>([])
  const [mobileConnected, setMobileConnected] = useState(false)
  const [transmissionId, setTransmissionId] = useState<string | null>(null)

  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [latency, setLatency] = useState(0)
  const [timestampDrift, setTimestampDrift] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const MAX_BUFFER_SIZE = 1000
  const isCapturingRef = useRef(isCapturing)
  const telemetryBuffer = useRef<TelemetryPoint[]>([])
  const mobileConnectedRef = useRef(mobileConnected)
  const lastTimestampRef = useRef<number>(0)
  const syncStatusRef = useRef(syncStatus)
  const transmissionIdRef = useRef(transmissionId)

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
    syncStatusRef.current = syncStatus
  }, [syncStatus])

  useEffect(() => {
    transmissionIdRef.current = transmissionId
  }, [transmissionId])

  // Monitor mode and basic connectivity
  useEffect(() => {
    if (typeof window === 'undefined' || !sessionId) return

    setRemoteData([])
    setMobileConnected(false)
    setTransmissionId(null)
    setSyncStatus('Connecting')
    setSyncErrorType('none')

    let isMounted = true

    const fetchInitialData = async (retryCount = 0) => {
      if (isCapturingRef.current) return
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
        } else {
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

    if (!isCapturingRef.current) {
      fetchInitialData()
    }

    const unsubConnection = pb.onConnectionChange(
      (status: ConnectionStatus, error?: SkipCloudError) => {
        if (!isMounted) return
        if (status === 'error') {
          if (!isCapturingRef.current) setSyncStatus('Offline')
          if (error && error.type) {
            setSyncErrorType(error.type as SyncErrorType)
            addLog('error', `Connection error: ${error.message}`, 'Network')
          } else {
            addLog('error', 'Connection lost to Skip Cloud', 'Network')
          }
        } else if (status === 'reconnecting') {
          if (!isCapturingRef.current) setSyncStatus('Retrying')
        } else if (status === 'connecting') {
          if (!isCapturingRef.current) setSyncStatus('Connecting')
        } else if (status === 'connected') {
          setSyncErrorType('none')
          if (!isCapturingRef.current) {
            setSyncStatus(mobileConnectedRef.current ? 'Connected' : 'Aguardando dispositivo móvel')
            addLog('info', 'Connected to Skip Cloud (Monitor)', 'Network')
          }
        }
      },
    )

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

      setLastSyncTime(new Date().toISOString())

      if (payload.points && Array.isArray(payload.points)) {
        const newPoints = payload.points.map((p) => ({
          ...payload,
          timestamp: p.timestamp,
          features: p.features,
          quality: p.quality,
        }))
        setRemoteData((prev) => [...prev, ...newPoints].slice(-120))
      } else if (payload.features) {
        const { fftPeak, fftEnergy } = payload.features
        if (fftPeak == null || isNaN(fftPeak) || fftEnergy == null || isNaN(fftEnergy)) {
          addLog(
            'error',
            'Received invalid features (null/NaN). Dropping payload.',
            'Data Validation',
          )
          return
        }
        setRemoteData((prev) => [...prev, payload].slice(-120))
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
      unsubConnection()
      pb.collection('telemetry').unsubscribe(`sessionId = '${sessionId}'`)
    }
  }, [sessionId, retryTrigger, addLog])

  // Capturing mode transmission lifecycle
  useEffect(() => {
    if (!isCapturing || !sessionId) return

    let isMounted = true

    const initConnection = () => {
      if (!isMounted) return
      setSyncStatus('Connecting')
      addLog('info', 'initConnection: Initiating connection sequence...', 'Network')
      if (pb.connectionStatus === 'connected') {
        waitForConnected('connected')
      }
    }

    const createTransmission = async () => {
      if (!isMounted) return
      setSyncStatus('Creating Transmission')
      addLog('info', 'createTransmission: Requesting new transmission ID...', 'Network')
      try {
        const res = await pb.collection('transmissions').create({
          sessionId,
          status: 'active',
          startedAt: new Date().toISOString(),
        })
        if (res && res.id) {
          confirmTransmissionId(res.id)
        } else {
          throw new Error('No ID returned from server')
        }
      } catch (err: any) {
        if (!isMounted) return
        addLog('error', `Failed at createTransmission: ${err.message}`, 'Network')
        setSyncStatus('Retrying')
        setTimeout(() => retryOnFailure('createTransmission'), 3000)
      }
    }

    const confirmTransmissionId = (id: string) => {
      if (!isMounted) return
      addLog('info', `confirmTransmissionId: Validating ID ${id}...`, 'Network')
      if (id) {
        setTransmissionId(id)
        setSyncStatus('Transmission Active')
        addLog('info', `Transmission confirmed and active: ${id}`, 'Network')
      } else {
        addLog('error', 'Failed at confirmTransmissionId: Invalid ID', 'Network')
        setSyncStatus('Retrying')
        setTimeout(() => retryOnFailure('confirmTransmissionId'), 3000)
      }
    }

    const retryOnFailure = (step: string) => {
      if (!isMounted) return
      addLog('warning', `retryOnFailure: Retrying step ${step}...`, 'Network')
      if (step === 'createTransmission') createTransmission()
      if (step === 'confirmTransmissionId') createTransmission()
    }

    const waitForConnected = (status: ConnectionStatus) => {
      if (!isMounted) return
      if (status === 'connected') {
        if (
          syncStatusRef.current !== 'Transmission Active' &&
          syncStatusRef.current !== 'Creating Transmission'
        ) {
          setSyncStatus('Connected')
          addLog('info', 'waitForConnected: Connection established.', 'Network')
          createTransmission()
        }
      } else if (status === 'connecting' || status === 'reconnecting') {
        setSyncStatus(status === 'reconnecting' ? 'Retrying' : 'Connecting')
        setTransmissionId(null)
      } else if (status === 'error') {
        setSyncStatus('Offline')
        setTransmissionId(null)
      }
    }

    const unsub = pb.onConnectionChange((status) => {
      waitForConnected(status)
    })

    initConnection()

    return () => {
      isMounted = false
      unsub()
    }
  }, [isCapturing, sessionId, addLog])

  const forceReconnect = useCallback(() => {
    addLog('info', 'Forcing reconnection to Skip Cloud...', 'Network')
    setSyncErrorType('none')
    pb.reconnect()
  }, [addLog])

  const flushBuffer = useCallback(async () => {
    if (!isCapturingRef.current) return
    if (telemetryBuffer.current.length === 0) return
    if (syncStatusRef.current !== 'Transmission Active' || !transmissionIdRef.current) return

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('Offline')
      return
    }

    setIsSyncing(true)
    const batchSize = Math.min(telemetryBuffer.current.length, 100)
    const pointsToSync = telemetryBuffer.current.slice(0, batchSize)

    const payload: TelemetryPayload = {
      deviceId: sessionId,
      sessionId: sessionId,
      transmissionId: transmissionIdRef.current,
      timestamp: new Date().toISOString(),
      sensorType: 'inertial',
      points: pointsToSync,
      protocolVersion: '1.1.0',
    }

    try {
      let serialized = JSON.stringify(payload)
      const payloadSize = new Blob([serialized]).size
      if (payloadSize > 100 * 1024) {
        addLog('error', `Batch Payload Too Large: ${payloadSize} bytes`, 'Network')
        setSyncErrorType('payload_size')
        telemetryBuffer.current = telemetryBuffer.current.slice(batchSize)
        setPendingSyncCount(telemetryBuffer.current.length)
        setIsSyncing(false)
        return
      }

      await pb.collection('telemetry').create(payload)

      telemetryBuffer.current = telemetryBuffer.current.slice(batchSize)
      setPendingSyncCount(telemetryBuffer.current.length)
      setLastSyncTime(new Date().toISOString())
      setSyncStatus('Transmission Active')
      setSyncErrorType('none')
    } catch (err: any) {
      setSyncStatus('Retrying')
      if (err.type) {
        setSyncErrorType(err.type as SyncErrorType)
        addLog('error', `Batch transmission failed: ${err.message}`, 'Network')
      } else {
        setSyncErrorType('network')
        addLog('error', 'Failed to send batch. Kept in buffer.', 'Network')
      }
    } finally {
      setIsSyncing(false)
    }
  }, [sessionId, addLog])

  useEffect(() => {
    if (!isCapturing) return
    const interval = setInterval(() => {
      flushBuffer()
    }, 5000)
    return () => clearInterval(interval)
  }, [isCapturing, flushBuffer])

  const sendTelemetry = useCallback(
    (payload: TelemetryPayload) => {
      if (!isCapturingRef.current) return

      if (telemetryBuffer.current.length >= MAX_BUFFER_SIZE) {
        addLog(
          'error',
          'Local buffer full. Dropping telemetry data to prevent memory overflow.',
          'Memory',
        )
        setSyncErrorType('buffer_full')
        return
      }

      if (!payload.features || !payload.quality) return

      const point: TelemetryPoint = {
        timestamp: payload.timestamp,
        features: payload.features,
        quality: payload.quality,
      }

      telemetryBuffer.current.push(point)
      setPendingSyncCount(telemetryBuffer.current.length)
    },
    [addLog],
  )

  return {
    syncStatus,
    syncErrorType,
    sendTelemetry,
    remoteData,
    mobileConnected,
    pendingSyncCount,
    latency,
    timestampDrift,
    forceReconnect,
    isSyncing,
    lastSyncTime,
  }
}
