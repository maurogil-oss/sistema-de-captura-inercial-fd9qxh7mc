import { Card, CardTitle } from '@/components/ui/card'
import { Map as MapIcon, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function RWAMap() {
  return (
    <Card className="glass-panel border-blue-500/20 overflow-hidden relative min-h-[300px] h-[300px]">
      <div className="absolute inset-0 bg-muted/20 mix-blend-multiply pointer-events-none z-0"></div>
      {/* Mock Map Background */}
      <div
        className="absolute inset-0 opacity-40 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://img.usecurling.com/p/800/400?q=city%20map&color=blue&dpr=2")',
        }}
      />
      <div className="relative z-10 p-4 pointer-events-none h-full flex flex-col">
        <div className="flex items-center justify-between mb-auto">
          <CardTitle className="text-sm flex items-center gap-2 bg-background/80 backdrop-blur px-3 py-1.5 rounded-md border border-border/50">
            <MapIcon className="w-4 h-4 text-blue-500" />
            Geospatial RWA Mapping
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 backdrop-blur"
          >
            Live Telemetry Sync
          </Badge>
        </div>

        {/* Mock RWA Zones */}
        <div className="absolute top-[40%] left-[20%] flex flex-col items-center animate-pulse">
          <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/50">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="mt-1 text-[10px] font-bold bg-background/80 px-1.5 rounded text-emerald-600 shadow-sm border border-border/50">
            +2.5 tCO2e
          </span>
        </div>

        <div
          className="absolute top-[60%] left-[60%] flex flex-col items-center animate-pulse"
          style={{ animationDelay: '1s' }}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/50">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="mt-1 text-[10px] font-bold bg-background/80 px-1.5 rounded text-emerald-600 shadow-sm border border-border/50">
            +4.1 tCO2e
          </span>
        </div>

        <div
          className="absolute top-[25%] left-[75%] flex flex-col items-center animate-pulse"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/50">
            <MapPin className="w-3 h-3 text-emerald-600" />
          </div>
          <span className="mt-1 text-[10px] font-bold bg-background/80 px-1.5 rounded text-emerald-600 shadow-sm border border-border/50">
            +0.8 tCO2e
          </span>
        </div>
      </div>
    </Card>
  )
}
