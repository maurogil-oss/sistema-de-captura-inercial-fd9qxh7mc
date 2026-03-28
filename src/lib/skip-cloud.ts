/**
 * Skip Cloud (PocketBase) SDK Implementation
 * Replaces the local simulation with a real connection to a PocketBase infrastructure.
 * Uses native fetch and EventSource for lightweight REST/SSE integration.
 */

const PB_URL = import.meta.env.VITE_PB_URL || 'https://skipcloud.pockethost.io'

class RealtimeClient {
  private sse: EventSource | null = null
  private clientId: string | null = null
  private subscriptions: Map<string, Array<(data: any) => void>> = new Map()
  private connectionListener: ((connected: boolean) => void) | null = null

  public setConnectionListener(callback: (connected: boolean) => void) {
    this.connectionListener = callback
    if (this.sse && this.sse.readyState === EventSource.OPEN) {
      callback(true)
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
      this.connectionListener?.(false)
    }
  }

  subscribe(topic: string, callback: (data: any) => void) {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, [])
    }
    this.subscriptions.get(topic)!.push(callback)

    if (!this.sse) {
      try {
        this.sse = new EventSource(`${PB_URL}/api/realtime`)

        this.sse.addEventListener('PB_CONNECT', (e: any) => {
          try {
            const payload = JSON.parse(e.data)
            this.clientId = payload.clientId
            this.connectionListener?.(true)
            this.submitSubscriptions()
          } catch (err) {
            console.error('SkipCloud: Failed to parse PB_CONNECT', err)
          }
        })

        this.sse.onerror = () => {
          console.warn('SkipCloud: Real-time connection error. Reconnecting...')
          this.connectionListener?.(false)
        }
      } catch (err) {
        console.error('SkipCloud: Failed to initialize EventSource', err)
        this.connectionListener?.(false)
      }
    } else if (this.clientId) {
      this.submitSubscriptions()
    }

    const handleEvent = (e: any) => {
      try {
        const payload = JSON.parse(e.data)
        callback(payload)
      } catch (err) {
        console.error('SkipCloud: Failed to parse realtime event', err)
      }
    }

    if (this.sse) {
      this.sse.addEventListener(topic, handleEvent)
    }

    return () => {
      const callbacks = this.subscriptions.get(topic)
      if (callbacks) {
        const idx = callbacks.indexOf(callback)
        if (idx !== -1) callbacks.splice(idx, 1)
        if (callbacks.length === 0) {
          this.subscriptions.delete(topic)
          this.submitSubscriptions()
        }
      }
      if (this.sse) {
        this.sse.removeEventListener(topic, handleEvent)
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
  onConnectionChange: (callback: (connected: boolean) => void) => {
    realtime.setConnectionListener(callback)
  },
}
