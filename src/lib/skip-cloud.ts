/**
 * Skip Cloud SDK Implementation
 * Native fetch and EventSource wrapper matching exactly the PocketBase SDK signature,
 * implementing automatic reconnection with exponential backoff and error diagnostics.
 */

const PB_URL = import.meta.env.VITE_PB_URL || 'https://skipcloud.pockethost.io'

export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'reconnecting'

export class SkipCloudError extends Error {
  constructor(
    message: string,
    public status?: number,
    public type?: string,
  ) {
    super(message)
    this.name = 'SkipCloudError'
  }
}

class AuthStore {
  isValid = true
  token = 'simulated-jwt-token'
  model = { id: 'user123', email: 'driver@skip.com' }
}

class RecordService {
  constructor(
    private client: PocketBase,
    private name: string,
  ) {}

  async getList(page = 1, limit = 30, options: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: limit.toString(),
    })
    if (options.filter) params.append('filter', options.filter)
    if (options.sort) params.append('sort', options.sort)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch(
        `${this.client.baseUrl}/api/collections/${this.name}/records?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.client.authStore.token}`,
            'X-Protocol-Version': '1.0.0',
          },
          signal: controller.signal,
        },
      )
      clearTimeout(timeoutId)

      if (!res.ok) {
        if (res.status === 401) throw new SkipCloudError('Unauthorized', 401, 'auth')
        if (res.status === 403) throw new SkipCloudError('Forbidden / CORS', 403, 'cors')
        if (res.status === 503) throw new SkipCloudError('Service Unavailable', 503, 'server')
        if (res.status >= 500) throw new SkipCloudError('Server Error', res.status, 'server')
        throw new SkipCloudError('Failed to fetch', res.status, 'api')
      }
      return await res.json()
    } catch (e: any) {
      clearTimeout(timeoutId)
      if (e.name === 'AbortError') throw new SkipCloudError('Connection Timeout', 408, 'timeout')
      if (e instanceof SkipCloudError) throw e
      throw new SkipCloudError('Network Error', 0, 'network')
    }
  }

  async getFirstListItem(filter: string, options: any = {}) {
    const res = await this.getList(1, 1, { ...options, filter })
    if (res.items.length === 0) throw new SkipCloudError('Not Found', 404, 'api')
    return res.items[0]
  }

  async create(data: any, options: any = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch(`${this.client.baseUrl}/api/collections/${this.name}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.client.authStore.token}`,
          'X-Protocol-Version': '1.0.0',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        if (res.status === 401) throw new SkipCloudError('Unauthorized', 401, 'auth')
        if (res.status === 403) throw new SkipCloudError('Forbidden / CORS', 403, 'cors')
        if (res.status === 503) throw new SkipCloudError('Service Unavailable', 503, 'server')
        if (res.status >= 500) throw new SkipCloudError('Server Error', res.status, 'server')
        throw new SkipCloudError('Failed to create', res.status, 'api')
      }
      return await res.json()
    } catch (e: any) {
      clearTimeout(timeoutId)
      if (e.name === 'AbortError') throw new SkipCloudError('Connection Timeout', 408, 'timeout')
      if (e instanceof SkipCloudError) throw e
      throw new SkipCloudError('Network Error', 0, 'network')
    }
  }

  async subscribe(topic: string, callback: (e: any) => void) {
    return this.client.realtime.subscribe(this.name, topic, callback)
  }

  async unsubscribe(topic?: string) {
    return this.client.realtime.unsubscribe(this.name, topic)
  }
}

class RealtimeService {
  private sse: EventSource | null = null
  private clientId = ''
  private subscriptions = new Map<string, Array<{ topic: string; callback: (e: any) => void }>>()
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private eventHandlers = new Map<string, (e: MessageEvent) => void>()

  constructor(private client: PocketBase) {}

  private get reconnectDelay() {
    // Exponential backoff strategy: 1s, 2s, 4s, 8s, 16s, 32s
    const delays = [1000, 2000, 4000, 8000, 16000, 32000]
    return delays[Math.min(this.reconnectAttempts, delays.length - 1)]
  }

  async subscribe(collection: string, topic: string, callback: (e: any) => void) {
    if (!this.subscriptions.has(collection)) {
      this.subscriptions.set(collection, [])
    }
    this.subscriptions.get(collection)!.push({ topic, callback })

    if (!this.sse) {
      this.connect()
    } else if (this.clientId) {
      await this.submitSubscriptions()
    }
  }

  async unsubscribe(collection: string, topic?: string) {
    if (this.subscriptions.has(collection)) {
      if (topic) {
        let subs = this.subscriptions.get(collection)!
        subs = subs.filter((s) => s.topic !== topic)
        if (subs.length === 0) {
          this.subscriptions.delete(collection)
        } else {
          this.subscriptions.set(collection, subs)
        }
      } else {
        this.subscriptions.delete(collection)
      }

      if (this.clientId && this.sse?.readyState === EventSource.OPEN) {
        await this.submitSubscriptions()
      }
    }
  }

