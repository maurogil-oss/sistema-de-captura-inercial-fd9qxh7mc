import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Wifi,
  AlertTriangle,
  Map as MapIcon,
  Download,
  MapPin,
  TrendingUp,
  Settings2,
  Wrench,
  Route,
} from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { Badge } from '@/components/ui/badge'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HealthCheckWidget } from '@/components/HealthCheckWidget'
import { pb } from '@/lib/skip-cloud'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui-custom/DatePickerWithRange'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Index() {
  const [activeSessions, setActiveSessions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [viewMode, setViewMode] = useState<'cluster' | 'heatmap'>('cluster')
  const [minSeverity, setMinSeverity] = useState([0])
  const { micromobilityMode, setMicromobilityMode, clusters, safetyEvents } = useAnomalyStore()

  useEffect(() => {
    let isMounted = true
    const fetchActive = async () => {
      try {
        const result = await pb.collection('telemetry').getList(1, 100, { sort: '-created' })
        if (!isMounted) return

        const recent = new Set<string>()
        const now = Date.now()
        result.items.forEach((item: any) => {
          if (item.sessionId) {
            const itemTime = new Date(item.created).getTime()
            if (now - itemTime < 5 * 60 * 1000) {
              recent.add(item.sessionId)
            }
          }
        })
        setActiveSessions(Array.from(recent))
        setLoading(false)
      } catch (e) {
        if (isMounted) setLoading(false)
      }
    }
    fetchActive()
  }, [])

  const filteredClusters = clusters.filter((c) => {
    if (!dateRange?.from) return true
    const d = new Date(c.lastDetected)
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    if (c.severity_g < minSeverity[0]) return false
    return true
  })

  const filteredSafety = safetyEvents.filter((e) => {
    if (!dateRange?.from) return true
    const d = new Date(e.timestamp)
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    return true
  })

  const handleExportGeoJSON = () => {
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
          type: 'Pothole/Defect',
        },
      }))

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

  const confirmedDefects = filteredClusters.filter((c) => c.status === 'Confirmed').length
  const possibleRepairs = filteredClusters.filter((c) => c.status === 'Repaired').length
  const mappedDistance = (clusters.length * 1.2 + 42.5).toFixed(1)
  const maintenanceIndex =
    confirmedDefects + possibleRepairs > 0
      ? Math.round((possibleRepairs / (confirmedDefects + possibleRepairs)) * 100)
      : 0

  const hotspots = [...filteredClusters]
    .filter((c) => c.status === 'Confirmed' || c.status === 'Potential')
    .sort((a, b) => (b.severity_g || 0) - (a.severity_g || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <HealthCheckWidget />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Gestão de Infraestrutura
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de condições viárias e priorização de manutenção.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button
            onClick={handleExportGeoJSON}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" /> Exportar para SIG (GeoJSON)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Defeitos Confirmados"
          value={confirmedDefects.toString()}
          icon={AlertTriangle}
          description="Aguardando intervenção"
          className="border-red-500/30 bg-red-500/5"
          trend="up"
          trendValue="+3 hoje"
        />
        <StatCard
          title="Eventos de Risco (Near-Miss)"
          value={filteredSafety.length.toString()}
          icon={Activity}
          description="Frenagens bruscas e desvios"
          className="border-orange-500/30 bg-orange-500/5"
        />
        <StatCard
          title="Índice de Manutenção"
          value={`${maintenanceIndex}%`}
          icon={Wrench}
          description={`${possibleRepairs} reparos identificados`}
          className="border-blue-500/30 bg-blue-500/5"
        />
        <StatCard
          title="Distância Mapeada"
          value={`${mappedDistance} km`}
          icon={Route}
          description="Cobertura ativa no período"
          className="border-emerald-500/30 bg-emerald-500/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 glass-panel overflow-hidden relative flex flex-col min-h-[600px]">
          <div className="absolute top-4 left-4 z-10 w-72 bg-background/95 backdrop-blur-md rounded-lg border border-border/50 shadow-xl p-4 space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Controles do Mapa
              </h3>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Modo de Visualização</Label>
                <div className="flex items-center space-x-1 border rounded-md p-1 bg-muted/30">
                  <Button
                    variant={viewMode === 'cluster' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cluster')}
                    className="flex-1 h-7 text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> Marcadores
                  </Button>
                  <Button
                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('heatmap')}
                    className="flex-1 h-7 text-xs"
                  >
                    <MapIcon className="w-3.5 h-3.5 mr-1.5" /> Heatmap
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Filtro de Severidade (G)</Label>
                  <span className="text-xs font-mono font-medium">
                    {minSeverity[0].toFixed(1)}G+
                  </span>
                </div>
                <Slider
                  defaultValue={[0]}
                  max={5}
                  step={0.1}
                  value={minSeverity}
                  onValueChange={setMinSeverity}
                  className="w-full"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Label
                  htmlFor="micromobility"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Modo Ciclovia (Sensível)
                </Label>
                <Switch
                  id="micromobility"
                  checked={micromobilityMode}
                  onCheckedChange={setMicromobilityMode}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full h-full bg-muted/10">
            <MapMock mode={viewMode} dateRange={dateRange} minSeverity={minSeverity[0]} />
          </div>
        </Card>

        <div className="space-y-6 flex flex-col h-full">
          <Card className="glass-panel flex-1 flex flex-col max-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Hotspots Críticos
              </CardTitle>
              <CardDescription className="text-xs">
                Segmentos que exigem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[300px] px-6 pb-4">
                {hotspots.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Nenhum hotspot encontrado no período e severidade selecionados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotspots.map((hotspot, i) => {
                      const isCritical = hotspot.severity_g >= 3
                      const isMod = hotspot.severity_g >= 1.5 && hotspot.severity_g < 3

                      return (
                        <div
                          key={hotspot.id}
                          className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium">
                              #{i + 1} Lat: {hotspot.lat.toFixed(4)}...
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                isCritical
                                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                  : isMod
                                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }
                            >
                              {isCritical ? 'Crítico' : isMod ? 'Moderado' : 'Leve'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-end text-xs text-muted-foreground">
                            <span>
                              Max Força:{' '}
                              <strong className="text-foreground">
                                {hotspot.severity_g.toFixed(1)}G
                              </strong>
                            </span>
                            <span>{hotspot.detections} detecções</span>
                          </div>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                            <Link to={`/trip/${hotspot.id}`}>Ver Detalhes &rarr;</Link>
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="glass-panel shrink-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-500" />
                Veículos em Campo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Buscando na nuvem...</p>
              ) : activeSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum veículo ativo no momento.</p>
              ) : (
                <div className="space-y-2 max-h-[150px] overflow-auto">
                  {activeSessions.slice(0, 3).map((id) => (
                    <div
                      key={id}
                      className="flex justify-between items-center p-2 rounded bg-muted/30 border border-border/50 text-sm"
                    >
                      <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>
                  ))}
                  {activeSessions.length > 3 && (
                    <p className="text-xs text-center text-muted-foreground pt-1">
                      + {activeSessions.length - 3} outros ativos
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
