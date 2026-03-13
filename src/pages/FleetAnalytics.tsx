import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FleetRankingTable } from '@/components/FleetRankingTable'
import { MapMock } from '@/components/ui-custom/MapMock'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { mockESGData } from '@/data/mockData'
import { Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FleetAnalytics() {
  const chartConfig = {
    co2: { label: 'Emissões de CO2 (t)', color: 'hsl(var(--primary))' },
    idling: { label: 'Tempo Ocioso (h)', color: 'hsl(var(--destructive))' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise de Frota</h1>
          <p className="text-muted-foreground">Dashboard B2B: Eficiência, ESG e Manutenção.</p>
        </div>
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full max-w-3xl grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="ranking" className="py-2">
            Ranking de Eficiência
          </TabsTrigger>
          <TabsTrigger value="esg" className="py-2">
            Relatório ESG (Escopo 1)
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="py-2">
            Mapa de Calor de Risco
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-6 mt-6">
          <FleetRankingTable />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Manutenção Preditiva de Suspensão</CardTitle>
                  <CardDescription>Sinalizado por análise de impacto vertical (L0)</CardDescription>
                </div>
                <Wrench className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  {[
                    { v: 'V-042', reason: 'Estresse Alto na Suspensão', count: 14 },
                    { v: 'V-118', reason: 'Anomalia no Desgaste das Pastilhas', count: 8 },
                  ].map((item) => (
                    <div
                      key={item.v}
                      className="flex justify-between items-center p-3 border border-border/50 rounded-lg bg-muted/20"
                    >
                      <div>
                        <p className="font-mono font-bold text-sm">{item.v}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Inspecionar ({item.count})
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="esg" className="mt-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>
                Relatório ESG (Escopo 1) e Relatório de Desperdício (Ociosidade)
              </CardTitle>
              <CardDescription>
                Monitoramento de redução de emissões em relação ao tempo de motor ocioso.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    data={mockESGData}
                    margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-border/50"
                    />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}t`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      yAxisId="left"
                      dataKey="co2"
                      fill="var(--color-co2)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="idling"
                      fill="var(--color-idling)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6 space-y-6">
          <Card className="glass-panel overflow-hidden h-[600px] flex flex-col">
            <CardHeader className="pb-2 border-b border-border/50 z-10 bg-card/50 backdrop-blur absolute w-full">
              <CardTitle>Mapa de Calor de Risco</CardTitle>
              <CardDescription>
                Eventos telemétricos L1 agregados mapeados geograficamente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <MapMock mode="heatmap" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
