import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Activity,
  Cpu,
  Key,
  Layers,
  Server,
  Shield,
  Smartphone,
  Zap,
  Battery,
  Wifi,
  Map as MapIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const LAYER_DATA = [
  {
    title: 'Camada 0: Dados Brutos',
    desc: 'Buffer efêmero armazenado localmente no dispositivo. Contém fluxos de alta frequência a 60Hz (Taxa de Amostragem de 60Hz): accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z e gps. Limpo após o processamento a menos que um evento dispare o salvamento do clipe.',
    badge: 'Buffer Local',
    theme: 'primary',
  },
  {
    title: 'Camada 1: Eventos Telemétricos',
    desc: 'Pacotes JSON enviados para a nuvem. Contém classificações de eventos (Frenagem Brusca, Aceleração Agressiva, Curva Perigosa, Impacto de Buraco, Uso de Celular), severidade base (1-10), localização e velocidade. Inclui o clipe de dados de 5s.',
    badge: 'Ingestão na Nuvem',
    theme: 'blue',
  },
  {
    title: 'Camada 2: Contexto de Viagem',
    desc: 'Eventos agregados em viagens contínuas. Inclui ID da Viagem, ID do Motorista, Distância, Duração, Tempo Ocioso, Condição Climática. Enriquecido com o Auditor de Contexto Ambiental que ajusta a severidade dos eventos.',
    badge: 'Enriquecimento',
    theme: 'amber',
  },
  {
    title: 'Camada 3: Inteligência de Negócio',
    desc: 'Métricas finais processadas para dashboards. Inclui Pontuação Zen do Motorista (Zen Score), Pegada de Carbono, Índice de Desgaste e Índice de Saúde do Pavimento (PHI).',
    badge: 'Visão Analítica',
    theme: 'purple',
  },
]

