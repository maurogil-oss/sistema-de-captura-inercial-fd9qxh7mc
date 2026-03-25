/**
 * Simulated Skip Cloud (PocketBase) SDK
 * Mocks the real-time cloud database using BroadcastChannel and LocalStorage
 * to demonstrate cross-device synchronization in a browser environment.
 */

export class Collection {
  private name: string

  constructor(name: string) {
    this.name = name
  }

  private get key() {
    return `skipcloud_db_${this.name}`
  }

  async create(data: any) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 150))

    const record = {
      id:
        window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString(),
      ...data,
    }

    const records = JSON.parse(localStorage.getItem(this.key) || '[]')
    records.push(record)

    // Keep size manageable
    if (records.length > 500) {
      records.shift()
    }

    localStorage.setItem(this.key, JSON.stringify(records))

    // Broadcast change for real-time subscription
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel(`skipcloud_channel_${this.name}`)
      bc.postMessage({ action: 'create', record })
      bc.close()
    }

    return record
  }

  async getList(page: number, limit: number, options?: { filter?: string; sort?: string }) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 100))

    const records = JSON.parse(localStorage.getItem(this.key) || '[]')
    let filtered = records

    // Simple parser for "sessionId = '...'"
    if (options?.filter) {
      const match = options.filter.match(/sessionId\s*=\s*['"]([^'"]+)['"]/)
      if (match) {
        filtered = records.filter((r: any) => r.sessionId === match[1])
      }
    }

    if (options?.sort === '-created') {
      filtered.sort(
        (a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )
    }

    return {
      items: filtered.slice((page - 1) * limit, page * limit),
      totalItems: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    }
  }

  subscribe(filter: string, callback: (event: { action: string; record: any }) => void) {
    if (!window.BroadcastChannel) return () => {}

    const bc = new BroadcastChannel(`skipcloud_channel_${this.name}`)
    bc.onmessage = (event) => {
      const record = event.data.record
      const match = filter.match(/sessionId\s*=\s*['"]([^'"]+)['"]/)

      // Only trigger callback if it matches the filter
      if (match && record.sessionId === match[1]) {
        callback(event.data)
      } else if (!match) {
        callback(event.data)
      }
    }

    return () => bc.close()
  }
}

export const SkipCloud = {
  collection: (name: string) => new Collection(name),
}
