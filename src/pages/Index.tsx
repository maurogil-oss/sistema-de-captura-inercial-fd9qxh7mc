import { Link } from 'react-router-dom'
import {
  Activity,
  Car,
  Leaf,
  AlertTriangle,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Cpu,
} from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { ZenGauge } from '@/components/ui-custom/ZenGauge'
import { MapMock } from '@/components/ui-custom/MapMock'
import { EventBadge } from '@/components/ui-custom/EventBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockKPIs, mockRecentEvents, calculateSeverity, getSeverityLabel } from '@/data/mockData'

const WeatherIcon = ({ weather, className }: { weather: string; className?: string }) => {
  switch (weather) {
    case 'RAIN':
      return <CloudRain className={className} />
    case 'STORM':
      return <CloudLightning className={className} />
    case 'FOG':
      return <CloudFog className={className} />
    default:
      return <Sun className={className} />
  }
}

const WeatherLabel = ({ weather }: { weather: string }) => {
  switch (weather) {
    case 'RAIN':
      return 'Pista Molhada'
    case 'STORM':
      return 'Tempestade'
    case 'FOG':
      return 'Neblina'
    default:
      return 'Pista Limpa'
  }
}

export default function Index() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Executiva</h1>
          <p className="text-muted-foreground">Telemetria em tempo real e inteligência de frota.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/sdk">
            <Cpu className="w-4 h-4" />
            Gerenciamento do SDK Orbis
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Distância Total"
          value={`${mockKPIs.totalDistance} km`}
          icon={Activity}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Pegada de Carbono"
          value={`${mockKPIs.carbonFootprint} tCO2`}
          icon={Leaf}
          trend="down"
          trendValue="5%"
        />
        <StatCard
          title="Veículos Ativos"
          value={mockKPIs.activeVehicles}
          icon={Car}
          description="de 50 no total"
        />
        <StatCard
          title="Eventos Críticos"
          value={mockKPIs.criticalEvents}
          icon={AlertTriangle}
          description="Últimas 24h"
          className="border-destructive/30 bg-destructive/5"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 flex flex-col glass-panel">
          <CardHeader>
            <CardTitle>Pontuação Zen (Zen Score) Global</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            <ZenGauge score={mockKPIs.zenScore} className="w-48 max-w-full" />
            <p className="text-sm text-muted-foreground text-center mt-6">
              O comportamento de direção da frota é{' '}
              <strong className="text-primary">excelente</strong>. Continue monitorando eventos de
              frenagem brusca.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 glass-panel overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between z-10 pb-2">
            <CardTitle>Mapa de Telemetria ao Vivo</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">FLUXO L1 AO VIVO</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-[300px]">
            <MapMock />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Eventos Severos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentEvents.map((event) => {
              const adjustedSeverity = calculateSeverity(event.baseSeverity, event.weather)
              const severityLabel = getSeverityLabel(adjustedSeverity)

              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <EventBadge type={event.type} severity={severityLabel} />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <WeatherIcon weather={event.weather} className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          <WeatherLabel weather={event.weather} />
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.driver}</p>
                      <p className="text-xs text-muted-foreground font-mono">{event.location}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="text-xs font-mono text-muted-foreground">{event.time}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">
                        Base {event.baseSeverity} &rarr;
                      </span>
                      <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-background border border-border/50 shadow-sm">
                        {adjustedSeverity.toFixed(1)}{' '}
                        <span className="text-[10px] text-muted-foreground">/10</span>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
