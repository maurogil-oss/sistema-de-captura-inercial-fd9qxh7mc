/**
 * Skip Cloud (PocketBase) SDK Implementation
 * Replaces the local simulation with a real connection to a PocketBase infrastructure.
 * Uses native fetch and EventSource for lightweight REST/SSE integration.
 */

const PB_URL = import.meta.env.VITE_PB_URL || 'https://skipcloud.pockethost.io'

export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'reconnecting'

class RealtimeClient {
  private sse: EventSource | null = null
  private clientId: string | null = null
  private subscriptions: Map<string, Array<(data: any) => void>> = new Map()
  private connectionListener: ((status: ConnectionStatus) => void) | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, (e: any) => void> = new Map()

  public setConnectionListener(callback: (status: ConnectionStatus) => void) {
    this.connectionListener = callback
    if (this.sse && this.sse.readyState === EventSource.OPEN) {
      callback('connected')
    } else if (this.sse && this.sse.readyState === EventSource.CONNECTING) {
      callback('connecting')
    }
  }

  private async submitSubscriptions() {
    if (!this.clientId) return
    const subs = Array.from(this.subscriptions.keys())

    try {
      await fetch(`${PB_URL}/api/realtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: this.clientId,
          subscriptions: subs,
        }),
      })
    } catch (error) {
      console.warn('SkipCloud: Failed to submit real-time subscriptions', error)
      this.connectionListener?.('error')
    }
  }

  private connect() {
    if (this.sse) {
      this.sse.close()
    }

    this.connectionListener?.(this.reconnectTimeout ? 'reconnecting' : 'connecting')

    try {
      this.sse = new EventSource(`${PB_URL}/api/realtime`)

      this.sse.addEventListener('PB_CONNECT', (e: any) => {
        try {
          const payload = JSON.parse(e.data)
          this.clientId = payload.clientId
          this.connectionListener?.('connected')
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
          }
          this.submitSubscriptions()
        } catch (err) {
          console.error('SkipCloud: Failed to parse PB_CONNECT', err)
        }
      })

      this.sse.onerror = () => {
        console.warn('SkipCloud: Real-time connection error. Reconnecting...')
        this.connectionListener?.('reconnecting')
        this.sse?.close()
        this.sse = null

        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null
            this.connect()
          }, 3000)
        }
      }

      for (const [topic, handler] of this.eventHandlers.entries()) {
        this.sse.addEventListener(topic, handler)
      }
    } catch (err) {
      console.error('SkipCloud: Failed to initialize EventSource', err)
      this.connectionListener?.('error')
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectTimeout = null
          this.connect()
        }, 3000)
      }
    }
  }

  subscribe(topic: string, callback: (data: any) => void) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, [])

      const handler = (e: any) => {
        try {
          const payload = JSON.parse(e.data)
          const callbacks = this.subscriptions.get(topic) || []
          callbacks.forEach((cb) => cb(payload))
        } catch (err) {
          console.error('SkipCloud: Failed to parse realtime event', err)
        }
      }
      this.eventHandlers.set(topic, handler)

      if (this.sse) {
        this.sse.addEventListener(topic, handler)
      }
    }

    this.subscriptions.get(topic)!.push(callback)

    if (!this.sse) {
      this.connect()
    } else if (this.clientId) {
      this.submitSubscriptions()
    }

    return () => {
      const callbacks = this.subscriptions.get(topic)
      if (callbacks) {
        const idx = callbacks.indexOf(callback)
        if (idx !== -1) callbacks.splice(idx, 1)
        if (callbacks.length === 0) {
          this.subscriptions.delete(topic)
          const handler = this.eventHandlers.get(topic)
          if (handler && this.sse) {
            this.sse.removeEventListener(topic, handler)
          }
          this.eventHandlers.delete(topic)
          this.submitSubscriptions()
        }
      }
    }
  }
}

const realtime = new RealtimeClient()

export class Collection {
  private name: string

  constructor(name: string) {
    this.name = name
  }

  async create(data: any) {
    const res = await fetch(`${PB_URL}/api/collections/${this.name}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error(`SkipCloud Error: Failed to create record in ${this.name}`)
    }

    return await res.json()
  }

  async getList(page: number, limit: number, options?: { filter?: string; sort?: string }) {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: limit.toString(),
    })

    if (options?.filter) params.append('filter', options.filter)
    if (options?.sort) params.append('sort', options.sort)

    const res = await fetch(`${PB_URL}/api/collections/${this.name}/records?${params.toString()}`)

    if (!res.ok) {
      throw new Error(`SkipCloud Error: Failed to fetch from ${this.name}`)
    }

    return await res.json()
  }

  subscribe(filter: string, callback: (event: { action: string; record: any }) => void) {
    return realtime.subscribe(this.name, (payload) => {
      const record = payload.record
      if (filter) {
        // Client-side filtering for 'sessionId = "..."' format
        const match = filter.match(/sessionId\s*=\s*['"]([^'"]+)['"]/)
        if (match && record.sessionId !== match[1]) {
          return
        }
      }
      callback(payload)
    })
  }
}

export const SkipCloud = {
  collection: (name: string) => new Collection(name),
  onConnectionChange: (callback: (status: ConnectionStatus) => void) => {
    realtime.setConnectionListener(callback)
  },
}
