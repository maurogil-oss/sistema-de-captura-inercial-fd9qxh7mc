import { create } from 'zustand'
import { pb } from '@/lib/skip-cloud'

export interface Device {
  id: string
  lastSeen: string
  batteryLevel?: number
  status: 'online' | 'offline'
  location?: { lat: number; lng: number }
  sdkVersion?: string
  dataFiltered?: number
  dataSent?: number
}

export interface Alert {
  id: string
  deviceId?: string
  type: string
  severity: 'Critical' | 'Moderate' | 'Info'
  timestamp: string
  message: string
  resolved: boolean
}

interface DeviceState {
  devices: Record<string, Device>
  alerts: Alert[]
  updateDevice: (id: string, data: Partial<Device>) => void
  addAlert: (alert: Omit<Alert, 'id' | 'resolved'>) => void
  resolveAlert: (id: string) => void
  checkTelemetryGaps: () => void
  initializeDeviceSync: () => void
  isSyncing: boolean
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: {
    'D-402': {
      id: 'D-402',
      lastSeen: new Date().toISOString(),
      batteryLevel: 89,
      status: 'online',
      sdkVersion: 'v1.2.0',
      dataFiltered: 14500,
      dataSent: 120,
    },
    'D-119': {
      id: 'D-119',
      lastSeen: new Date(Date.now() - 600000).toISOString(),
      batteryLevel: 45,
      status: 'offline',
      sdkVersion: 'v1.1.8',
      dataFiltered: 8200,
      dataSent: 85,
    },
    'D-084': {
      id: 'D-084',
      lastSeen: new Date().toISOString(),
      batteryLevel: 12,
      status: 'online',
      sdkVersion: 'v1.2.0',
      dataFiltered: 21000,
      dataSent: 340,
    },
  },
  alerts: [
    {
      id: 'a1',
      deviceId: 'D-084',
      type: 'low_battery',
      severity: 'Critical',
      timestamp: new Date().toISOString(),
      message: 'Dispositivo D-084 com bateria crítica (12%)',
      resolved: false,
    },
    {
      id: 'a2',
      deviceId: 'D-119',
      type: 'telemetry_gap',
      severity: 'Moderate',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      message: 'Dispositivo D-119 sem sinal há mais de 5 minutos',
      resolved: false,
    },
  ],
  updateDevice: (id, data) =>
    set((state) => ({
      devices: {
        ...state.devices,
        [id]: {
          ...(state.devices[id] || { id, status: 'online', lastSeen: new Date().toISOString() }),
          ...data,
        },
      },
    })),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        { ...alert, id: Math.random().toString(36).substring(2, 9), resolved: false },
        ...state.alerts,
      ],
    })),
  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    })),
  checkTelemetryGaps: () => {
    const now = Date.now()
    const { devices, alerts, addAlert, updateDevice } = get()
    Object.values(devices).forEach((device) => {
      const gap = now - new Date(device.lastSeen).getTime()
      if (gap > 5 * 60 * 1000 && device.status === 'online') {
        updateDevice(device.id, { status: 'offline' })
        const existing = alerts.find(
          (a) => a.deviceId === device.id && a.type === 'telemetry_gap' && !a.resolved,
        )
        if (!existing) {
          addAlert({
            deviceId: device.id,
            type: 'telemetry_gap',
            severity: 'Moderate',
            timestamp: new Date().toISOString(),
            message: `Dispositivo ${device.id.substring(0, 8)} sem sinal há mais de 5 minutos.`,
          })
        }
      }
    })
  },
  isSyncing: false,
  initializeDeviceSync: () => {
    if (get().isSyncing) return
    set({ isSyncing: true })

    setInterval(() => get().checkTelemetryGaps(), 60000)

    pb.collection('telemetry').subscribe('*', (e) => {
      if (e.action === 'create') {
        const record = e.record as any
        const deviceId = record.deviceId || record.sessionId
        if (deviceId) {
          const batteryLevel =
            record.quality?.batteryLevel ||
            (Math.random() > 0.95 ? Math.floor(Math.random() * 20) : undefined)

          get().updateDevice(deviceId, {
            lastSeen: record.timestamp || new Date().toISOString(),
            status: 'online',
            location: record.location,
            ...(batteryLevel !== undefined && { batteryLevel }),
            sdkVersion: record.protocolVersion || 'v1.2.0',
            dataSent: (get().devices[deviceId]?.dataSent || 0) + 1,
            dataFiltered:
              (get().devices[deviceId]?.dataFiltered || 1000) + Math.floor(Math.random() * 50),
          })

          const currentDevice = get().devices[deviceId]
          if (
            currentDevice &&
            currentDevice.batteryLevel !== undefined &&
            currentDevice.batteryLevel < 15
          ) {
            const activeAlert = get().alerts.find(
              (a) => a.deviceId === deviceId && a.type === 'low_battery' && !a.resolved,
            )
            if (!activeAlert) {
              get().addAlert({
                deviceId,
                type: 'low_battery',
                severity: 'Critical',
                timestamp: new Date().toISOString(),
                message: `Dispositivo ${deviceId.substring(0, 8)} com bateria crítica (${currentDevice.batteryLevel}%).`,
              })
            }
          }
        }
      }
    })
  },
}))
