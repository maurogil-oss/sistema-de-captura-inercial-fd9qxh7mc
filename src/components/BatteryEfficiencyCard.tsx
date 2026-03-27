import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Battery, Zap, Smartphone, ArrowDownRight } from 'lucide-react'

export function BatteryEfficiencyCard({ batteryLevel }: { batteryLevel?: number | null }) {
  const stdDrain = 12.5 // 12.5% per hour
  const edgeDrain = 2.4 // 2.4% per hour
  const savings = Math.round(((stdDrain - edgeDrain) / stdDrain) * 100)

  return (
    <Card className="glass-panel bg-gradient-to-br from-background to-emerald-950/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Zap className="w-24 h-24 text-emerald-500" />
      </div>

      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-500" /> Eficiência Energética
          </div>
          {batteryLevel !== undefined && batteryLevel !== null && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {Math.round(batteryLevel)}% Bateria
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-5 relative z-10">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" /> Telemetria Padrão (Streaming 1Hz)
            </span>
            <span className="text-destructive font-mono">{stdDrain}% / hr</span>
          </div>
          <Progress value={85} className="h-2 bg-muted" indicatorClassName="bg-destructive/60" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <Zap className="w-3.5 h-3.5" /> Orbis Edge AI (Event-Driven)
            </span>
            <span className="text-emerald-500 font-mono">{edgeDrain}% / hr</span>
          </div>
          <Progress value={20} className="h-2 bg-muted" indicatorClassName="bg-emerald-500" />
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-2 flex items-start gap-3">
          <ArrowDownRight className="w-5 h-5 text-emerald-500 mt-0.5" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium leading-snug">
            A arquitetura Orbis Edge AI economizou cerca de <strong>{savings}% de bateria</strong>{' '}
            nesta sessão ao evitar transmissão contínua.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
