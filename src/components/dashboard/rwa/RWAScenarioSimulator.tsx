import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, CartesianGrid, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Calculator } from 'lucide-react'

const BASE_CO2 = 12450.5
const BASE_BRL = 1840000

export function RWAScenarioSimulator() {
  const [increase, setIncrease] = useState([15])

  const multiplier = 1 + increase[0] / 100

  const projCO2 = BASE_CO2 * multiplier
  const projBRL = BASE_BRL * multiplier

  const chartData = [
    {
      name: 'Current State',
      co2: BASE_CO2,
      revenue: BASE_BRL / 1000,
    },
    {
      name: 'Simulated Projection',
      co2: projCO2,
      revenue: projBRL / 1000,
    },
  ]

  const chartConfig = {
    co2: { label: 'Carbon Credits (tCO2e)', color: 'hsl(var(--chart-1))' },
    revenue: { label: 'Revenue (k BRL)', color: 'hsl(var(--chart-2))' },
  }

  return (
    <Card className="glass-panel border-emerald-500/20 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            Scenario Simulator (Stress Test)
          </div>
        </CardTitle>
        <CardDescription>
          Project carbon credit generation based on maintenance volume variations.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-6 flex-1 flex flex-col">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Janitorial Volume Increase</Label>
            <span className="text-sm font-mono font-bold text-emerald-500">+{increase[0]}%</span>
          </div>
          <Slider
            defaultValue={[15]}
            max={100}
            step={1}
            value={increase}
            onValueChange={setIncrease}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Estimated Credits</div>
            <div className="text-lg font-bold text-emerald-500 flex items-center gap-1">
              {projCO2.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
              <span className="text-xs font-normal">tCO2e</span>
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Projected Revenue</div>
            <div className="text-lg font-bold text-blue-500 flex items-center gap-1">
              R$ {(projBRL / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[150px] w-full mt-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="co2"
                  fill="var(--color-co2)"
                  radius={[4, 4, 0, 0]}
                  name="Carbon Credits (tCO2e)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue (k BRL)"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
