import { useState, useEffect, useRef, useCallback } from 'react'

export interface SensorDataPoint {
  time: string
  jerk: number
  gForceZ: number
  lateralForce: number
}

export type PermissionState =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'not_required'
  | 'unsupported'

export function useInertialSensors() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SensorDataPoint[]>([])
  const [zenScore, setZenScore] = useState(100)
  const [phi, setPhi] = useState(100)
  const [maxJerk, setMaxJerk] = useState(0)
  const [potholes, setPotholes] = useState(0)
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown')

  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dataRef = useRef<SensorDataPoint[]>([])
  const statsRef = useRef({ zenScore: 100, phi: 100, maxJerk: 0, potholes: 0 })
  const eventCountRef = useRef(0)
  const checkTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Initial check for sensor support and permission requirements
    if (typeof window === 'undefined') return

    if (!window.DeviceMotionEvent) {
      setPermissionState('unsupported')
      setError('Sensores de movimento não detectados ou não suportados neste navegador.')
      return
    }

    // Check if the browser requires explicit permission (like iOS 13+)
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setPermissionState('prompt')
    } else {
      setPermissionState('not_required')
    }
  }, [])

  const requestSensorPermission = useCallback(async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const state = await (DeviceMotionEvent as any).requestPermission()
        if (state === 'granted') {
          setPermissionState('granted')
          setError(null)
          return true
        } else {
          setPermissionState('denied')
          setError(
            'Permissão negada. Por favor, habilite o acesso a "Movimento e Orientação" nas configurações do seu navegador.',
          )
          return false
        }
      } catch (e) {
        console.error('Permission request failed:', e)
        setPermissionState('denied')
        setError(
          'Erro ao solicitar permissão. O pedido deve ser feito através de uma interação do usuário.',
        )
        return false
      }
    }
    return true
  }, [])

  const startCapture = async () => {
    if (permissionState === 'unsupported') {
      setError('Sensores de movimento não detectados ou não suportados neste navegador.')
      return
    }

    // Request permission implicitly if not already done, though it's better to use explicit button
    if (permissionState === 'prompt' || permissionState === 'denied') {
      const granted = await requestSensorPermission()
      if (!granted) return
    }

    setIsCapturing(true)
    setError(null)
    dataRef.current = []
    setData([])

    statsRef.current = { zenScore: 100, phi: 100, maxJerk: 0, potholes: 0 }
    setZenScore(100)
    setPhi(100)
    setMaxJerk(0)
    setPotholes(0)

    lastAccelRef.current = null
    lastTimeRef.current = performance.now()
    eventCountRef.current = 0

    // Verify if sensors are actually yielding data (handles desktop browsers reporting support but no hardware)
    checkTimeoutRef.current = setTimeout(() => {
      if (eventCountRef.current === 0) {
        setError('Sensores de movimento não detectados ou não suportados neste navegador.')
        setIsCapturing(false)
      }
    }, 2000)
  }

  const stopCapture = useCallback(() => {
    setIsCapturing(false)
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current)
  }, [])

  useEffect(() => {
    if (!isCapturing) return

    const handleMotion = (event: DeviceMotionEvent) => {
      eventCountRef.current += 1
      const { accelerationIncludingGravity, acceleration } = event
      const acc = acceleration || accelerationIncludingGravity
      if (!acc || acc.x === null) return

      const now = performance.now()
      const dt = (now - lastTimeRef.current) / 1000

      let jerk = 0
      let lateralForce = 0
      let gForceZ = 1

      if (lastAccelRef.current && dt > 0) {
        const daX = (acc.x || 0) - lastAccelRef.current.x
        const daY = (acc.y || 0) - lastAccelRef.current.y
        const daZ = (acc.z || 0) - lastAccelRef.current.z

        jerk = Math.sqrt(daX * daX + daY * daY + daZ * daZ) / dt
        // Penalty for high jerk (sudden braking/acceleration)
        if (jerk > 30) statsRef.current.zenScore = Math.max(0, statsRef.current.zenScore - 0.2)
        if (jerk > statsRef.current.maxJerk) statsRef.current.maxJerk = jerk

        gForceZ = (acc.z || 0) / 9.81
        if (accelerationIncludingGravity && !acceleration) {
          // Simple compensation if pure acceleration is unavailable
          gForceZ = (accelerationIncludingGravity.z || 0) / 9.81
        }

        // Pothole/anomaly detection on Z axis
        if (Math.abs(gForceZ) > 2.0) {
          statsRef.current.potholes += 0.05
        }
        if (Math.abs(gForceZ - 1) > 1.2) {
          statsRef.current.phi = Math.max(0, statsRef.current.phi - 0.5)
        }

        // Lateral force for cornering
        lateralForce = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2) / 9.81
      }

      lastAccelRef.current = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0 }
      lastTimeRef.current = now

      const date = new Date()
      const newPoint: SensorDataPoint = {
        time: `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, '0')}.${Math.floor(
          date.getMilliseconds() / 100,
        )}`,
        jerk: Math.min(jerk, 50),
        gForceZ,
        lateralForce,
      }

      dataRef.current.push(newPoint)
      // Keep a buffer of ~60 points (approx 1-2 seconds at 60Hz, sufficient for UI)
      if (dataRef.current.length > 60) {
        dataRef.current.shift()
      }
    }

    window.addEventListener('devicemotion', handleMotion, true)

    // Decouple UI updates from sensor frequency. Update React state at ~30Hz to prevent mobile browser hang
    const interval = setInterval(() => {
      if (dataRef.current.length > 0) {
        setData([...dataRef.current])
        setZenScore(statsRef.current.zenScore)
        setPhi(statsRef.current.phi)
        setMaxJerk(statsRef.current.maxJerk)
        setPotholes(Math.floor(statsRef.current.potholes))
      }
    }, 33)

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      clearInterval(interval)
    }
  }, [isCapturing])

  return {
    isCapturing,
    startCapture,
    stopCapture,
    data,
    error,
    zenScore,
    phi,
    maxJerk,
    potholes,
    permissionState,
    requestSensorPermission,
  }
}
