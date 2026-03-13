import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import { EventBadge } from './ui-custom/EventBadge'
import { TripEvent } from '@/hooks/useInertialSensors'

export function TripCriticalEvents({ events }: { events: TripEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <Card className="glass-panel h-full flex flex-col">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" /> Painel de Eventos Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[150px] text-muted-foreground text-sm flex-col gap-2">
          <ShieldAlert className="w-8 h-8 opacity-20" />
          Nenhum evento anômalo detectado até o momento.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-panel h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Eventos Detectados
          </span>
          <span className="text-xs font-mono bg-background px-2 py-1 rounded-full border border-border text-muted-foreground">
            {events.length} Registros
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[250px] w-full">
          <div className="flex flex-col divide-y divide-border/50">
            {[...events].reverse().map((event) => (
              <div
                key={event.id}
                className="p-4 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors animate-in fade-in slide-in-from-left-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <EventBadge type={event.type} severity={event.severity} />
                    <span className="text-xs font-medium text-foreground">{event.details}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
