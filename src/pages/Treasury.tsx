import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  HeartPulse,
  Coins,
  ArrowRightLeft,
  DollarSign,
  Leaf,
  History,
  Globe,
  FileJson,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const vCertData = [
  { month: 'Jan', price: 12.5, volume: 450 },
  { month: 'Fev', price: 13.2, volume: 520 },
  { month: 'Mar', price: 14.8, volume: 610 },
  { month: 'Abr', price: 14.5, volume: 580 },
  { month: 'Mai', price: 15.9, volume: 720 },
  { month: 'Jun', price: 17.4, volume: 850 },
]

const mintedAssets = [
  { id: '1', date: '2023-10-25', amount: 15, hash: '0x3f9a...b112', status: 'Minted' },
  { id: '2', date: '2023-09-28', amount: 22, hash: '0x88c1...e455', status: 'Minted' },
  { id: '3', date: '2023-08-30', amount: 18, hash: '0x1a2b...9c8d', status: 'Minted' },
  { id: '4', date: '2023-07-29', amount: 29, hash: '0x55ff...22aa', status: 'Minted' },
]

export default function Treasury() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tesouraria & Ativos</h1>
          <p className="text-muted-foreground">
            Módulo Financeiro B2G: ROI, V-Certs e Impacto em Saúde Pública.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Liquidar V-Certs
        </Button>
      </div>

      <Tabs defaultValue="v-certs" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger
              value="v-certs"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Visão Geral (V-Certs)
            </TabsTrigger>
            <TabsTrigger
              value="carbon"
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Carbon Wallet (RWA)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="v-certs" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Economia Estimada em Asfalto</CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">R$ 1.2M</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Economia gerada por manutenção preditiva neste ano.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total de V-Certs (Carteira)</CardTitle>
                <Coins className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">84.500 VC</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/10"
                  >
                    ~ R$ 1.47M
                  </Badge>
                  <span className="text-xs text-muted-foreground">Cotação atual: R$ 17.40/VC</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -z-10" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Impacto em Saúde Pública</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help p-1">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Correlação entre fluidez do trânsito e redução de custos com serviços de
                    emergência (SAMU).
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">-18%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Redução estimada em custos de emergência devido à melhoria viária.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Histórico de Cotação V-Cert</CardTitle>
              <CardDescription>
                Evolução do valor de mercado dos créditos de validação inercial gerados pelo
                município.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ChartContainer
                  config={{ price: { color: 'hsl(var(--primary))', label: 'Preço (R$)' } }}
                >
                  <AreaChart data={vCertData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="var(--color-price)"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  Créditos de Carbono (RWA)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help inline-block ml-1">
                        <Leaf className="w-3.5 h-3.5 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px]">
                      Calculado via MRV Digital com base nas diretrizes do IPCC para fatores de
                      emissão, utilizando dados de telemetria (tempo ocioso, otimização de rotas).
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <Globe className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">84 tCO2e</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Evitadas e tokenizadas na OrbisChain.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Equivalência em V-Certs</CardTitle>
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.600 VC</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    Taxa: 150 VC / Ton
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Valor de Mercado Estimado</CardTitle>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-500">$ 4.200 USD</div>
                <p className="text-xs text-muted-foreground mt-1">Preço Spot: $50 / Ton CO2</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                Ativos Cunhados (Minted Assets)
              </CardTitle>
              <CardDescription>
                Histórico de certificados de redução de emissões tokenizados como Real World Assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mintedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border border-border/50 bg-background/50 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Leaf className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Lote de Redução CO2 #{asset.id}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{asset.date}</span>
                          <span>•</span>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                            {asset.hash}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="font-bold text-emerald-500">+{asset.amount} tCO2e</div>
                        <div className="text-xs text-muted-foreground">OrbisChain</div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 cursor-default">
                        <FileJson className="w-4 h-4" />
                        Certificado
                      </Button>
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
