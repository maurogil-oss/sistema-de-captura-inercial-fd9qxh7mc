import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Target } from 'lucide-react'

export default function CityInfrastructure() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infraestrutura Urbana</h1>
        <p className="text-muted-foreground">
          Dashboard B2G: Índice de Saúde do Pavimento e Auditorias de Segurança.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel overflow-hidden h-[500px] flex flex-col">
            <CardHeader className="pb-2 border-b border-border/50 z-10 bg-card/50 backdrop-blur absolute w-full">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Zeladoria 360 / Mapeamento de Buracos</CardTitle>
                  <CardDescription>
                    Índice de Saúde do Pavimento (PHI) mapeado via FFT inercial
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-background">
                  Modo de Risco
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <MapMock mode="potholes" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Zonas Críticas
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
                <div key={z.zone} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold">{z.zone}</span>
                      <div className="flex gap-3 text-[10px] mt-1 text-muted-foreground font-mono">
                        <span>
                          Severidade:{' '}
                          <span
                            className={
                              z.severity === 'Crítica' ? 'text-destructive' : 'text-amber-500'
                            }
                          >
                            {z.severity}
                          </span>
                        </span>
                        <span>
                          Volume de Tráfego: <span className="text-foreground">{z.volume}</span>
                        </span>
                      </div>
                    </div>
                    <Badge variant={z.phi < 50 ? 'destructive' : 'secondary'} className="font-mono">
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
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Auditoria de Velocidade Real
              </CardTitle>
              <CardDescription>Zonas Escolares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Média Regulamentada</span>
                  <span className="font-mono">40 km/h</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>Média Real L0</span>
                  <span className="font-mono">52 km/h</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-destructive w-[75%]" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Delta de 12km/h detectado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
