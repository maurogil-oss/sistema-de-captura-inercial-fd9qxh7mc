import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Droplets } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Infrastructure', value: 50, fill: 'var(--color-infrastructure)' },
  { name: 'Social', value: 20, fill: 'var(--color-social)' },
  { name: 'Environmental', value: 20, fill: 'var(--color-environmental)' },
  { name: 'Governance', value: 10, fill: 'var(--color-governance)' },
]

const chartConfig = {
  infrastructure: { label: 'Infrastructure', color: 'hsl(var(--chart-1))' },
  social: { label: 'Social', color: 'hsl(var(--chart-2))' },
  environmental: { label: 'Environmental', color: 'hsl(var(--chart-3))' },
  governance: { label: 'Governance', color: 'hsl(var(--chart-4))' },
}

export function RWALiquidityCard() {
  return (
    <Card className="glass-panel border-purple-500/20">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Droplets className="w-4 h-4 text-purple-500" />
          L5 Protocol Liquidity Split
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend
                  content={<ChartLegendContent />}
                  className="flex-wrap gap-2 text-[10px] mt-2"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
