import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, TrendingUp, HeartHandshake, Map, BarChart3 } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function B2GGovernanceDashboard() {
  const chartData = [
    { zone: 'Centro', sroi: 4.2, impact: 125000 },
    { zone: 'Zona Sul', sroi: 3.8, impact: 98000 },
    { zone: 'Zona Leste', sroi: 5.1, impact: 142000 },
    { zone: 'Zona Norte', sroi: 3.5, impact: 85000 },
    { zone: 'Zona Oeste', sroi: 4.0, impact: 110000 },
  ]

  return (
    <Card className="glass-panel border-indigo-500/20 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="w-6 h-6 text-indigo-500" />
          Governança Municipal (B2G)
        </CardTitle>
        <CardDescription>
          Visão macroestratégica de impacto socioeconômico e zeladoria inteligente para gestores
          públicos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 text-indigo-500 mb-3">
              <HeartHandshake className="w-5 h-5" />
              <span className="font-semibold">Retorno Social (SROI)</span>
            </div>
            <div className="text-4xl font-bold mb-1">4.12x</div>
            <p className="text-sm text-muted-foreground">
              Cada R$1 investido gera R$4,12 em benefícios sociais.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-500 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Impacto Econômico Total</span>
            </div>
            <div className="text-4xl font-bold mb-1">R$ 4.2M</div>
            <p className="text-sm text-muted-foreground">
              Economia gerada com prevenção de acidentes e reparos otimizados.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-500 mb-3">
              <Map className="w-5 h-5" />
              <span className="font-semibold">Zeladoria Urbana Integrada</span>
            </div>
            <div className="text-4xl font-bold mb-1">84%</div>
            <p className="text-sm text-muted-foreground">
              Taxa de resolução proativa de problemas viários na malha mapeada.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Distribuição de Impacto por Região
          </h4>
          <div className="h-[250px] w-full">
            <ChartContainer
              config={{
                impact: {
                  label: 'Impacto Econômico (R$)',
                  color: '#6366f1',
                },
                sroi: {
                  label: 'SROI',
                  color: '#10b981',
                },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="zone" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    yAxisId="left"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}x`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId="left"
                    dataKey="impact"
                    name="Impacto Econômico"
                    fill="var(--color-impact)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="sroi"
                    name="SROI"
                    fill="var(--color-sroi)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
