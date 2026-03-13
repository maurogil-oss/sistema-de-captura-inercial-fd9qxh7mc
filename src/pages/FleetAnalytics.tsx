import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FleetRankingTable } from '@/components/FleetRankingTable'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { mockESGData } from '@/data/mockData'
import { Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FleetAnalytics() {
  const chartConfig = {
    co2: { label: 'CO2 Emissions (t)', color: 'hsl(var(--primary))' },
    idling: { label: 'Idling Time (h)', color: 'hsl(var(--destructive))' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Analytics</h1>
          <p className="text-muted-foreground">B2B Dashboard: Efficiency, ESG & Maintenance.</p>
        </div>
      </div>

      <Tabs defaultValue="ranking" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ranking">Efficiency Ranking</TabsTrigger>
          <TabsTrigger value="esg">ESG & Fuel</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-6 mt-6">
          <FleetRankingTable />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Predictive Maintenance</CardTitle>
                  <CardDescription>Flagged by vertical impact analysis (L0)</CardDescription>
                </div>
                <Wrench className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  {[
                    { v: 'V-042', reason: 'High Suspension Stress', count: 14 },
                    { v: 'V-118', reason: 'Brake Pad Wear Anomaly', count: 8 },
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
                        Inspect ({item.count})
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
              <CardTitle>ESG Scope 1 & Idling Correlation</CardTitle>
              <CardDescription>
                Tracking emission reductions against idle engine times.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer config={chartConfig}>
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
      </Tabs>
    </div>
  )
}
