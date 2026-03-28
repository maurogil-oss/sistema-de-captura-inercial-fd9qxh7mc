/**
 * Skip Cloud (PocketBase) SDK Implementation
 * Simulated PocketBase SDK using native fetch and EventSource to match exactly the
 * PocketBase SDK signature, implementing automatic reconnection with exponential backoff.
 */

const PB_URL = import.meta.env.VITE_PB_URL || 'https://skipcloud.pockethost.io'

export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'reconnecting'

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

    try {
      const res = await fetch(
        `${this.client.baseUrl}/api/collections/${this.name}/records?${params.toString()}`,
      )
      if (!res.ok) throw new Error('Failed to fetch')
      return await res.json()
    } catch (e) {
      throw new Error('Failed to fetch')
    }
  }

  async getFirstListItem(filter: string, options: any = {}) {
    const res = await this.getList(1, 1, { ...options, filter })
    if (res.items.length === 0) throw new Error('ClientResponseError 404')
    return res.items[0]
  }

  async create(data: any, options: any = {}) {
    try {
      const res = await fetch(`${this.client.baseUrl}/api/collections/${this.name}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create')
      return await res.json()
    } catch (e) {
      throw new Error('Failed to create')
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
      await fetch(`${this.client.baseUrl}/api/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: this.clientId, subscriptions: subs }),
      })
    } catch (err) {
      console.warn('PocketBase: Failed to submit real-time subscriptions', err)
    }
  }

  private connect() {
    if (this.sse) {
      this.sse.close()
    }

    this.client.connectionStatus = this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting'
    this.client.notifyConnectionChange()

    try {
      this.sse = new EventSource(`${this.client.baseUrl}/api/realtime`)

      this.sse.addEventListener('PB_CONNECT', (e: any) => {
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
        console.warn('PocketBase: Real-time connection error. Reconnecting...')
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
              // Simulate PocketBase client-side filtering support
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
  private connectionListeners: Array<(status: ConnectionStatus) => void> = []

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.realtime = new RealtimeService(this)
  }

  collection(name: string) {
    return new RecordService(this, name)
  }

  onConnectionChange(callback: (status: ConnectionStatus) => void) {
    this.connectionListeners.push(callback)
    callback(this.connectionStatus)
    return () => {
      this.connectionListeners = this.connectionListeners.filter((cb) => cb !== callback)
    }
  }

  notifyConnectionChange() {
    this.connectionListeners.forEach((cb) => cb(this.connectionStatus))
  }
}

export const pb = new PocketBase(PB_URL)
export const SkipCloud = pb
