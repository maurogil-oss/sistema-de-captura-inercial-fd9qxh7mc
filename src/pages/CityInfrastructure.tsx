import { useState, useMemo } from 'react'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Target, MapIcon, Settings2, Wrench, CheckCircle2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAnomalyStore } from '@/stores/useAnomalyStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function CityInfrastructure() {
  const { clusters } = useAnomalyStore()
  const [automationEnabled, setAutomationEnabled] = useState(false)
  const [viewMode, setViewMode] = useState<'potholes' | 'predictive'>('potholes')

  const serviceOrders = useMemo(() => {
    return clusters
      .filter((c) => (c.detections || 0) >= 3 && (c.severity_g || 0) >= 1.5)
      .sort(
        (a, b) =>
          (b.severity_g || 0) * (b.detections || 0) - (a.severity_g || 0) * (a.detections || 0),
      )
      .map((c, i) => ({
        id: `SO-${1024 + i}`,
        location: `Setor ${String.fromCharCode(65 + (i % 5))}-${Math.floor(Math.random() * 10) + 1}`,
        lat: c.lat,
        lng: c.lng,
        avgG: c.severity_g?.toFixed(1) || '0.0',
        frequency: c.detections || 0,
        status: 'pendente',
      }))
  }, [clusters])

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Infraestrutura Urbana</h1>
          <p className="text-muted-foreground">
            Dashboard B2G: Índice de Saúde do Pavimento e Manutenção Preditiva.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
          <Button
            variant={viewMode === 'potholes' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('potholes')}
            className="text-xs"
          >
            Zeladoria / Buracos
          </Button>
          <Button
            variant={viewMode === 'predictive' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('predictive')}
            className="text-xs"
          >
            Desgaste / Preditiva
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card className="glass-panel overflow-hidden h-[550px] flex flex-col relative">
            <CardHeader className="pb-2 border-b border-border/50 z-10 bg-card/70 backdrop-blur absolute w-full top-0">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {viewMode === 'predictive' ? 'Wear Analysis' : 'Zeladoria 360'}
                  </CardTitle>
                  <CardDescription>
                    {viewMode === 'predictive'
                      ? 'Mapeamento de Hotspots de Degradação para Manutenção Preditiva'
                      : 'Índice de Saúde do Pavimento (PHI) mapeado via FFT inercial'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-background shadow-sm">
                  {viewMode === 'predictive' ? (
                    <span className="flex items-center gap-1.5 text-purple-500">
                      <Target className="w-3.5 h-3.5" /> Preditiva
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <MapIcon className="w-3.5 h-3.5" /> Mapeamento
                    </span>
                  )}
                  次
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative h-full">
              <MapMock mode={viewMode} />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          {viewMode === 'predictive' ? (
            <Card className="glass-panel h-[550px] flex flex-col">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="w-4 h-4 text-purple-500" />
                  Ordem de Serviço (Automação)
                </CardTitle>
                <div className="flex items-center justify-between pt-3">
                  <Label
                    htmlFor="automation-toggle"
                    className="text-xs text-muted-foreground flex flex-col gap-1"
                  >
                    <span>Gerar O.S. Automática</span>
                    <span className="text-[10px] font-normal opacity-70">
                      Para áreas de alto desgaste
                    </span>
                  </Label>
                  <Switch
                    id="automation-toggle"
                    checked={automationEnabled}
                    onCheckedChange={setAutomationEnabled}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden relative">
                {!automationEnabled ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-3">
                    <Wrench className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Automação desativada.</p>
                    <p className="text-xs opacity-70">
                      Ative para correlacionar impactos geograficamente e listar ordens de
                      manutenção sugeridas.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {serviceOrders.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          Nenhum hotspot atinge o limite de degradação no momento.
                        </div>
                      ) : (
                        serviceOrders.map((so) => (
                          <div
                            key={so.id}
                            className="p-3 bg-muted/20 border border-border/50 rounded-lg hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-sm text-purple-500 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {so.id}
                              </span>
                              <Badge variant="secondary" className="text-[10px]">
                                Pendente
                              </Badge>
                            </div>
                            <p className="text-xs font-medium mb-2">{so.location}</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="bg-background/50 p-1.5 rounded border border-border/50">
                                <span className="text-muted-foreground block mb-0.5">
                                  Impacto Médio
                                </span>
                                <span className="font-mono font-bold">{so.avgG}G</span>
                              </div>
                              <div className="bg-background/50 p-1.5 rounded border border-border/50">
                                <span className="text-muted-foreground block mb-0.5">
                                  Frequência
                                </span>
                                <span className="font-mono font-bold">
                                  {so.frequency} detecções
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
                              Aprovar O.S.
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Zonas Críticas (PHI)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      zone: 'Setor 4A',
                      reason: 'Alta Densidade de Buracos',
                      phi: 32,
                      severity: 'Alta',
                      volume: '14.500/dia',
                    },
                    {
                      zone: 'Cruzamento Principal',
                      reason: 'Pico no Índice de Quase-Acidente',
                      phi: 85,
                      severity: 'Crítica',
                      volume: '42.000/dia',
                    },
                  ].map((z) => (
                    <div
                      key={z.zone}
                      className="p-3 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-sm">{z.zone}</span>
                          <div className="flex gap-3 text-[10px] mt-1 text-muted-foreground font-mono">
                            <span>
                              Sev:{' '}
                              <span
                                className={
                                  z.severity === 'Crítica' ? 'text-destructive' : 'text-amber-500'
                                }
                              >
                                {z.severity}
                              </span>
                            </span>
                            <span>Vol: {z.volume}</span>
                          </div>
                        </div>
                        <Badge
                          variant={z.phi < 50 ? 'destructive' : 'secondary'}
                          className="font-mono text-[10px] h-5"
                        >
                          PHI {z.phi}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{z.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="w-4 h-4 text-primary" />
                    Auditoria de Velocidade
                  </CardTitle>
                  <CardDescription className="text-xs">Zonas Escolares</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Média Regulamentada</span>
                      <span className="font-mono">40 km/h</span>
                    </div>
                    <div className="flex justify-between text-xs text-destructive">
                      <span>Média Real L0</span>
                      <span className="font-mono">52 km/h</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-destructive w-[75%]" />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      Delta de 12km/h detectado em horários de pico
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