  private async submitSubscriptions() {
    if (!this.clientId) return
    const subs = Array.from(this.subscriptions.keys())
    try {
      const res = await fetch(`${this.client.baseUrl}/api/realtime`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.client.authStore.token}`,
        },
        body: JSON.stringify({ clientId: this.clientId, subscriptions: subs }),
      })
      if (res.status === 403) throw new SkipCloudError('CORS Blocked', 403, 'cors')
    } catch (err: any) {
      console.warn('PocketBase: Failed to submit real-time subscriptions', err)
    }
  }

  reconnect() {
    this.reconnectAttempts = 0
    this.connect()
  }

  private connect() {
    if (this.sse) {
      this.sse.close()
    }

    this.client.connectionStatus = this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    this.client.notifyConnectionChange()

    try {
      this.sse = new EventSource(`${this.client.baseUrl}/api/realtime`)

      const wsTimeout = setTimeout(() => {
        if (this.sse && this.sse.readyState === EventSource.CONNECTING) {
          this.sse.close()
          this.sse = null
          this.client.connectionStatus = 'error'
          this.client.notifyConnectionChange(
            new SkipCloudError('Connection Timeout', 408, 'timeout'),
          )
          this.reconnectAttempts++
          if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
          this.reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay)
        }
      }, 15000)

      this.sse.addEventListener('PB_CONNECT', (e: any) => {
        clearTimeout(wsTimeout)
        try {
          const data = JSON.parse(e.data)
          this.clientId = data.clientId
          this.reconnectAttempts = 0
          this.client.connectionStatus = 'connected'
          this.client.notifyConnectionChange()
          this.submitSubscriptions()
        } catch (err) {
          console.error('PocketBase: Failed to parse PB_CONNECT', err)
        }
      })

      this.sse.onerror = () => {
        clearTimeout(wsTimeout)
        this.sse?.close()
        this.sse = null
        this.client.connectionStatus = 'error'
        this.client.notifyConnectionChange()

        this.reconnectAttempts++
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay)
      }

      for (const collection of this.subscriptions.keys()) {
        const handler = (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data)
            const subs = this.subscriptions.get(collection) || []
            subs.forEach((sub) => {
              if (sub.topic === '*' || !sub.topic) {
                sub.callback(payload)
              } else if (sub.topic.includes('sessionId')) {
                const match = sub.topic.match(/sessionId\s*=\s*['"]([^'"]+)['"]/)
                if (match && payload.record.sessionId !== match[1]) {
                  return
                }
                sub.callback(payload)
              } else {
                sub.callback(payload)
              }
            })
          } catch (err) {
            console.error('PocketBase: Failed to parse realtime event', err)
          }
        }

        if (!this.eventHandlers.has(collection)) {
          this.eventHandlers.set(collection, handler)
        }

        this.sse.addEventListener(collection, handler)
      }
    } catch (err) {
      console.error('PocketBase: Failed to initialize EventSource', err)
      this.client.connectionStatus = 'error'
      this.client.notifyConnectionChange()

      this.reconnectAttempts++
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay)
    }
  }
}

export class PocketBase {
  baseUrl: string
  authStore = new AuthStore()
  autoCancellation = true
  realtime: RealtimeService
  connectionStatus: ConnectionStatus = 'connecting'
  private connectionListeners: Array<(status: ConnectionStatus, error?: SkipCloudError) => void> =
    []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.realtime = new RealtimeService(this)
  }

  collection(name: string) {
    return new RecordService(this, name)
  }

  onConnectionChange(callback: (status: ConnectionStatus, error?: SkipCloudError) => void) {
    this.connectionListeners.push(callback)
    callback(this.connectionStatus)
    return () => {
      this.connectionListeners = this.connectionListeners.filter((cb) => cb !== callback)
    }
  }

  notifyConnectionChange(error?: SkipCloudError) {
    this.connectionListeners.forEach((cb) => cb(this.connectionStatus, error))
  }

  reconnect() {
    this.realtime.reconnect()
  }

  async initConnection(healthCheckFn?: () => Promise<void>) {
    this.connectionStatus = 'connecting'
    this.notifyConnectionChange()
    if (healthCheckFn) {
      try {
        await healthCheckFn()
      } catch (e) {
        this.connectionStatus = 'error'
        this.notifyConnectionChange(new SkipCloudError('Health check failed', 0, 'network'))
        return false
      }
    }
    this.connectionStatus = 'connected'
    this.notifyConnectionChange()
    return true
  }

  async waitForConnected(timeoutMs = 10000): Promise<boolean> {
    if (this.connectionStatus === 'connected') return true

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), timeoutMs)
      const unsubscribe = this.onConnectionChange((status) => {
        if (status === 'connected') {
          clearTimeout(timeout)
          unsubscribe()
          resolve(true)
        } else if (status === 'error') {
          clearTimeout(timeout)
          unsubscribe()
          resolve(false)
        }
      })
    })
  }
}

export const pb = new PocketBase(PB_URL)
export const SkipCloud = pb
