import { useState, useEffect, useRef, useCallback } from 'react'

export interface SensorDataPoint {
  time: string
  jerk: number
  gForceZ: number
  lateralForce: number
}

export type PermissionState = 'idle' | 'granted' | 'denied' | 'unsupported'

export function useInertialSensors() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SensorDataPoint[]>([])
  const [zenScore, setZenScore] = useState(100)
  const [phi, setPhi] = useState(100)
  const [maxJerk, setMaxJerk] = useState(0)
  const [potholes, setPotholes] = useState(0)
  const [permissionState, setPermissionState] = useState<PermissionState>('idle')

  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null)
  const lastTimeRef = useRef<number>(0)
  const dataRef = useRef<SensorDataPoint[]>([])
  const statsRef = useRef({ zenScore: 100, phi: 100, maxJerk: 0, potholes: 0 })
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
        setError('Sensores não suportados neste dispositivo ou navegador.')
        setIsWaiting(false)
        return false
      }

      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const state = await (DeviceMotionEvent as any).requestPermission()
        if (state === 'granted') {
          setPermissionState('granted')
          return true
        } else {
          setPermissionState('denied')
          setError(
            'Acesso aos sensores negado. Por favor, habilite nas configurações do navegador.',
          )
          setIsWaiting(false)
          return false
        }
      } else {
        setPermissionState('granted')
        return true
      }
    } catch (e) {
      setPermissionState('denied')
      setError('Acesso aos sensores negado. Por favor, habilite nas configurações do navegador.')
      setIsWaiting(false)
      return false
    }
  }, [])

  const startCapture = async () => {
    const granted = await requestSensorPermission()
    if (!granted) return

    setIsCapturing(true)
    setIsWaiting(false)
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

    checkTimeoutRef.current = setTimeout(() => {
      if (eventCountRef.current === 0) {
        setError('Sensores não suportados neste dispositivo ou navegador.')
        setPermissionState('unsupported')
        setIsCapturing(false)
      }
    }, 2000)
  }

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
        if (jerk > 30) statsRef.current.zenScore = Math.max(0, statsRef.current.zenScore - 0.2)
        if (jerk > statsRef.current.maxJerk) statsRef.current.maxJerk = jerk

        gForceZ = (acc.z || 0) / 9.81
        if (accelerationIncludingGravity && !acceleration) {
          gForceZ = (accelerationIncludingGravity.z || 0) / 9.81
        }

        if (Math.abs(gForceZ) > 2.0) {
          statsRef.current.potholes += 0.05
        }
        if (Math.abs(gForceZ - 1) > 1.2) {
          statsRef.current.phi = Math.max(0, statsRef.current.phi - 0.5)
        }

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
      if (dataRef.current.length > 60) {
        dataRef.current.shift()
      }
    }

    window.addEventListener('devicemotion', handleMotion, true)

    let lastUpdate = performance.now()
    const updateUI = (now: number) => {
      if (now - lastUpdate >= 100) {
        if (dataRef.current.length > 0) {
          setData([...dataRef.current])
          setZenScore(statsRef.current.zenScore)
          setPhi(statsRef.current.phi)
          setMaxJerk(statsRef.current.maxJerk)
          setPotholes(Math.floor(statsRef.current.potholes))
        }
        lastUpdate = now
      }
      rafRef.current = requestAnimationFrame(updateUI)
    }

    rafRef.current = requestAnimationFrame(updateUI)

    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isCapturing])

  return {
    isCapturing,
    isWaiting,
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
