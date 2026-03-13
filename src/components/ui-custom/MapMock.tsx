import { cn } from '@/lib/utils'
import { useSimulation } from '@/stores/SimulationContext'

export function MapMock({
  className,
  mode = 'default',
}: {
  className?: string
  mode?: 'default' | 'heatmap' | 'potholes'
}) {
  const { isSimulating } = useSimulation()

  return (
    <div
      className={cn(
        'relative w-full h-full bg-[#0B0E14] overflow-hidden rounded-lg border border-border/50',
        className,
      )}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#1A1F26 1px, transparent 1px), linear-gradient(90deg, #1A1F26 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      {/* Stylized map paths (mock) */}
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

      {/* Simulated Events */}
      <div className="absolute top-[48%] left-[48%]">
        <div className="w-3 h-3 bg-primary rounded-full" />
        <div className="absolute inset-0 bg-primary rounded-full animate-ping-slow opacity-75" />
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
          <div className="absolute top-[40%] left-[60%] w-24 h-24 bg-destructive/20 blur-xl rounded-full" />
        </>
      )}

      {/* Overlay controls or labels */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono border border-border text-muted-foreground">
        LAYER: {mode.toUpperCase()}
      </div>
    </div>
  )
}
