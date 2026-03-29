import { useState, useEffect, useRef, useCallback } from 'react'
import { extractFeatures, FFTFeatures } from '@/lib/fft'
import { useDebug } from '@/stores/DebugContext'

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

  const framesRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())

  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dataRef = useRef<SensorDataPoint[]>([])
  const windowBufferRef = useRef<number[]>([])
  const latestFftRef = useRef<FFTFeatures | null>(null)

  const statsRef = useRef({ zenScore: 100, potholes: 0 })
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
    setZenScore(100)
    setPotholes(0)

    lastAccelRef.current = null
    lastTimeRef.current = performance.now()
    eventCountRef.current = 0
    framesRef.current = 0
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

      // Add to FFT Buffer
      windowBufferRef.current.push(mag)
      if (windowBufferRef.current.length >= FFT_WINDOW_SIZE) {
        const features = extractFeatures(windowBufferRef.current, 60)
        latestFftRef.current = features
        windowBufferRef.current = windowBufferRef.current.slice(FFT_OVERLAP)
      }

      if (lastAccelRef.current && dt > 0) {
        const daX = (acc.x || 0) - lastAccelRef.current.x
        const daY = (acc.y || 0) - lastAccelRef.current.y
        const daZ = (acc.z || 0) - lastAccelRef.current.z

        jerk = Math.sqrt(daX * daX + daY * daY + daZ * daZ) / dt

        if (jerk > 30) statsRef.current.zenScore = Math.max(0, statsRef.current.zenScore - 0.2)
        if (Math.abs(gForceZ) > 2.0) statsRef.current.potholes += 0.05

        lateralForce = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2) / 9.81
      }

      lastAccelRef.current = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 }
      lastTimeRef.current = now

      const date = new Date()
      // High-precision timestamp for 60Hz temporal sequence integrity
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
      // Keep a slightly larger buffer locally to ensure we don't drop points between 5Hz UI throttle updates
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
      if (now - lastUpdate >= 200) {
        // Update UI at 5Hz
        setData([...dataRef.current])
        setZenScore(statsRef.current.zenScore)
        setPotholes(Math.floor(statsRef.current.potholes))
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
  }
}
