import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, ArrowRight, CheckCircle2, Hammer } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const activities = [
  {
    id: 1,
    task: 'Pothole Repair - Zone A',
    credit: '+0.5 tCO2e',
    time: '10 min ago',
    status: 'secured',
    txHash: '0x8f...3a1',
  },
  {
    id: 2,
    task: 'Traffic Flow Optimization',
    credit: '+1.2 tCO2e',
    time: 'Just now',
    status: 'minting',
    txHash: null,
  },
  {
    id: 3,
    task: 'Cycle Lane Expansion',
    credit: '+0.8 tCO2e',
    time: '3 hours ago',
    status: 'liquidated',
    txHash: '0x2b...9c4',
  },
  {
    id: 4,
    task: 'Street Light Upgrade',
    credit: '+0.3 tCO2e',
    time: '5 hours ago',
    status: 'secured',
    txHash: '0x1e...7d2',
  },
  {
    id: 5,
    task: 'Pothole Repair - Zone C',
    credit: '+0.4 tCO2e',
    time: '7 hours ago',
    status: 'secured',
    txHash: '0x9a...5f8',
  },
]

export function RWAActivityBridge() {
  return (
    <Card className="glass-panel border-orange-500/20 w-full">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          Activity-to-Asset Bridge
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[265px] p-4">
          <div className="space-y-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 gap-3 sm:gap-0"
              >
                <div className="flex items-center gap-3 w-full sm:w-[40%]">
                  <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                    <Hammer className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{act.task}</div>
                    <div className="text-xs text-muted-foreground">Maintenance Task</div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center justify-center w-full sm:w-[20%] text-muted-foreground gap-2 sm:gap-0">
                  <span className="text-[10px] sm:mb-1">{act.time}</span>
                  <div className="hidden sm:flex w-full items-center gap-2 px-2">
                    <div className="h-[1px] bg-border flex-1" />
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <div className="h-[1px] bg-border flex-1" />
                  </div>
                  <ArrowRight className="w-3 h-3 sm:hidden" />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-[40%] justify-start sm:justify-end">
                  <div className="text-left sm:text-right min-w-0">
                    <div
                      className={`text-sm font-bold truncate ${act.status === 'liquidated' ? 'text-indigo-500' : 'text-emerald-500'}`}
                    >
                      {act.status === 'liquidated' ? `Liquidated (${act.credit})` : act.credit}
                    </div>
                    {act.status === 'minting' ? (
                      <div className="text-xs text-orange-500 animate-pulse">
                        Minting in Progress...
                      </div>
                    ) : act.status === 'liquidated' ? (
                      <div className="text-[10px] text-indigo-500 font-mono bg-indigo-500/10 px-1 py-0.5 rounded border border-indigo-500/20 mt-1">
                        Settled: {act.txHash}
                      </div>
                    ) : (
                      <div className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 py-0.5 rounded border border-border/50 mt-1">
                        Tx: {act.txHash}
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-full shrink-0 order-first sm:order-last ${
                      act.status === 'minting'
                        ? 'bg-orange-500/10'
                        : act.status === 'liquidated'
                          ? 'bg-indigo-500/10'
                          : 'bg-emerald-500/10'
                    }`}
                  >
                    {act.status === 'minting' ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : act.status === 'liquidated' ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
