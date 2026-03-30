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

export interface SafetyEvent {
  id: string
  lat: number
  lng: number
  timestamp: string
  type: string
}

export interface AnomalyCluster {
  id: string
  lat: number
  lng: number
  detections: number
  firstDetected: string
  lastDetected: string
  status: 'Potential' | 'Confirmed' | 'Repaired'
  severity_g: number
  passesWithoutAnomaly: number
}

interface AnomalyState {
  clusters: AnomalyCluster[]
  safetyEvents: SafetyEvent[]
  micromobilityMode: boolean
  setMicromobilityMode: (val: boolean) => void
  addDetection: (
    lat: number,
    lng: number,
    timestamp: string,
    gForce?: number,
    isAnomaly?: boolean,
  ) => void
  addSafetyEvent: (lat: number, lng: number, timestamp: string, type: string) => void
  initializeGlobalSync: () => void
  isSyncing: boolean
}

const CLUSTER_RADIUS_M = 5
const CONFIRMATION_THRESHOLD = 10

export const useAnomalyStore = create<AnomalyState>()(
  persist(
    (set, get) => ({
      micromobilityMode: false,
      setMicromobilityMode: (val) => set({ micromobilityMode: val }),
      clusters: [
        {
          id: 'mock-1',
          lat: -23.545,
          lng: -46.625,
          detections: 15,
          firstDetected: new Date(Date.now() - 86400000).toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Confirmed',
          severity_g: 3.2,
          passesWithoutAnomaly: 0,
        },
        {
          id: 'mock-2',
          lat: -23.55,
          lng: -46.63,
          detections: 4,
          firstDetected: new Date().toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Potential',
          severity_g: 1.5,
          passesWithoutAnomaly: 0,
        },
        {
          id: 'mock-3',
          lat: -23.555,
          lng: -46.635,
          detections: 12,
          firstDetected: new Date(Date.now() - 172800000).toISOString(),
          lastDetected: new Date(Date.now() - 86400000).toISOString(),
          status: 'Repaired',
          severity_g: 2.1,
          passesWithoutAnomaly: 6,
        },
        {
          id: 'mock-4',
          lat: -23.558,
          lng: -46.638,
          detections: 8,
          firstDetected: new Date(Date.now() - 43200000).toISOString(),
          lastDetected: new Date().toISOString(),
          status: 'Potential',
          severity_g: 1.8,
          passesWithoutAnomaly: 0,
        },
      ],
      safetyEvents: [
        {
          id: 'safe-1',
          lat: -23.548,
          lng: -46.628,
          timestamp: new Date().toISOString(),
          type: 'Frenagem Brusca Detectada',
        },
        {
          id: 'safe-2',
          lat: -23.552,
          lng: -46.632,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'Frenagem Brusca Detectada',
        },
      ],
      isSyncing: false,
      addDetection: (lat, lng, timestamp, gForce = 1.0, isAnomaly = true) => {
        set((state) => {
          const newClusters = [...state.clusters]
          let found = false
          for (const cluster of newClusters) {
            if (getDistanceMeters(cluster.lat, cluster.lng, lat, lng) <= CLUSTER_RADIUS_M) {
              if (isAnomaly) {
                cluster.detections += 1
                cluster.lastDetected = timestamp
                cluster.severity_g = Math.max(cluster.severity_g, gForce)
                cluster.passesWithoutAnomaly = 0
                if (cluster.detections >= CONFIRMATION_THRESHOLD) {
                  cluster.status = 'Confirmed'
                }
              } else {
                if (cluster.status === 'Confirmed') {
                  cluster.passesWithoutAnomaly += 1
                  if (cluster.passesWithoutAnomaly >= 5) {
                    cluster.status = 'Repaired'
                  }
                }
              }
              found = true
              break
            }
          }
          if (!found && isAnomaly) {
            newClusters.push({
              id: Math.random().toString(36).substring(2, 9),
              lat,
              lng,
              detections: 1,
              firstDetected: timestamp,
              lastDetected: timestamp,
              status: CONFIRMATION_THRESHOLD <= 1 ? 'Confirmed' : 'Potential',
              severity_g: gForce,
              passesWithoutAnomaly: 0,
            })
          }
          return { clusters: newClusters }
        })
      },
      addSafetyEvent: (lat, lng, timestamp, type) => {
        set((state) => ({
          safetyEvents: [
            ...state.safetyEvents,
            { id: Math.random().toString(36).substring(2, 9), lat, lng, timestamp, type },
          ],
        }))
      },
      initializeGlobalSync: () => {
        if (get().isSyncing) return
        set({ isSyncing: true })

        pb.collection('telemetry').subscribe('*', (e) => {
          if (e.action === 'create') {
            const record = e.record as any
            if (record.location?.lat && record.location?.lng) {
              const isAnomaly = record.quality?.anomalyScore > 0.5
              get().addDetection(
                record.location.lat,
                record.location.lng,
                record.timestamp || new Date().toISOString(),
                record.features?.signalVariance || 1.0,
                isAnomaly,
              )
            } else if (record.points && Array.isArray(record.points)) {
              record.points.forEach((p: any) => {
                if (p.location?.lat && p.location?.lng) {
                  const isAnomaly = p.quality?.anomalyScore > 0.5
                  get().addDetection(
                    p.location.lat,
                    p.location.lng,
                    p.timestamp || new Date().toISOString(),
                    p.features?.signalVariance || 1.0,
                    isAnomaly,
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
