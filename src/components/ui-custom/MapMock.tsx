import { cn } from '@/lib/utils'
import { useSimulation } from '@/stores/SimulationContext'
import { CloudLightning, MapPin, AlertTriangle } from 'lucide-react'
import { TripEvent } from '@/hooks/useInertialSensors'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { DateRange } from 'react-day-picker'

export function MapMock({
  className,
  mode = 'default',
  events = [],
  conditionHistory = [],
  dateRange,
}: {
  className?: string
  mode?: 'default' | 'heatmap' | 'potholes' | 'cluster'
  events?: TripEvent[]
  conditionHistory?: number[]
  dateRange?: DateRange
}) {
  const { isSimulating } = useSimulation()
  const allClusters = useAnomalyStore((state) => state.clusters)
  const allSafetyEvents = useAnomalyStore((state) => state.safetyEvents)

  const clusters = allClusters.filter((c) => {
    if (!dateRange?.from) return true
    if (!c.lastDetected) return true
    const d = new Date(c.lastDetected)
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    return true
  })

  const safetyEvents = allSafetyEvents.filter((e) => {
    if (!dateRange?.from) return true
    if (!e.timestamp) return true
    const d = new Date(e.timestamp)
    if (d < dateRange.from) return false
    if (dateRange.to && d > dateRange.to) return false
    return true
  })

  const translatedMode =
    mode === 'heatmap'
      ? 'MAPA DE CALOR'
      : mode === 'potholes'
        ? 'BURACOS E VIA'
        : mode === 'cluster'
          ? 'CLUSTERS & RISCOS'
          : 'PADRÃO'

  const getConditionColor = (pct: number) => {
    if (pct > 80) return '#10b981' // emerald-500
    if (pct > 40) return '#eab308' // yellow-500
    return '#ef4444' // red-500
  }

  const hasGradient = conditionHistory && conditionHistory.length > 0
  const gradientId = `wear-gradient-${Math.random().toString(36).substring(2, 9)}`

  const getCoordinates = (lat?: number, lng?: number) => {
    if (lat === undefined || lng === undefined) return { top: -1, left: -1 }
    const minLat = -23.56
    const maxLat = -23.54
    const minLng = -46.64
    const maxLng = -46.62
    const top = ((lat - minLat) / (maxLat - minLat)) * 100
    const left = ((lng - minLng) / (maxLng - minLng)) * 100
    return { top, left }
  }

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
      </svg>

      {/* Render Heatmap Gradient Mode */}
      {mode === 'heatmap' &&
        clusters.map((cluster) => {
          const { top, left } = getCoordinates(cluster.lat, cluster.lng)
          if (top < 0 || top > 100 || left < 0 || left > 100) return null

          let colorClass = 'bg-emerald-500'
          const severity = cluster.severity_g ?? 0
          if (severity >= 3) colorClass = 'bg-red-500'
          else if (severity >= 2) colorClass = 'bg-orange-500'
          else if (severity >= 1) colorClass = 'bg-yellow-500'

          return (
            <div
              key={`hm-${cluster.id}`}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-xl opacity-60 pointer-events-none transition-colors',
                colorClass,
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
            />
          )
        })}

      {/* Render Global Anomaly Clusters */}
      {(mode === 'default' || mode === 'cluster') &&
        clusters.map((cluster) => {
          const { top, left } = getCoordinates(cluster.lat, cluster.lng)
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
                    ) : cluster.status === 'Repaired' ? (
                      <div className="relative">
                        <div className="w-4 h-4 rounded-full z-10 relative border-2 border-[#0B0E14] bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.6)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-blue-100 rounded-full" />
                        </div>
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
                        <MapPin className="w-3.5 h-3.5" /> Defeito Confirmado
                      </span>
                    ) : cluster.status === 'Repaired' ? (
                      <span className="text-blue-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Possível Reparo
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Potencial Anomalia
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Detecções: {cluster.detections ?? 0} | Max Z:{' '}
                    {(cluster.severity_g ?? 0).toFixed(1)}g
                  </p>
                  {cluster.status === 'Repaired' && (
                    <p className="text-[10px] text-blue-500/80 mt-1">
                      Passagens sem vibração: {cluster.passesWithoutAnomaly ?? 0}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                    Última vez:{' '}
                    {cluster.lastDetected
                      ? new Date(cluster.lastDetected).toLocaleDateString()
                      : 'Desconhecido'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}

      {/* Render Safety Events (Near-Misses) */}
      {(mode === 'default' || mode === 'cluster') &&
        safetyEvents.map((event) => {
          const { top, left } = getCoordinates(event.lat, event.lng)
          if (top < 0 || top > 100 || left < 0 || left > 100) return null

          return (
            <TooltipProvider key={event.id} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-30 hover:scale-125 transition-transform"
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.8)] border border-orange-200 rotate-45">
                      <span className="text-[12px] font-bold text-white -rotate-45 block transform -translate-y-[1px]">
                        !
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-popover text-popover-foreground border-border shadow-lg z-50">
                  <p className="font-bold text-sm mb-0.5 text-orange-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> {event.type}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-70">
                    {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Desconhecido'}
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

      <div className="absolute top-[48%] left-[48%] pointer-events-none">
        <MapPin className="w-5 h-5 text-primary transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {isSimulating && (
        <div className="absolute top-[30%] left-[70%] pointer-events-none">
          <div className="w-2 h-2 bg-destructive rounded-full" />
          <div className="absolute inset-0 bg-destructive rounded-full animate-ping opacity-75" />
        </div>
      )}

      {mode === 'potholes' && hasGradient && (
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-2 py-1.5 rounded flex gap-2 items-center text-[10px] font-mono border border-border shadow-sm pointer-events-none">
          <span className="text-muted-foreground">VIA:</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Smooth" />
            <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Moderate" />
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Rough" />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono border border-border text-muted-foreground pointer-events-none">
        CAMADA: {translatedMode} | EVENTOS: {events.length + safetyEvents.length}
      </div>
    </div>
  )
}
