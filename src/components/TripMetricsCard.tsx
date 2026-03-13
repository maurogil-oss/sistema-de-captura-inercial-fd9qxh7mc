import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TripMetricsCardProps {
  hasActivated: boolean
  isCapturing: boolean
  isMonitoring: boolean
  hasData: boolean
  maxJerk: number
  potholes: number
  phi: number
  zenScore: number
}

export function TripMetricsCard(props: TripMetricsCardProps) {
  const showStats = props.isCapturing || props.isMonitoring || props.hasData

  return (
    <Card className="glass-panel relative overflow-hidden shadow-sm">
      {props.isCapturing && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
      )}
      {props.isMonitoring && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
      )}
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-base">Métricas do Percurso L1</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm relative z-10 pt-4">
        <div className="flex justify-between items-center group">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Solavanco Máx (Jerk)
          </span>
          {!props.hasActivated ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className="font-mono text-destructive font-medium flex items-center gap-1">
              {showStats ? props.maxJerk.toFixed(1) : '0.0'}{' '}
              <span className="text-[10px] text-muted-foreground">da/dt</span>
            </span>
          )}
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Anomalias de Impacto
          </span>
          {!props.hasActivated ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <span className="font-mono text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded">
              {showStats ? props.potholes : '0'} detectadas
            </span>
          )}
        </div>

        <div className="flex justify-between items-center group pt-2 border-t border-border/30">
          <span className="text-muted-foreground font-medium">Índice de Saúde (PHI)</span>
          {!props.hasActivated ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <span
              className={cn(
                'text-lg font-mono font-bold transition-colors',
                props.phi < 80
                  ? 'text-destructive'
                  : props.phi < 95
                    ? 'text-amber-500'
                    : 'text-emerald-500',
              )}
            >
              {showStats ? Math.round(props.phi) : '100'}
              <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">/100</span>
            </span>
          )}
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-muted-foreground font-medium">Driver Zen Score</span>
          {!props.hasActivated ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <span
              className={cn(
                'text-lg font-mono font-bold transition-colors',
                props.zenScore < 80
                  ? 'text-destructive'
                  : props.zenScore < 95
                    ? 'text-amber-500'
                    : 'text-emerald-500',
              )}
            >
              {showStats ? Math.round(props.zenScore) : '100'}
              <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">pts</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