export default function OrbisSDK() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Frota de Produção Alpha',
      key: 'orb_live_****************8f92',
      devices: 142,
      status: 'Ativo',
    },
    {
      id: '2',
      name: 'Sandbox de Testes',
      key: 'orb_test_****************3a1b',
      devices: 5,
      status: 'Ativo',
    },
  ])

  const generateApiKey = () => {
    setApiKeys([
      ...apiKeys,
      {
        id: Date.now().toString(),
        name: 'Nova Chave de Integração',
        key: `orb_live_****************${Math.floor(Math.random() * 9000 + 1000)}`,
        devices: 0,
        status: 'Ativo',
      },
    ])
    toast({
      title: 'Chave de API Gerada',
      description: 'Nova chave SDK Orbis criada com sucesso.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SDK Inercial Orbis</h1>
        <p className="text-muted-foreground">
          Gerenciamento Centralizado de Ingestão de Dados e Edge AI.
        </p>
      </div>

      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="integration">Integração</TabsTrigger>
          <TabsTrigger value="edge">Processamento Edge AI</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" /> Endpoint de Ingestão de Dados
                </CardTitle>
                <CardDescription>
                  Interface de backend segura para pacotes de telemetria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL do Endpoint</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value="https://ingest.orbis-sdk.com/v1/telemetry"
                      className="font-mono text-sm bg-muted/50"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toast({ description: 'Copiado para a área de transferência' })}
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex items-start gap-3">
                  <Shield className="w-8 h-8 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">Otimização de Tráfego Ativa</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Atingindo <strong>redução de dados de 99,4%</strong> transmitindo apenas
                      clipes de eventos (2s antes / 3s depois do gatilho) em vez dos fluxos
                      contínuos brutos (Taxa de Amostragem de 60Hz).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Chaves de API</CardTitle>
                  <CardDescription>Autenticar instâncias do SDK</CardDescription>
                </div>
                <Button onClick={generateApiKey} size="sm" className="gap-2">
                  <Key className="w-4 h-4" /> Gerar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Chave de API</TableHead>
                      <TableHead className="text-right">Dispositivos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id} className="border-border/50">
                        <TableCell className="font-medium text-xs">{k.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {k.key}
                        </TableCell>
                        <TableCell className="text-right">{k.devices}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edge" className="space-y-6 mt-6">
          <Card className="glass-panel bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-primary" /> Eficiência Energética (Lazy Sensing)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Tecnologia Edge AI:</strong> O celular faz as contas localmente usando um
                chip de baixo consumo (Sensor Hub) e só liga a antena de internet para enviar
                alertas de exceção (como uma freada brusca). O consumo estimado é inferior a 3% por
                hora.
              </p>
              <div className="grid gap-4 md:grid-cols-3 mt-2">
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                  <Wifi className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Transmissão Orientada a Eventos</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Antena em estado de suspensão. Transmite apenas resumos de viagem e kilobytes
                      em eventos severos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                  <MapIcon className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Polling Adaptativo de GPS</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Taxa de atualização de GPS oscila entre 1Hz (movimento) e 30s (estacionário)
                      com base em IMU.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                  <Cpu className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Operação Headless</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Coprocessador de baixo consumo matem as rotinas L0 rodando em background (tela
                      apagada).
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Captura',
                value: '60Hz',
                desc: 'Sensor Hub (L0)',
                icon: Activity,
                color: 'text-blue-500',
              },
              {
                title: 'Fusão de Sensores',
                value: 'Auto-Calib',
                desc: 'Filtro de Kalman',
                icon: Smartphone,
                color: 'text-purple-500',
              },
              {
                title: 'Solavanco (da/dt)',
                value: 'Gatilhos',
                desc: 'Frenagem/Aceleração',
                icon: Zap,
                color: 'text-amber-500',
              },
              {
                title: 'Análise FFT',
                value: 'Anomalias',
                desc: 'Detecção de buracos',
                icon: Cpu,
                color: 'text-destructive',
              },
            ].map((stat, i) => (
              <Card key={i} className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <stat.icon className={cn('w-4 h-4', stat.color)} /> {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Cálculos Matemáticos na Borda (Edge)</CardTitle>
              <CardDescription>
                Algoritmos sendo executados localmente no Sovereign Kernel L0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">Filtro Passa-Alta (Remoção de Gravidade)</h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    |a| = √(x² + y² + z²) - 1g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Isola a aceleração linear pura removendo a força constante da gravidade.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">Cálculo de Jerk (Solavanco)</h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    da/dt = (a₂ - a₁) / Δt
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mede a taxa de variação da aceleração para detectar frenagens bruscas e
                    acelerações rápidas.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">Força Centrífuga (Força G Lateral)</h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    F_c = m * v² / r
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calcula a força lateral durante curvas para identificar eventos agressivos de
                    manobra.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">
                    Transformada Rápida de Fourier (FFT) para Detecção de Buracos
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    X(k) = Σ x(n) e^(-i2πkn/N)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Transformada Rápida de Fourier (FFT) aplicada ao eixo z para detectar anomalias
                    no pavimento e buracos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Catálogo de Dados Multicamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-primary/20 ml-3 md:ml-6 space-y-8 pb-4">
                {LAYER_DATA.map((layer, i) => (
                  <div key={i} className="relative pl-6 md:pl-8">
                    <span
                      className={cn(
                        'absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-background border-2 flex items-center justify-center',
                        layer.theme === 'primary' && 'border-primary',
                        layer.theme === 'blue' && 'border-blue-500',
                        layer.theme === 'amber' && 'border-amber-500',
                        layer.theme === 'purple' && 'border-purple-500',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          layer.theme === 'primary' && 'bg-primary',
                          layer.theme === 'blue' && 'bg-blue-500',
                          layer.theme === 'amber' && 'bg-amber-500',
                          layer.theme === 'purple' && 'bg-purple-500',
                        )}
                      />
                    </span>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{layer.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{layer.desc}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-fit bg-background font-mono text-xs',
                          layer.theme === 'blue' && 'text-blue-500 border-blue-500/30',
                          layer.theme === 'amber' && 'text-amber-500 border-amber-500/30',
                          layer.theme === 'purple' && 'text-purple-500 border-purple-500/30',
                        )}
                      >
                        {layer.badge}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
