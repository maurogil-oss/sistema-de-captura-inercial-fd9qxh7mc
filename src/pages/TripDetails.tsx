import { useMemo } from 'react'
import { mockTripTimeline } from '@/data/mockData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CloudLightning,
  MapPin,
  Play,
  Square,
  Activity,
  AlertTriangle,
  Smartphone,
  Shield,
  Key,
} from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'
import { useInertialSensors } from '@/hooks/useInertialSensors'
import { cn } from '@/lib/utils'

export default function TripDetails() {
  const {
    isCapturing,
    isWaiting,
    startCapture,
    stopCapture,
    data,
    error,
    zenScore,
    phi,
    maxJerk,
    potholes,
    permissionState,
  } = useInertialSensors()

  const sessionId = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const rand = (len: number) =>
      Array.from({ length: len })
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('')
    return `TRP-${rand(4)}-${rand(2)}`
  }, [])

  const hasActivated = permissionState === 'granted' || isCapturing
  const displayData = data.length > 0 ? data : mockTripTimeline

  return (
    <div className="space-y-6 animate-fade-in pb-12 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-mono truncate">
              {sessionId}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                'border whitespace-nowrap',
                isCapturing
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : permissionState === 'idle' ||
                      permissionState === 'unsupported' ||
                      permissionState === 'denied'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20',
              )}
            >
              {isCapturing
                ? 'GRAVANDO AO VIVO'
                : permissionState === 'idle' ||
                    permissionState === 'unsupported' ||
                    permissionState === 'denied'
                  ? 'AGUARDANDO ATIVAÇÃO'
                  : 'SESSÃO PRONTA'}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-3 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Rota Desconhecida
            </span>
            <span className="flex items-center gap-1 text-purple-500 font-medium bg-purple-500/10 px-2 py-0.5 rounded">
              <CloudLightning className="w-4 h-4" /> Sem Contexto
            </span>
            {isCapturing && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse w-full sm:w-auto mt-2 sm:mt-0">
                <Activity className="w-4 h-4" /> Processando Buffer L0
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 text-left md:text-right w-full md:w-auto justify-between md:justify-end">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Sessão Edge-Only
              </p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-primary" /> Anônima
              </p>
            </div>
          </div>

          {isCapturing ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopCapture}
              className="gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg"
            >
              <Square className="w-5 h-5" fill="currentColor" /> Parar Captura
            </Button>
          ) : isWaiting ? (
            <Button
              size="lg"
              disabled
              className="gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg bg-primary/80 text-primary-foreground"
            >
              <Activity className="w-5 h-5 animate-spin" /> Aguardando Sensores...
            </Button>
          ) : permissionState === 'granted' ? (
            <Button
              size="lg"
              onClick={startCapture}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg shadow-emerald-900/20"
            >
              <Play className="w-5 h-5" fill="currentColor" /> Iniciar Captura
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startCapture}
              disabled={permissionState === 'unsupported'}
              className={cn(
                'gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg text-white',
                permissionState === 'unsupported' ? '' : 'bg-amber-600 hover:bg-amber-700',
              )}
            >
              <Key className="w-5 h-5" fill="currentColor" /> Ativar Sensores
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription className="mt-1">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Telemetria Inercial de Alta Frequência
                </CardTitle>
                <CardDescription className="mt-1">
                  {isCapturing
                    ? 'Buffer efêmero renderizando aceleração e giroscópio a ~60Hz.'
                    : permissionState === 'unsupported'
                      ? 'Dispositivo incompatível com simulação em tempo real.'
                      : 'Toque em Ativar Sensores para capturar dados reais dos sensores do seu smartphone.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {!hasActivated ? (
                <div className="space-y-6 pt-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[200px] flex flex-col space-y-3">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="flex-1 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <TripCharts data={displayData} animate={!isCapturing} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden flex flex-col h-[300px] sm:h-[400px]">
            <CardHeader className="pb-2 absolute z-10 bg-background/60 backdrop-blur-md w-full border-b border-border/50">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Replay do Trajeto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-muted/10">
              <MapMock mode="default" />
              {!isCapturing && data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <p className="text-xs font-mono text-muted-foreground border border-border bg-background px-3 py-1.5 rounded-full shadow-sm">
                    AGUARDANDO DADOS
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel relative overflow-hidden shadow-sm">
            {isCapturing && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            )}
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base">Métricas do Percurso L1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm relative z-10 pt-4">
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Solavanco Máx (Jerk)
                </span>
                {!hasActivated ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <span className="font-mono text-destructive font-medium flex items-center gap-1">
                    {isCapturing || data.length > 0 ? maxJerk.toFixed(1) : '0.0'}{' '}
                    <span className="text-[10px] text-muted-foreground">da/dt</span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Anomalias de Impacto
                </span>
                {!hasActivated ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <span className="font-mono text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
                    {isCapturing || data.length > 0 ? potholes : '0'} detectadas
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center group pt-2 border-t border-border/30">
                <span className="text-muted-foreground font-medium">Índice de Saúde (PHI)</span>
                {!hasActivated ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <span
                    className={cn(
                      'text-lg font-mono font-bold transition-colors',
                      phi < 80
                        ? 'text-destructive'
                        : phi < 95
                          ? 'text-amber-500'
                          : 'text-emerald-500',
                    )}
                  >
                    {isCapturing || data.length > 0 ? Math.round(phi) : '100'}
                    <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">
                      /100
                    </span>
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground font-medium">Driver Zen Score</span>
                {!hasActivated ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <span
                    className={cn(
                      'text-lg font-mono font-bold transition-colors',
                      zenScore < 80
                        ? 'text-destructive'
                        : zenScore < 95
                          ? 'text-amber-500'
                          : 'text-emerald-500',
                    )}
                  >
                    {isCapturing || data.length > 0 ? Math.round(zenScore) : '100'}
                    <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">
                      pts
                    </span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
