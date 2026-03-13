import { mockTripTimeline } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CloudLightning,
  MapPin,
  Clock,
  Play,
  Square,
  Activity,
  AlertTriangle,
  Smartphone,
} from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'
import { useInertialSensors } from '@/hooks/useInertialSensors'
import { cn } from '@/lib/utils'

export default function TripDetails() {
  const { isCapturing, startCapture, stopCapture, data, error, zenScore, phi, maxJerk, potholes } =
    useInertialSensors()

  const displayData = data.length > 0 ? data : mockTripTimeline

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight font-mono">TRP-8842-AX</h1>
            <Badge
              variant="outline"
              className={cn(
                'border',
                isCapturing
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-primary/10 text-primary border-primary/20',
              )}
            >
              {isCapturing ? 'AO VIVO' : 'CONCLUÍDO'}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Rota 66
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> 45 min de duração
            </span>
            <span className="flex items-center gap-1 text-purple-500 font-medium bg-purple-500/10 px-2 py-0.5 rounded">
              <CloudLightning className="w-4 h-4" /> Tempestade
            </span>
            {isCapturing && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
                <Activity className="w-4 h-4" /> Capturando Dados em Tempo Real
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="text-left md:text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Motorista</p>
            <p className="text-lg font-bold">James Holden (D-402)</p>
          </div>
          {isCapturing ? (
            <Button variant="destructive" onClick={stopCapture} className="gap-2 w-full md:w-auto">
              <Square className="w-4 h-4" /> Parar Captura
            </Button>
          ) : (
            <Button
              onClick={startCapture}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto"
            >
              <Play className="w-4 h-4" fill="currentColor" /> Iniciar Captura (Teste Real)
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in-95">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Linha do Tempo Inercial (Sincronizada)
                </CardTitle>
                <CardDescription>
                  {isCapturing
                    ? 'Exibindo buffer contínuo (Acelerômetro e Giroscópio).'
                    : 'Passe o mouse sobre os gráficos para sincronizar pontos de dados em todos os sensores.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <TripCharts data={displayData} animate={!isCapturing} />
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

          <Card className="glass-panel relative overflow-hidden">
            {isCapturing && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full" />
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contexto da Viagem e Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between border-b border-border/50 pb-2 bg-purple-500/5 p-2 rounded -mx-2">
                <span className="text-muted-foreground">Impacto Climático</span>
                <span className="font-mono text-purple-500 font-medium">
                  Multiplicador de Severidade de 2.0x
                </span>
              </div>

              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Solavanco Máx (Jerk)</span>
                <span className="font-mono text-destructive flex items-center gap-1">
                  {isCapturing || data.length > 0 ? maxJerk.toFixed(1) : '18.4'} da/dt
                  {!isCapturing && data.length === 0 && (
                    <Badge variant="destructive" className="h-4 text-[10px] px-1 ml-1">
                      AJUSTADO
                    </Badge>
                  )}
                </span>
              </div>

              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Impactos em Buracos</span>
                <span className="font-mono text-amber-500">
                  {isCapturing || data.length > 0 ? potholes : '2'} (Nível &gt; 2.0g)
                </span>
              </div>

              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">PHI (Índice de Saúde do Pavimento)</span>
                <span
                  className={cn(
                    'font-mono font-medium transition-colors',
                    phi < 80
                      ? 'text-destructive'
                      : phi < 95
                        ? 'text-amber-500'
                        : 'text-emerald-500',
                  )}
                >
                  {isCapturing || data.length > 0 ? Math.round(phi) : '85'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Pontuação Zen da Viagem</span>
                <span
                  className={cn(
                    'font-mono font-medium transition-colors',
                    zenScore < 80
                      ? 'text-destructive'
                      : zenScore < 95
                        ? 'text-amber-500'
                        : 'text-emerald-500',
                  )}
                >
                  {isCapturing || data.length > 0 ? Math.round(zenScore) : '64 (Penalizado)'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
