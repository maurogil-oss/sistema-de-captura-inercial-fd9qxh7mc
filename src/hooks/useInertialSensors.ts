import { useState, useEffect, useRef, useCallback } from 'react'
import { extractFeatures, FFTFeatures } from '@/lib/fft'
import { useDebug } from '@/stores/DebugContext'
import { useAnomalyStore } from '@/stores/useAnomalyStore'

export interface SensorDataPoint {
  time: string
  timestamp: string
  jerk: number
  gForceZ: number
  lateralForce: number
}

export interface TripEvent {
  id: string
  type: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
}

export type PermissionState = 'idle' | 'granted' | 'denied' | 'unsupported'

const FFT_WINDOW_SIZE = 256
const FFT_OVERLAP = 128

export function useInertialSensors() {
  const { addLog } = useDebug()
  const [isCapturing, setIsCapturing] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<SensorDataPoint[]>([])
  const [fftFeatures, setFftFeatures] = useState<FFTFeatures | null>(null)
  const [zenScore, setZenScore] = useState(100)
  const [potholes, setPotholes] = useState(0)
  const [permissionState, setPermissionState] = useState<PermissionState>('idle')

  const [samplingRate, setSamplingRate] = useState(0)
  const [sensorStatus, setSensorStatus] = useState({ accel: false, gyro: false, mag: false })
  const [isBackgroundMode, setIsBackgroundMode] = useState(false)

  const [roadEvents, setRoadEvents] = useState<TripEvent[]>([])
  const [roadCondition, setRoadCondition] = useState({
    percentage: 100,
    label: 'Smooth' as 'Smooth' | 'Moderate' | 'Rough',
  })
  const [conditionHistory, setConditionHistory] = useState<number[]>([100])

  const framesRef = useRef(0)
  const totalFramesRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())

  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dataRef = useRef<SensorDataPoint[]>([])
  const windowBufferRef = useRef<number[]>([])
  const latestFftRef = useRef<FFTFeatures | null>(null)

  const statsRef = useRef({ zenScore: 100, potholes: 0 })
  const roadAnalysisRef = useRef({
    events: [] as TripEvent[],
    zBuffer: [] as number[],
    lastPotholeTime: 0,
    lastBrakeTime: 0,
    conditionPercentage: 100,
    conditionLabel: 'Smooth' as 'Smooth' | 'Moderate' | 'Rough',
    history: [100] as number[],
  })
  const eventCountRef = useRef(0)
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
      if (!isMobile || !window.DeviceMotionEvent) {
        setPermissionState('unsupported')
      }
    }
  }, [])

  const stopCapture = useCallback(() => {
    setIsCapturing(false)
    setIsWaiting(false)
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    return () => stopCapture()
  }, [stopCapture])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBackgroundMode(true)
        addLog('info', 'App moved to background. SDK Background Service Engine active.', 'Edge AI')
      } else {
        setIsBackgroundMode(false)
        addLog('info', 'App in foreground. Resuming UI updates.', 'Edge AI')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [addLog])

  const requestSensorPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false

    setIsWaiting(true)
    setError(null)

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
      if (!isMobile || !window.DeviceMotionEvent) {
        setPermissionState('unsupported')
        setError('Sensores inerciais não suportados ou hardware ausente.')
        setIsWaiting(false)
        return false
      }

      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const state = await (DeviceMotionEvent as any).requestPermission()
        if (state === 'granted') {
          setPermissionState('granted')
          addLog('info', 'Sensor permissions granted by user', 'Mobile')
          return true
        } else {
          setPermissionState('denied')
          setError('Acesso negado. Habilite nas configurações.')
          addLog('error', 'Sensor permissions denied by user', 'Mobile')
          setIsWaiting(false)
          return false
        }
      } else {
        setPermissionState('granted')
        addLog('info', 'Sensor permissions granted (implicit)', 'Mobile')
        return true
      }
    } catch (e) {
      setPermissionState('denied')
      setError('Acesso negado. Habilite nas configurações.')
      addLog('error', 'Failed to request sensor permissions', 'Mobile')
      setIsWaiting(false)
      return false
    }
  }, [addLog])

  const startCapture = async () => {
    const granted = await requestSensorPermission()
    if (!granted) return

    setIsCapturing(true)
    setIsWaiting(false)
    dataRef.current = []
    windowBufferRef.current = []
    setData([])
    setFftFeatures(null)

    statsRef.current = { zenScore: 100, potholes: 0 }
    roadAnalysisRef.current = {
      events: [],
      zBuffer: [],
      lastPotholeTime: 0,
      conditionPercentage: 100,
      conditionLabel: 'Smooth',
      history: [100],
    }
    setZenScore(100)
    setPotholes(0)
    setRoadEvents([])
    setRoadCondition({ percentage: 100, label: 'Smooth' })
    setConditionHistory([100])

    lastAccelRef.current = null
    lastTimeRef.current = performance.now()
    eventCountRef.current = 0
    framesRef.current = 0
    totalFramesRef.current = 0
    lastFpsTimeRef.current = performance.now()

    addLog('info', 'Started capture. Awaiting sensor data...', 'Sensor')

    checkTimeoutRef.current = setTimeout(() => {
      if (eventCountRef.current === 0) {
        setError('Sensores não estão respondendo (Fallback ativado se houver dados parciais).')
        setPermissionState('unsupported')
        setIsCapturing(false)
        addLog('error', 'Timeout waiting for sensors. Capture aborted.', 'Sensor')
      }
    }, 2000)
  }

  useEffect(() => {
    if (!isCapturing) return

    const handleMotion = (event: DeviceMotionEvent) => {
      eventCountRef.current += 1
      const acc = event.acceleration || event.accelerationIncludingGravity
      if (!acc || acc.x === null) return

      setSensorStatus((s) => {
        if (!s.accel || !s.gyro) {
          addLog('info', 'Accelerometer and Gyroscope responding', 'Sensor')
          return { ...s, accel: true, gyro: true }
        }
        return s
      })

      const now = performance.now()

      framesRef.current++
      totalFramesRef.current++
      if (now - lastFpsTimeRef.current >= 1000) {
        const hz = framesRef.current / ((now - lastFpsTimeRef.current) / 1000)
        setSamplingRate(Math.round(hz))
        if (hz < 30) {
          addLog(
            'warning',
            `Low sampling rate detected: ${Math.round(hz)} Hz (Expected ~60Hz)`,
            'Sensor',
          )
        }
        framesRef.current = 0
        lastFpsTimeRef.current = now
      }

      const dt = (now - lastTimeRef.current) / 1000

      let jerk = 0
      let gForceZ = (acc.z || 0) / 9.81
      let lateralForce = 0

      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2)

      const micromobilityMode = useAnomalyStore.getState().micromobilityMode
      const thresholdMultiplier = micromobilityMode ? 0.6 : 1.0

      // Add to FFT Buffer
      windowBufferRef.current.push(mag)
      if (windowBufferRef.current.length >= FFT_WINDOW_SIZE) {
        const features = extractFeatures(windowBufferRef.current, 60)
        latestFftRef.current = features
        windowBufferRef.current = windowBufferRef.current.slice(FFT_OVERLAP)
      }

      // Road Analysis Logic
      const currentZBuffer = roadAnalysisRef.current.zBuffer
      currentZBuffer.push(gForceZ)
      if (currentZBuffer.length > 120) currentZBuffer.shift()

      // Edge Processing: Anonymize and filter before event creation
      // Near-Miss detection (Hard Braking / Swerving on Y-axis)
      const gForceY = (acc.y || 0) / 9.81
      if (Math.abs(gForceY) > 0.5) {
        if (now - roadAnalysisRef.current.lastBrakeTime > 2000) {
          roadAnalysisRef.current.lastBrakeTime = now
          roadAnalysisRef.current.events.push({
            id: `brk-${Date.now()}`,
            type: 'Frenagem Brusca Detectada',
            timestamp: new Date().toISOString(),
            severity: 'high',
            details: `Desaceleração Y: ${gForceY.toFixed(2)}G`,
          })
          addLog('warning', `Frenagem Brusca Detectada: ${gForceY.toFixed(2)}G`, 'Sensor')
        }
      }

      // Pothole detection (spike in Z-axis)
      if (Math.abs(gForceZ) > 2.0 * thresholdMultiplier) {
        if (now - roadAnalysisRef.current.lastPotholeTime > 1500) {
          statsRef.current.potholes += 1
          roadAnalysisRef.current.lastPotholeTime = now
          const sev = Math.abs(gForceZ) > 3.5 * thresholdMultiplier ? 'critical' : 'high'
          roadAnalysisRef.current.events.push({
            id: `pth-${Date.now()}`,
            type: 'Buraco',
            timestamp: new Date().toISOString(),
            severity: sev,
            details: `Impacto Z: ${gForceZ.toFixed(2)}G`,
          })
          addLog('warning', `Pothole detected: ${gForceZ.toFixed(2)}G`, 'Sensor')
        }
      }

      // Road condition calculation (variance over last ~2s window)
      if (totalFramesRef.current % 30 === 0 && currentZBuffer.length > 30) {
        const mean = currentZBuffer.reduce((a, b) => a + b, 0) / currentZBuffer.length
        const variance =
          currentZBuffer.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / currentZBuffer.length

        // Map variance to 0-100% condition (higher variance = lower percentage)
        const pct = Math.max(0, Math.min(100, 100 - variance * 1000))

        roadAnalysisRef.current.conditionPercentage = pct
        if (pct > 80) roadAnalysisRef.current.conditionLabel = 'Smooth'
        else if (pct > 40) roadAnalysisRef.current.conditionLabel = 'Moderate'
        else roadAnalysisRef.current.conditionLabel = 'Rough'

        if (totalFramesRef.current % 120 === 0) {
          roadAnalysisRef.current.history.push(pct)
          if (roadAnalysisRef.current.history.length > 10) roadAnalysisRef.current.history.shift()
        }
      }

      if (lastAccelRef.current && dt > 0) {
        const daX = (acc.x || 0) - lastAccelRef.current.x
        const daY = (acc.y || 0) - lastAccelRef.current.y
        const daZ = (acc.z || 0) - lastAccelRef.current.z

        jerk = Math.sqrt(daX * daX + daY * daY + daZ * daZ) / dt

        if (jerk > 30) statsRef.current.zenScore = Math.max(0, statsRef.current.zenScore - 0.2)
        lateralForce = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2) / 9.81
      }

      lastAccelRef.current = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 }
      lastTimeRef.current = now

      const date = new Date()
      const highPrecisionTimestamp = new Date(
        performance.timeOrigin ? performance.timeOrigin + now : Date.now(),
      ).toISOString()

      dataRef.current.push({
        time: `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}`,
        timestamp: highPrecisionTimestamp,
        jerk: Math.min(jerk, 50),
        gForceZ,
        lateralForce,
      })
      if (dataRef.current.length > 120) dataRef.current.shift()
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setSensorStatus((s) => {
          if (!s.mag) {
            addLog('info', 'Magnetometer responding', 'Sensor')
            return { ...s, mag: true }
          }
          return s
        })
      }
    }

    window.addEventListener('devicemotion', handleMotion, true)
    window.addEventListener('deviceorientation', handleOrientation, true)

    let lastUpdate = performance.now()
    const updateUI = (now: number) => {
      // In background mode, throttle UI updates heavily to save battery (simulating SDK headless mode)
      const updateInterval = document.hidden ? 2000 : 200

      if (now - lastUpdate >= updateInterval) {
        setData([...dataRef.current])
        setZenScore(statsRef.current.zenScore)
        setPotholes(statsRef.current.potholes)
        setRoadEvents([...roadAnalysisRef.current.events])
        setRoadCondition({
          percentage: roadAnalysisRef.current.conditionPercentage,
          label: roadAnalysisRef.current.conditionLabel,
        })
        setConditionHistory([...roadAnalysisRef.current.history])

        if (latestFftRef.current) {
          setFftFeatures(latestFftRef.current)
        }
        lastUpdate = now
      }
      rafRef.current = requestAnimationFrame(updateUI)
    }

    rafRef.current = requestAnimationFrame(updateUI)

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isCapturing, addLog])

  return {
    isCapturing,
    isWaiting,
    startCapture,
    stopCapture,
    data,
    fftFeatures,
    error,
    zenScore,
    potholes,
    permissionState,
    requestSensorPermission,
    samplingRate,
    sensorStatus,
    roadEvents,
    roadCondition,
    conditionHistory,
    isBackgroundMode,
  }
}
