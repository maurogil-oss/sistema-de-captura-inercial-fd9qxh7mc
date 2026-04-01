import { useState } from 'react'
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
  BellRing,
  BatteryWarning,
  WifiOff,
  ShieldCheck,
  Cpu,
  Smartphone,
  Battery,
} from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { Badge } from '@/components/ui/badge'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HealthCheckWidget } from '@/components/HealthCheckWidget'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { useDeviceStore } from '@/stores/useDeviceStore'
import { DateRange } from 'react-day-picker'
import { subDays } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui-custom/DatePickerWithRange'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { RemoteConfigCard } from '@/components/dashboard/RemoteConfigCard'
import { WearAnalysisCard } from '@/components/dashboard/WearAnalysisCard'
import { NetworkSimulationCard } from '@/components/dashboard/NetworkSimulationCard'

export default function Index() {
  const { devices, alerts, resolveAlert } = useDeviceStore()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [viewMode, setViewMode] = useState<'cluster' | 'heatmap'>('cluster')
  const [minSeverity, setMinSeverity] = useState([0])
  const { micromobilityMode, setMicromobilityMode, clusters, safetyEvents } = useAnomalyStore()

  const activeDevices = Object.values(devices).filter((d) => d.status === 'online')
  const unresolvedAlerts = alerts.filter((a) => !a.resolved)

  const filteredClusters = clusters.filter((c) => {
    if (!c) return false
    if (!dateRange?.from) return true
    const d = new Date(c.lastDetected || Date.now())
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    if ((c.severity_g || 0) < minSeverity[0]) return false
    return true
  })

  const filteredSafety = safetyEvents.filter((e) => {
    if (!e) return false
    if (!dateRange?.from) return true
    const d = new Date(e.timestamp || Date.now())
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    return true
  })

  const handleExportGeoJSON = () => {
    const features = filteredClusters
      .filter((c) => c.status === 'Confirmed' || c.status === 'Repaired')
      .map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng || 0, c.lat || 0] },
        properties: {
          id: c.id,
          severity_g: c.severity_g || 0,
          detection_count: c.detections || 0,
          timestamp: c.lastDetected,
          status: c.status,
          type: 'Pothole/Defect',
        },
      }))

    const safetyFeatures = filteredSafety.map((e) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [e.lng || 0, e.lat || 0] },
      properties: {
        id: e.id,
        type: 'Safety Risk',
        event_type: e.type || 'Unknown',
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
  const mappedDistance = ((clusters?.length || 0) * 1.2 + 42.5).toFixed(1)
  const maintenanceIndex =
    confirmedDefects + possibleRepairs > 0
      ? Math.round((possibleRepairs / (confirmedDefects + possibleRepairs)) * 100)
      : 0

  const hotspots = [...filteredClusters]
    .filter((c) => c.status === 'Confirmed' || c.status === 'Potential')
    .sort((a, b) => (b.severity_g || 0) - (a.severity_g || 0))
    .slice(0, 5)

  const avgBattery =
    activeDevices.length > 0
      ? Math.round(
          activeDevices.reduce((acc, d) => acc + (d.batteryLevel || 100), 0) / activeDevices.length,
        )
      : 0

  const totalFiltered = Object.values(devices).reduce((acc, d) => acc + (d.dataFiltered || 0), 0)
  const totalSent = Object.values(devices).reduce((acc, d) => acc + (d.dataSent || 0), 0)
  const edgeEfficiency =
    totalFiltered > 0 ? Math.round((totalFiltered / (totalFiltered + totalSent)) * 100) : 0

  return (
    <div className="space-y-6 w-full mx-auto pb-10">
      <HealthCheckWidget />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Gestão de Infraestrutura
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Privacidade & Anonimização Ativos
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de frota, dispositivos e condições viárias.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button
            onClick={handleExportGeoJSON}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" /> Exportar SIG
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          title="Eventos de Risco"
          value={filteredSafety.length.toString()}
          icon={Activity}
          description="Frenagens bruscas e desvios"
          className="border-orange-500/30 bg-orange-500/5"
        />
        <StatCard
          title="Índice de Manutenção"
          value={`${maintenanceIndex}%`}
          icon={Wrench}
          description={`${possibleRepairs} reparos`}
          className="border-blue-500/30 bg-blue-500/5"
        />
        <StatCard
          title="Distância Mapeada"
          value={`${mappedDistance} km`}
          icon={Route}
          description="Cobertura ativa"
          className="border-emerald-500/30 bg-emerald-500/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 xl:col-span-9 glass-panel overflow-hidden relative flex flex-col h-[600px] lg:h-[700px]">
          <div className="flex-1 w-full h-full bg-muted/10">
            <MapMock mode={viewMode} dateRange={dateRange} minSeverity={minSeverity[0]} />
          </div>
        </Card>

        <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col h-full">
          <Card className="glass-panel shrink-0">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Controles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Modo de Visualização</Label>
                <div className="flex items-center space-x-1 border rounded-md p-1 bg-muted/30">
                  <Button
                    variant={viewMode === 'cluster' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cluster')}
                    className="flex-1 h-8 text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> Marcadores
                  </Button>
                  <Button
                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('heatmap')}
                    className="flex-1 h-8 text-xs"
                  >
                    <MapIcon className="w-3.5 h-3.5 mr-1.5" /> Heatmap
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground">Filtro de Severidade</Label>
                  <span className="text-xs font-mono font-medium">
                    {(minSeverity[0] || 0).toFixed(1)}G+
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

              <div className="flex items-center justify-between pt-2">
                <Label
                  htmlFor="micromobility"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  Modo Ciclovia
                </Label>
                <Switch
                  id="micromobility"
                  checked={micromobilityMode}
                  onCheckedChange={setMicromobilityMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel flex-1 flex flex-col min-h-[300px] lg:max-h-[calc(700px-280px)]">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Hotspots Prioritários
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 py-4">
                {hotspots.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Nenhum hotspot encontrado.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hotspots.map((hotspot, i) => {
                      const severity = hotspot.severity_g || 0
                      const lat = hotspot.lat || 0
                      const isCritical = severity >= 3
                      const isMod = severity >= 1.5 && severity < 3

                      return (
                        <div
                          key={hotspot.id}
                          className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium">
                              #{i + 1} Lat: {lat.toFixed(4)}...
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
                              <strong className="text-foreground">{severity.toFixed(1)}G</strong>
                            </span>
                            <span>{hotspot.detections || 0} detecções</span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs text-primary"
                            asChild
                          >
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

          <div className="flex flex-col gap-4 hidden lg:flex">
            <Card className="glass-panel shrink-0 bg-primary/5 border-primary/20">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  Performance do SDK Edge
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    Bateria Média (Alvo 2-4%/h)
                  </div>
                  <span className="font-mono font-bold text-emerald-500">{avgBattery}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      Eficiência de Filtragem
                    </span>
                    <span className="font-mono font-bold text-blue-500">{edgeEfficiency}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${edgeEfficiency}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                    <span>{totalFiltered.toLocaleString()} pts descartados local</span>
                    <span>{totalSent.toLocaleString()} pts enviados à nuvem</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel shrink-0">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    Status da Frota
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5">
                    {activeDevices.length} Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 overflow-y-auto max-h-[250px]">
                {Object.values(devices).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum dispositivo sincronizado.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.values(devices)
                      .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
                      .slice(0, 5)
                      .map((device) => (
                        <div
                          key={device.id}
                          className="flex flex-col p-2 rounded bg-muted/30 border border-border/50 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-medium">
                              {device.id.substring(0, 8)}...
                            </span>
                            {device.status === 'online' ? (
                              <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Online
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <WifiOff className="w-3 h-3" /> Offline
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              Bat:{' '}
                              {device.batteryLevel !== undefined ? (
                                <span
                                  className={cn(
                                    device.batteryLevel < 15 ? 'text-destructive font-bold' : '',
                                  )}
                                >
                                  {device.batteryLevel}%
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </span>
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded border border-border/50">
                              SDK {device.sdkVersion || 'v1.0.0'}
                            </span>
                            <span>
                              {new Date(device.lastSeen).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel shrink-0">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-orange-500" />
                    Alertas do Sistema
                  </div>
                  {unresolvedAlerts.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5">
                      {unresolvedAlerts.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 overflow-y-auto max-h-[250px]">
                {unresolvedAlerts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum alerta ativo.</p>
                ) : (
                  <div className="space-y-2">
                    {unresolvedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          'flex flex-col p-2 rounded border text-xs space-y-1.5',
                          alert.severity === 'Critical'
                            ? 'bg-destructive/10 border-destructive/20 text-destructive'
                            : alert.severity === 'Moderate'
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                              : 'bg-blue-500/10 border-blue-500/20 text-blue-500',
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold flex items-center gap-1.5">
                            {alert.type === 'low_battery' ? (
                              <BatteryWarning className="w-3.5 h-3.5" />
                            ) : alert.type === 'telemetry_gap' ? (
                              <WifiOff className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            {alert.severity}
                          </span>
                          <span className="text-[9px] opacity-70">
                            {new Date(alert.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[10px] leading-tight opacity-90">{alert.message}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px] self-end mt-1 px-2 hover:bg-background/50"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Row for User Story AC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <div className="flex flex-col gap-6">
          <RemoteConfigCard />
          <NetworkSimulationCard />
        </div>
        <div className="md:col-span-1 lg:col-span-2">
          <WearAnalysisCard />
        </div>
      </div>
    </div>
  )
}
