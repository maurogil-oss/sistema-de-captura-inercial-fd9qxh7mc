import { mockTripTimeline } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CloudLightning, MapPin, Clock } from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'

export default function TripDetails() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight font-mono">TRP-8842-AX</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              CONCLUÍDO
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Rota 66
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> 45 min de duração
            </span>
            <span className="flex items-center gap-1 text-purple-500 font-medium bg-purple-500/10 px-2 py-0.5 rounded">
              <CloudLightning className="w-4 h-4" /> Tempestade
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Motorista</p>
          <p className="text-lg font-bold">James Holden (D-402)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Linha do Tempo Inercial (Sincronizada)</CardTitle>
              <CardDescription>
                Passe o mouse sobre os gráficos para sincronizar pontos de dados em todos os
                sensores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TripCharts data={mockTripTimeline} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden flex flex-col h-[400px]">
            <CardHeader className="pb-2 absolute z-10 bg-background/50 backdrop-blur w-full border-b border-border/50">
              <CardTitle className="text-sm">Replay do Trajeto</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <MapMock mode="default" />
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contexto da Viagem e Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2 bg-purple-500/5 p-2 rounded -mx-2">
                <span className="text-muted-foreground">Impacto Climático</span>
                <span className="font-mono text-purple-500 font-medium">
                  Multiplicador de Severidade de 2.0x
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Solavanco Máx (Jerk)</span>
                <span className="font-mono text-destructive flex items-center gap-1">
                  18.4 da/dt{' '}
                  <Badge variant="destructive" className="h-4 text-[10px] px-1 ml-1">
                    AJUSTADO
                  </Badge>
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Impactos em Buracos</span>
                <span className="font-mono text-amber-500">2 (Nível &gt; 2.0g)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pontuação Zen da Viagem</span>
                <span className="font-mono text-amber-500">64 (Penalizado)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
