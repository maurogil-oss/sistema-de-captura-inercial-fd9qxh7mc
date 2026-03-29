import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pb } from '@/lib/skip-cloud'

export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface AnomalyCluster {
  id: string
  lat: number
  lng: number
  detections: number
  firstDetected: string
  lastDetected: string
  status: 'Potential' | 'Confirmed'
}

interface AnomalyState {
  clusters: AnomalyCluster[]
  addDetection: (lat: number, lng: number, timestamp: string) => void
  initializeGlobalSync: () => void
  isSyncing: boolean
}

const CLUSTER_RADIUS_M = 5
const CONFIRMATION_THRESHOLD = 10

export const useAnomalyStore = create<AnomalyState>()(
  persist(
    (set, get) => ({
      clusters: [
        {
          id: 'mock-1',
          lat: -23.545,
          lng: -46.625,
          detections: 15,
          firstDetected: new Date(Date.now() - 86400000).toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Confirmed',
        },
        {
          id: 'mock-2',
          lat: -23.55,
          lng: -46.63,
          detections: 4,
          firstDetected: new Date().toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Potential',
        },
        {
          id: 'mock-3',
          lat: -23.555,
          lng: -46.635,
          detections: 12,
          firstDetected: new Date(Date.now() - 172800000).toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Confirmed',
        },
        {
          id: 'mock-4',
          lat: -23.558,
          lng: -46.638,
          detections: 8,
          firstDetected: new Date(Date.now() - 43200000).toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Potential',
        },
      ],
      isSyncing: false,
      addDetection: (lat, lng, timestamp) => {
        set((state) => {
          const newClusters = [...state.clusters]
          let found = false
          for (const cluster of newClusters) {
            if (getDistanceMeters(cluster.lat, cluster.lng, lat, lng) <= CLUSTER_RADIUS_M) {
              cluster.detections += 1
              cluster.lastDetected = timestamp
              if (cluster.detections >= CONFIRMATION_THRESHOLD) {
                cluster.status = 'Confirmed'
              }
              found = true
              break
            }
          }
          if (!found) {
            newClusters.push({
              id: Math.random().toString(36).substring(2, 9),
              lat,
              lng,
              detections: 1,
              firstDetected: timestamp,
              lastDetected: timestamp,
              status: CONFIRMATION_THRESHOLD <= 1 ? 'Confirmed' : 'Potential',
            })
          }
          return { clusters: newClusters }
        })
      },
      initializeGlobalSync: () => {
        if (get().isSyncing) return
        set({ isSyncing: true })

        pb.collection('telemetry').subscribe('*', (e) => {
          if (e.action === 'create') {
            const record = e.record as any
            if (
              record.quality?.anomalyScore > 0.5 &&
              record.location?.lat &&
              record.location?.lng
            ) {
              get().addDetection(
                record.location.lat,
                record.location.lng,
                record.timestamp || new Date().toISOString(),
              )
            } else if (record.points && Array.isArray(record.points)) {
              record.points.forEach((p: any) => {
                if (p.quality?.anomalyScore > 0.5 && p.location?.lat && p.location?.lng) {
                  get().addDetection(
                    p.location.lat,
                    p.location.lng,
                    p.timestamp || new Date().toISOString(),
                  )
                }
              })
            }
          }
        })
      },
    }),
    {
      name: 'anomaly-clusters',
    },
  ),
)
