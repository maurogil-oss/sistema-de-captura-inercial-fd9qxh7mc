import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Car,
  Wifi,
  ShieldCheck,
  Play,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Map,
  Download,
} from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { Badge } from '@/components/ui/badge'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DevicePairingCard } from '@/components/DevicePairingCard'
import { HealthCheckWidget } from '@/components/HealthCheckWidget'
import { pb } from '@/lib/skip-cloud'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui-custom/DatePickerWithRange'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

function ReliabilityDashboard({ dateRange }: { dateRange: DateRange | undefined }) {
  const allClusters = useAnomalyStore((state) => state.clusters)
  const clusters = allClusters.filter((c) => {
    if (!dateRange?.from) return true
    const d = new Date(c.lastDetected)
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    return true
  })

  const confirmed = clusters.filter((c) => c.status === 'Confirmed').length
  const potential = clusters.filter((c) => c.status === 'Potential').length
  const repaired = clusters.filter((c) => c.status === 'Repaired').length
  const totalDetections = clusters.reduce((acc, c) => acc + c.detections, 0)

  const confidenceLevel =
    totalDetections === 0 ? 0 : Math.round((confirmed / (confirmed + potential)) * 100) || 0

  return (
    <Card className="glass-panel border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Data Reliability & Validation Dashboard
        </CardTitle>
        <CardDescription>
          Multi-pass spatial clustering and anomaly verification status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Total Clusters
            </span>
            <span className="text-2xl font-bold">{clusters.length}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Potential
            </span>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {potential}
            </span>
            <span className="text-[10px] text-yellow-600/80">{'< 10 detections'}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Confirmed
            </span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{confirmed}</span>
            <span className="text-[10px] text-red-600/80">{'>= 10 detections'}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Reparo
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{repaired}</span>
            <span className="text-[10px] text-blue-600/80">{'Sem anomalia (5+ passes)'}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" /> Confidence Level
            </span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {confidenceLevel}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-emerald-500/20 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${confidenceLevel}%` }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Index() {
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [activeSessions, setActiveSessions] = useState<string[]>([])
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [viewMode, setViewMode] = useState<'cluster' | 'heatmap'>('cluster')
  const { micromobilityMode, setMicromobilityMode, clusters, safetyEvents } = useAnomalyStore()

  useEffect(() => {
    let isMounted = true
    const fetchActive = async () => {
      try {
        const result = await pb.collection('telemetry').getList(1, 100, { sort: '-created' })
        if (!isMounted) return

        const recent = new Set<string>()
        const now = Date.now()
        let latestSync: number | null = null
        result.items.forEach((item: any) => {
          if (item.sessionId) {
            const itemTime = new Date(item.created).getTime()
            if (!latestSync || itemTime > latestSync) {
              latestSync = itemTime
            }
            if (now - itemTime < 5 * 60 * 1000) {
              recent.add(item.sessionId)
            }
          }
        })
        setActiveSessions(Array.from(recent))
        if (latestSync) setLastGlobalSync(new Date(latestSync))
        setLoading(false)
      } catch (e) {
        if (isMounted) setLoading(false)
      }
    }
    fetchActive()
  }, [])

  const handleExportGeoJSON = () => {
    const filteredClusters = clusters.filter((c) => {
      if (!dateRange?.from) return true
      const d = new Date(c.lastDetected)
      if (d < dateRange.from) return false
      if (dateRange.to && d > dateRange.to) return false
      return true
    })

    const features = filteredClusters
      .filter((c) => c.status === 'Confirmed' || c.status === 'Repaired')
      .map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          id: c.id,
          severity_g: c.severity_g,
          detection_count: c.detections,
          timestamp: c.lastDetected,
          status: c.status,
        },
      }))

    const filteredSafety = safetyEvents.filter((e) => {
      if (!dateRange?.from) return true
      const d = new Date(e.timestamp)
      if (d < dateRange.from) return false
      if (dateRange.to && d > dateRange.to) return false
      return true
    })

    const safetyFeatures = filteredSafety.map((e) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [e.lng, e.lat] },
      properties: {
        id: e.id,
        type: 'Safety Risk',
        event_type: e.type,
        timestamp: e.timestamp,
      },
    }))

    const geojson = {
      type: 'FeatureCollection',
      features: [...features, ...safetyFeatures],
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'anomalies_export.geojson'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <HealthCheckWidget />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Visão Geral Consolidada</h1>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 w-fit"
            >
              <BatteryCharging className="w-3.5 h-3.5" />
              Performance Mode: 60Hz Battery Optimized
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitoramento global Edge-to-Cloud de dispositivos ativos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Link to={`/trip/${currentSessionId || 'latest-session'}`}>
              <Play className="w-4 h-4" />
              Monitorar Novo Dispositivo
            </Link>
          </Button>
        </div>
      </div>

      <DevicePairingCard onSessionIdGenerated={setCurrentSessionId} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Dispositivos Transmitindo"
          value={loading ? '--' : activeSessions.length.toString()}
          icon={Wifi}
          description="Edge nodes conectados"
          className="border-emerald-500/30 bg-emerald-500/5"
        />
        <StatCard
          title="Último Batch Recebido"
          value={lastGlobalSync ? lastGlobalSync.toLocaleTimeString() : '--'}
          icon={Activity}
          description={loading ? 'Buscando...' : 'Sincronização global'}
        />
        <StatCard
          title="Latência Estimada"
          value="< 150ms"
          icon={ShieldCheck}
          trend="down"
          trendValue="Estável"
        />
        <StatCard
          title="Cobertura Espacial"
          value="Global"
          icon={Car}
          description="Agnóstico a rede"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-border/50">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />

        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="micromobility"
              checked={micromobilityMode}
              onCheckedChange={setMicromobilityMode}
            />
            <Label htmlFor="micromobility" className="text-sm font-medium cursor-pointer">
              Modo Ciclovia
            </Label>
          </div>

          <div className="flex items-center space-x-1 border rounded-md p-1 bg-background/50">
            <Button
              variant={viewMode === 'cluster' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cluster')}
              className="h-7 px-2.5 text-xs"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" /> Cluster
            </Button>
            <Button
              variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('heatmap')}
              className="h-7 px-2.5 text-xs"
            >
              <Map className="w-3.5 h-3.5 mr-1.5" /> Heatmap
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportGeoJSON}
            className="gap-2 bg-background"
          >
            <Download className="w-4 h-4" /> Export Data
          </Button>
        </div>
      </div>

      <ReliabilityDashboard dateRange={dateRange} />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 glass-panel flex flex-col">
          <CardHeader>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>Visualização individual detalhada</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[300px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Buscando na nuvem...</p>
            ) : activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <Wifi className="w-8 h-8 mb-2" />
                <p className="text-sm">Nenhum dispositivo ativo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((id) => (
                  <div
                    key={id}
                    className="flex justify-between items-center p-3 rounded bg-muted/30 border border-border/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-bold text-primary">{id}</p>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Batch Sync Ativo
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/trip/${id}`}>Ver Live</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 glass-panel overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between z-10 pb-2 bg-background/50 backdrop-blur-sm absolute w-full border-b border-border/50">
            <CardTitle>Mapa Global de Telemetria</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                Recebendo Batches
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-[300px] mt-14 bg-muted/10">
            <MapMock mode={viewMode} dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
