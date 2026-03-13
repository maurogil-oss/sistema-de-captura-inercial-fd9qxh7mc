import { cn } from '@/lib/utils'
import { useSimulation } from '@/stores/SimulationContext'
import { CloudLightning, MapPin } from 'lucide-react'
import { TripEvent } from '@/hooks/useInertialSensors'

export function MapMock({
  className,
  mode = 'default',
  events = [],
}: {
  className?: string
  mode?: 'default' | 'heatmap' | 'potholes'
  events?: TripEvent[]
}) {
  const { isSimulating } = useSimulation()

  const translatedMode =
    mode === 'heatmap' ? 'MAPA DE CALOR' : mode === 'potholes' ? 'BURACOS' : 'PADRÃO'

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
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q25,30 50,50 T100,50"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth="0.5"
        />
        <path
          d="M20,0 L20,100 M80,0 L80,100"
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth="0.2"
        />
        <path
          d="M10,80 Q50,20 90,80"
          fill="none"
          stroke="hsl(var(--primary))"
          className="opacity-50"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        {mode === 'potholes' && (
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

      {/* Render Event Markers */}
      {events.slice(-5).map((e, idx) => {
        const left = 20 + ((idx * 15) % 60)
        const top = 30 + ((idx * 10) % 40)
        return (
          <div
            key={e.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`${e.type} - ${e.timestamp}`}
          >
            <div className="relative">
              <div
                className={cn(
                  'w-3 h-3 rounded-full z-10 relative',
                  e.severity === 'critical' ? 'bg-destructive' : 'bg-amber-500',
                )}
              />
              <div
                className={cn(
                  'absolute inset-0 rounded-full animate-ping opacity-75',
                  e.severity === 'critical' ? 'bg-destructive' : 'bg-amber-500',
                )}
              />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 whitespace-nowrap bg-background/90 text-foreground text-[10px] px-2 py-1 rounded border border-border z-20">
              {e.type}
            </span>
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

      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono border border-border text-muted-foreground">
        CAMADA: {translatedMode} | EVENTOS: {events.length}
      </div>
    </div>
  )
}
