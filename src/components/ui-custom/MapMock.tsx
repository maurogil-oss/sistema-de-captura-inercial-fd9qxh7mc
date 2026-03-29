import { cn } from '@/lib/utils'
import { useSimulation } from '@/stores/SimulationContext'
import { CloudLightning, MapPin } from 'lucide-react'
import { TripEvent } from '@/hooks/useInertialSensors'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

export function MapMock({
  className,
  mode = 'default',
  events = [],
  conditionHistory = [],
}: {
  className?: string
  mode?: 'default' | 'heatmap' | 'potholes'
  events?: TripEvent[]
  conditionHistory?: number[]
}) {
  const { isSimulating } = useSimulation()

  const clusters = useAnomalyStore((state) => state.clusters)

  const translatedMode =
    mode === 'heatmap' ? 'MAPA DE CALOR' : mode === 'potholes' ? 'BURACOS E VIA' : 'PADRÃO'

  const getConditionColor = (pct: number) => {
    if (pct > 80) return '#10b981' // emerald-500
    if (pct > 40) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  const hasGradient = conditionHistory && conditionHistory.length > 0
  const gradientId = `wear-gradient-${Math.random().toString(36).substring(2, 9)}`

  return (
    <div
      className={cn(
        'relative w-full h-full bg-[#0B0E14] overflow-hidden rounded-lg border border-border/50',
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#1A1F26 1px, transparent 1px), linear-gradient(90deg, #1A1F26 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {hasGradient && (
          <defs>
            <linearGradient id={gradientId} x1="10%" y1="80%" x2="90%" y2="80%">
              {conditionHistory.map((pct, idx) => (
                <stop
                  key={idx}
                  offset={`${(idx / (conditionHistory.length > 1 ? conditionHistory.length - 1 : 1)) * 100}%`}
                  stopColor={getConditionColor(pct)}
                />
              ))}
            </linearGradient>
          </defs>
        )}

        {/* Background paths */}
        <path
          d="M0,50 Q25,30 50,50 T100,50"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground opacity-30"
          strokeWidth="0.5"
        />
        <path
          d="M20,0 L20,100 M80,0 L80,100"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground opacity-30"
          strokeWidth="0.2"
        />

        {/* The main trajectory path mapped with the condition gradient */}
        <path
          d="M10,80 Q50,20 90,80"
          fill="none"
          stroke={
            hasGradient && mode === 'potholes' ? `url(#${gradientId})` : 'hsl(var(--primary))'
          }
          className={cn('transition-all duration-500', !hasGradient && 'opacity-50')}
          strokeWidth={mode === 'potholes' ? '3' : '1.5'}
          strokeDasharray={mode === 'potholes' ? 'none' : '4,4'}
        />

        {/* Potholes specific extra path (optional fallback) */}
        {mode === 'potholes' && !hasGradient && (
          <path
            d="M0,70 Q40,90 100,30"
            fill="none"
            stroke="currentColor"
            className="text-destructive"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}
      </svg>

      {/* Render Global Anomaly Clusters */}
      {clusters.map((cluster) => {
        const minLat = -23.56
        const maxLat = -23.54
        const minLng = -46.64
        const maxLng = -46.62

        const top = ((cluster.lat - minLat) / (maxLat - minLat)) * 100
        const left = ((cluster.lng - minLng) / (maxLng - minLng)) * 100

        if (top < 0 || top > 100 || left < 0 || left > 100) return null

        return (
          <TooltipProvider key={cluster.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20 hover:scale-125 transition-transform"
                  style={{ left: `${left}%`, top: `${top}%` }}
                >
                  {cluster.status === 'Confirmed' ? (
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full z-10 relative border-2 border-[#0B0E14] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                      <div className="absolute inset-0 rounded-full animate-ping opacity-50 bg-red-600" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full z-10 relative border-2 border-[#0B0E14] bg-yellow-400 opacity-90" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
                <p className="font-bold text-sm mb-0.5 flex items-center gap-1.5">
                  {cluster.status === 'Confirmed' ? (
                    <span className="text-red-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Confirmed Anomaly
                    </span>
                  ) : (
                    <span className="text-yellow-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Potential Anomaly
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Detected {cluster.detections}/10 times for confirmation
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                  First: {new Date(cluster.firstDetected).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {/* Render Local Event Markers */}
      {events.slice(-10).map((e, idx, arr) => {
        const t = (idx + 1) / (arr.length + 1)
        const left = Math.pow(1 - t, 2) * 10 + 2 * (1 - t) * t * 50 + Math.pow(t, 2) * 90
        const top = Math.pow(1 - t, 2) * 80 + 2 * (1 - t) * t * 20 + Math.pow(t, 2) * 80

        return (
          <div
            key={e.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          </div>
        )
      })}

      <div className="absolute top-[48%] left-[48%]">
        <MapPin className="w-5 h-5 text-primary transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {isSimulating && (
        <div className="absolute top-[30%] left-[70%]">
          <div className="w-2 h-2 bg-destructive rounded-full" />
          <div className="absolute inset-0 bg-destructive rounded-full animate-ping opacity-75" />
        </div>
      )}

      {mode === 'heatmap' && (
        <>
          <div className="absolute top-[60%] left-[30%] w-16 h-16 bg-amber-500/20 blur-xl rounded-full" />
          <div className="absolute top-[40%] left-[60%] w-24 h-24 bg-destructive/30 blur-2xl rounded-full" />
          <div className="absolute top-[40%] left-[60%] w-12 h-12 bg-purple-500/40 blur-xl rounded-full" />
          <div className="absolute top-[45%] left-[65%] flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
            <CloudLightning className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-[8px] font-mono text-purple-300 font-bold mt-1 bg-background/80 px-1 rounded">
              SEVERIDADE 2.0x
            </span>
          </div>
        </>
      )}

      {mode === 'potholes' && hasGradient && (
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-2 py-1.5 rounded flex gap-2 items-center text-[10px] font-mono border border-border shadow-sm">
          <span className="text-muted-foreground">VIA:</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Smooth" />
            <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Moderate" />
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Rough" />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono border border-border text-muted-foreground">
        CAMADA: {translatedMode} | EVENTOS: {events.length}
      </div>
    </div>
  )
}
