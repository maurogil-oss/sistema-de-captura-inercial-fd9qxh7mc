import { cn } from '@/lib/utils'
import { useSimulation } from '@/stores/SimulationContext'
import { CloudLightning } from 'lucide-react'

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

          {/* Weather-contextualized high risk area */}
          <div className="absolute top-[40%] left-[60%] w-24 h-24 bg-destructive/30 blur-2xl rounded-full" />
          <div className="absolute top-[40%] left-[60%] w-12 h-12 bg-purple-500/40 blur-xl rounded-full" />
          <div className="absolute top-[45%] left-[65%] flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
            <CloudLightning className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="text-[8px] font-mono text-purple-300 font-bold mt-1 bg-background/80 px-1 rounded">
              2.0x SEVERITY
            </span>
          </div>
        </>
      )}

      {/* Overlay controls or labels */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1.5 rounded text-[10px] font-mono border border-border text-muted-foreground">
        LAYER: {mode.toUpperCase()}
      </div>
    </div>
  )
}
