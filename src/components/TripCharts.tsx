import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface TripChartsProps {
  data: any[]
}

export function TripCharts({ data }: TripChartsProps) {
  const chartConfig = {
    jerk: { label: 'Jerk (da/dt)', color: 'hsl(var(--primary))' },
    gForceZ: { label: 'G-Force (Z)', color: 'hsl(var(--destructive))' },
    lateralForce: { label: 'Lateral G', color: 'hsl(var(--chart-3))' },
  }

  return (
    <div className="space-y-6">
      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Jerk (Acceleration Change)
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            syncId="tripTimeline"
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="time" hide />
            <YAxis tickLine={false} axisLine={false} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ReferenceLine
              y={10}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="jerk"
              stroke="var(--color-jerk)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Vertical G-Force (Z-Axis / Potholes)
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            syncId="tripTimeline"
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="time" hide />
            <YAxis tickLine={false} axisLine={false} domain={[-1, 3]} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ReferenceLine
              y={1.5}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <Line
              type="step"
              dataKey="gForceZ"
              stroke="var(--color-gForceZ)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
          Centrifugal Force (Lateral)
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            syncId="tripTimeline"
            margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} className="text-[10px]" />
            <YAxis tickLine={false} axisLine={false} domain={[-1.5, 1.5]} className="text-[10px]" />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" opacity={0.5} />
            <Line
              type="monotone"
              dataKey="lateralForce"
              stroke="var(--color-lateralForce)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  )
}
