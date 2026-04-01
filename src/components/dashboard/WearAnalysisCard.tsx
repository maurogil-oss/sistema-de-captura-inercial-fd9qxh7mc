import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Wrench, MapPin, Plus, AlertTriangle, Info } from 'lucide-react'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ServiceOrder {
  id: string
  location: string
  severityLevel: 'Low' | 'Medium' | 'High'
  dateDetected: string
  priorityScore: number
}

export function WearAnalysisCard() {
  const { clusters } = useAnomalyStore()
  const [pendingSOs, setPendingSOs] = useState<ServiceOrder[]>([])

  const segments = useMemo(() => {
    return clusters
      .filter((c) => c.status === 'Confirmed' || c.status === 'Potential')
      .map((c, i) => {
        const freq = c.detections || 1
        const avgG = c.severity_g || 0.5
        const priorityScore = freq * avgG
        let severityLevel: 'Low' | 'Medium' | 'High' = 'Low'
        if (priorityScore > 10) severityLevel = 'High'
        else if (priorityScore > 5) severityLevel = 'Medium'

        return {
          id: c.id || `seg-${i}`,
          location: `Lat: ${c.lat?.toFixed(4)}, Lng: ${c.lng?.toFixed(4)}`,
          freq,
          avgG,
          priorityScore,
          severityLevel,
          dateDetected: c.lastDetected || new Date().toISOString(),
        }
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10)
  }, [clusters])

  const handleGenerateSO = (seg: any) => {
    if (pendingSOs.find((so) => so.id === seg.id)) return
    setPendingSOs([
      ...pendingSOs,
      {
        id: seg.id,
        location: seg.location,
        severityLevel: seg.severityLevel,
        dateDetected: seg.dateDetected,
        priorityScore: seg.priorityScore,
      },
    ])
  }

  return (
    <Card className="glass-panel flex flex-col h-[450px] lg:h-full w-full">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-500" />
          Predictive Maintenance & Wear Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col md:flex-row min-h-0">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-border/50 flex flex-col h-1/2 md:h-full min-h-0">
          <div className="p-3 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground">
            Segmentos de Alto Desgaste
          </div>
          <ScrollArea className="flex-1">
            {segments.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <AlertTriangle className="w-6 h-6 opacity-50" />
                Nenhum segmento analisado.
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-3 rounded-lg bg-muted/20 border border-border/50 text-sm flex flex-col xl:flex-row justify-between xl:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5" /> {seg.location}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span>
                          Score: <strong>{seg.priorityScore.toFixed(1)}</strong> (Freq: {seg.freq},
                          Sev: {seg.avgG.toFixed(1)}G)
                        </span>
                        <Tooltip>
                          <TooltipTrigger type="button" className="cursor-help">
                            <Info className="w-3 h-3 text-muted-foreground opacity-70 hover:opacity-100 transition-opacity" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px] text-xs" side="right">
                            <p>
                              <strong>Priority Score</strong> é calculado multiplicando a Frequência
                              (Nº de detecções) pela Severidade (Força G), definindo o quão urgente
                              é a manutenção.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateSO(seg)}
                      disabled={pendingSOs.some((so) => so.id === seg.id)}
                      className="text-xs h-7 self-start xl:self-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Gerar O.S.
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex-1 flex flex-col h-1/2 md:h-full min-h-0">
          <div className="p-3 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground flex justify-between items-center">
            <span>Manutenção Pendente</span>
            <Badge variant="outline" className="text-[10px] h-4.5">
              {pendingSOs.length} O.S.
            </Badge>
          </div>
          <ScrollArea className="flex-1 bg-background/50">
            {pendingSOs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Wrench className="w-6 h-6 opacity-50" />
                Nenhuma ordem de serviço pendente.
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {pendingSOs.map((so) => (
                  <div
                    key={so.id}
                    className="p-3 rounded-lg bg-card border border-border/50 shadow-sm space-y-2 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
                    <div className="flex justify-between items-start pl-2">
                      <span className="font-medium text-xs truncate max-w-[200px]">
                        {so.location}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          so.severityLevel === 'High'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : so.severityLevel === 'Medium'
                              ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }
                      >
                        {so.severityLevel}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between pl-2">
                      <span>Detectado: {new Date(so.dateDetected).toLocaleDateString()}</span>
                      <span className="font-mono">P-Score: {so.priorityScore.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
