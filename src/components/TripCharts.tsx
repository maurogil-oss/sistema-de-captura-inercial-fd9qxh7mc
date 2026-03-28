import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Activity } from 'lucide-react'
import { TelemetryPayload } from '@/hooks/useCloudSync'

interface TripChartsProps {
  data: TelemetryPayload[]
  waitingForData?: boolean
}

export function TripCharts({ data, waitingForData = false }: TripChartsProps) {
  const chartConfig = {
    dominantFrequency: { label: 'Freq. Dominante (Hz)', color: 'hsl(var(--primary))' },
    fftEnergy: { label: 'Energia do Sinal', color: 'hsl(var(--destructive))' },
    signalVariance: { label: 'Variância do Sinal', color: 'hsl(var(--chart-3))' },
  }

  if (waitingForData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50 p-6 text-center">
        <Activity className="w-12 h-12 text-primary/60 animate-pulse mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Aguardando Buffer (FFT)</h3>
        <p className="text-sm">
          O processamento no Edge enviará pacotes de dados após extrair as features do sinal.
        </p>
      </div>
    )
  }

  const plotData = data.map((d, i) => ({
    index: i,
    time: new Date(d.timestamp).toLocaleTimeString(),
    dominantFrequency: d.features?.dominantFrequency || 0,
    fftEnergy: d.features?.fftEnergy || 0,
    signalVariance: d.features?.signalVariance || 0,
  }))

  return (
    <div className="space-y-8">
      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex justify-between">
          Frequência Dominante <span>(Hz)</span>
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer>
            <LineChart data={plotData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="time" hide />
              <YAxis tickLine={false} axisLine={false} className="text-[10px]" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="step"
                dataKey="dominantFrequency"
                stroke="var(--color-dominantFrequency)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex justify-between">
          Energia Espectral Total (FFT) <span>(Magn)</span>
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer>
            <AreaChart data={plotData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-fftEnergy)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-fftEnergy)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="time" hide />
              <YAxis tickLine={false} axisLine={false} className="text-[10px]" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="fftEnergy"
                stroke="var(--color-fftEnergy)"
                fillOpacity={1}
                fill="url(#colorEnergy)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="h-[200px]">
        <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex justify-between">
          Variância do Sinal <span>(σ²)</span>
        </h3>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer>
            <LineChart data={plotData} margin={{ top: 5, right: 5, left: -20, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} className="text-[10px]" />
              <YAxis tickLine={false} axisLine={false} className="text-[10px]" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="signalVariance"
                stroke="var(--color-signalVariance)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
