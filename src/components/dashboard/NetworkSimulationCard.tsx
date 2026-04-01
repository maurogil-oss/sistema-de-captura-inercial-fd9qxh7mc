import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Wifi, WifiOff, Database } from 'lucide-react'
import { useSimulation } from '@/stores/SimulationContext'

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
          <span className="flex items-center gap-2">
            {isSimulatedOffline ? (
              <WifiOff className="w-4 h-4 text-destructive" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-500" />
            )}
            Connectivity Sandbox
          </span>
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
            <span className="text-xs font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500" /> Pending Sync Queue
            </span>
            <span className="font-mono text-sm">{queue} pts</span>
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
