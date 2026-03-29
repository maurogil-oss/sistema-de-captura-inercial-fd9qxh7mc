import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { pb, SkipCloudError } from '@/lib/skip-cloud'

interface HealthConfig {
  baseUrl: string
  path: string
  timeoutMs: number
}

interface HealthDetails {
  url: string
  method: string
  errorType: string | null
  message: string | null
  rawStatus: number | null
}

interface HealthContextType {
  status: 'idle' | 'checking' | 'healthy' | 'unhealthy'
  config: HealthConfig
  details: HealthDetails | null
  checkHealth: () => Promise<void>
  updateConfig: (config: Partial<HealthConfig>) => void
  initConnection: () => Promise<void>
  waitForConnected: () => Promise<boolean>
}

const HealthContext = createContext<HealthContextType | undefined>(undefined)

export function HealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'healthy' | 'unhealthy'>('idle')
  const [config, setConfig] = useState<HealthConfig>({
    baseUrl: import.meta.env.VITE_PB_URL || 'https://skipcloud.pockethost.io',
    path: '/api/health',
    timeoutMs: 5000,
  })
  const [details, setDetails] = useState<HealthDetails | null>(null)

  const checkHealth = useCallback(async () => {
    setStatus('checking')
    const fullUrl = `${config.baseUrl}${config.path}`
    const method = 'GET'

    const currentDetails: HealthDetails = {
      url: fullUrl,
      method,
      errorType: null,
      message: null,
      rawStatus: null,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)

      const res = await fetch(fullUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      currentDetails.rawStatus = res.status

      if (res.ok) {
        setStatus('healthy')
        currentDetails.message = `200 OK`
        pb.connectionStatus = 'connected'
        pb.notifyConnectionChange()
      } else {
        setStatus('unhealthy')
        currentDetails.errorType = 'HTTP Error'
        currentDetails.message = `HTTP ${res.status} - ${res.statusText}`
        pb.connectionStatus = 'error'
        pb.notifyConnectionChange(new SkipCloudError('Health Check Failed', res.status, 'api'))
      }
      setDetails(currentDetails)
    } catch (err: any) {
      setStatus('unhealthy')
      if (err.name === 'AbortError') {
        currentDetails.errorType = 'Timeout Error'
        currentDetails.message = `Timeout Error: API Health check failed`
      } else if (err.message.includes('fetch') || err.message.includes('Network')) {
        currentDetails.errorType = 'Network / CORS / TLS'
        currentDetails.message = 'API Health check failed: failed to fetch'
      } else {
        currentDetails.errorType = 'Unknown Error'
        currentDetails.message = `API Health check failed: ${err.message}`
      }
      setDetails(currentDetails)
      pb.connectionStatus = 'error'
      pb.notifyConnectionChange(new SkipCloudError(currentDetails.message, 0, 'network'))
    }
  }, [config])

  const initConnection = useCallback(async () => {
    await pb.initConnection(checkHealth)
  }, [checkHealth])

  const waitForConnected = useCallback(async () => {
    return await pb.waitForConnected(config.timeoutMs)
  }, [config.timeoutMs])

  const updateConfig = useCallback((newConfig: Partial<HealthConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }))
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Automatic background health checks
    return () => clearInterval(interval)
  }, [checkHealth])

  return (
    <HealthContext.Provider
      value={{
        status,
        config,
        details,
        checkHealth,
        updateConfig,
        initConnection,
        waitForConnected,
      }}
    >
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (!context) throw new Error('useHealth must be used within a HealthProvider')
  return context
}
