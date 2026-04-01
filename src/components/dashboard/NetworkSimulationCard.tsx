import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Wifi, WifiOff, Database, Info, Activity } from 'lucide-react'
import { useSimulation } from '@/stores/SimulationContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function NetworkSimulationCard() {
  const { isSimulatedOffline, toggleSimulatedOffline } = useSimulation()
  const [queue, setQueue] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(100)

  // Keep track of the maximum queue size when going back online to show meaningful progress
  const [maxQueue, setMaxQueue] = useState(1)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSimulatedOffline) {
      setSyncing(false)
      interval = setInterval(() => {
        setQueue((prev) => {
          const newQueue = prev + Math.floor(Math.random() * 8) + 2
          setMaxQueue(newQueue)
          return newQueue
        })
      }, 1000)
    } else {
      if (queue > 0) {
        setSyncing(true)
        interval = setInterval(() => {
          setQueue((prev) => {
            const next = prev - 25
            if (next <= 0) {
              setSyncing(false)
              setSyncProgress(100)
              return 0
            }
            setSyncProgress(100 - (next / maxQueue) * 100)
            return next
          })
        }, 500)
      } else {
        setSyncing(false)
        setSyncProgress(100)
      }
    }
    return () => clearInterval(interval)
  }, [isSimulatedOffline, queue, maxQueue])

  return (
    <Card className="glass-panel w-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSimulatedOffline ? (
              <WifiOff className="w-4 h-4 text-destructive" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-500" />
            )}
            <span>Connectivity Sandbox</span>
            {syncing && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider animate-pulse ml-1">
                <Activity className="w-3 h-3" /> Live Sync
              </span>
            )}
            {!syncing && !isSimulatedOffline && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider ml-1">
                <span className="relative flex h-1.5 w-1.5 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Live
              </span>
            )}
          </div>
          <Switch checked={isSimulatedOffline} onCheckedChange={toggleSimulatedOffline} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        <div className="flex justify-between items-center text-sm">
          <Label className="text-muted-foreground text-xs">Estado da Rede</Label>
          <span
            className={
              isSimulatedOffline
                ? 'text-destructive font-medium text-xs'
                : 'text-emerald-500 font-medium text-xs'
            }
          >
            {isSimulatedOffline ? 'Simulated Offline' : 'Online'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Pending Sync Queue</span>
              <Tooltip>
                <TooltipTrigger type="button" className="cursor-help">
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  <p>
                    Fila local de eventos aguardando reconexão. Evita perda de dados durante buracos
                    de cobertura na rede 3G/4G.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded border border-border/50">
              {queue} pts
            </span>
          </div>

          <div className="space-y-1.5 h-8">
            {syncing && (
              <div className="animate-in fade-in space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Synchronization Progress</span>
                  <span className="animate-pulse text-blue-500">Syncing...</span>
                </div>
                <Progress
                  value={syncProgress}
                  className="h-1.5"
                  indicatorClassName="bg-blue-500 transition-all duration-500"
                />
              </div>
            )}
            {!syncing && queue === 0 && !isSimulatedOffline && (
              <div className="flex justify-between text-[10px] text-muted-foreground h-full items-end">
                <span>All telemetry synced.</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Ative o modo offline para estressar a rede. Eventos inerciais serão enfileirados
          localmente e sincronizados sem perda de dados ao reconectar.
        </p>
      </CardContent>
    </Card>
  )
}
