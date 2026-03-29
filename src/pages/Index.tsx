import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Car, Wifi, ShieldCheck, Play } from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DevicePairingCard } from '@/components/DevicePairingCard'
import { HealthCheckWidget } from '@/components/HealthCheckWidget'
import { pb } from '@/lib/skip-cloud'

export default function Index() {
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [activeSessions, setActiveSessions] = useState<string[]>([])
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchActive = async () => {
      try {
        const result = await pb.collection('telemetry').getList(1, 100, { sort: '-created' })
        if (!isMounted) return

        // Extract unique recent session/device IDs
        const recent = new Set<string>()
        const now = Date.now()
        let latestSync: number | null = null
        result.items.forEach((item: any) => {
          if (item.sessionId) {
            const itemTime = new Date(item.created).getTime()
            if (!latestSync || itemTime > latestSync) {
              latestSync = itemTime
            }
            // consider active if within last 5 minutes
            if (now - itemTime < 5 * 60 * 1000) {
              recent.add(item.sessionId)
            }
          }
        })
        setActiveSessions(Array.from(recent))
        if (latestSync) setLastGlobalSync(new Date(latestSync))
        setLoading(false)
      } catch (e) {
        if (isMounted) setLoading(false)
      }
    }
    fetchActive()
  }, [])

  return (
    <div className="space-y-6">
      <HealthCheckWidget />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral Consolidada</h1>
          <p className="text-muted-foreground">
            Monitoramento global Edge-to-Cloud de dispositivos ativos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Link to={`/trip/${currentSessionId || 'latest-session'}`}>
              <Play className="w-4 h-4" />
              Monitorar Novo Dispositivo
            </Link>
          </Button>
        </div>
      </div>

      <DevicePairingCard onSessionIdGenerated={setCurrentSessionId} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Dispositivos Transmitindo"
          value={loading ? '--' : activeSessions.length.toString()}
          icon={Wifi}
          description="Edge nodes conectados"
          className="border-emerald-500/30 bg-emerald-500/5"
        />
        <StatCard
          title="Último Batch Recebido"
          value={lastGlobalSync ? lastGlobalSync.toLocaleTimeString() : '--'}
          icon={Activity}
          description={loading ? 'Buscando...' : 'Sincronização global'}
        />
        <StatCard
          title="Latência Estimada"
          value="< 150ms"
          icon={ShieldCheck}
          trend="down"
          trendValue="Estável"
        />
        <StatCard
          title="Cobertura Espacial"
          value="Global"
          icon={Car}
          description="Agnóstico a rede"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 glass-panel flex flex-col">
          <CardHeader>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>Visualização individual detalhada</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[300px]">
            {loading ? (
              <p className="text-sm text-muted-foreground">Buscando na nuvem...</p>
            ) : activeSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <Wifi className="w-8 h-8 mb-2" />
                <p className="text-sm">Nenhum dispositivo ativo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((id) => (
                  <div
                    key={id}
                    className="flex justify-between items-center p-3 rounded bg-muted/30 border border-border/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-bold text-primary">{id}</p>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Batch Sync Ativo
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/trip/${id}`}>Ver Live</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 glass-panel overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between z-10 pb-2 bg-background/50 backdrop-blur-sm absolute w-full border-b border-border/50">
            <CardTitle>Mapa Global de Telemetria</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                Recebendo Batches
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-[300px] mt-14 bg-muted/10">
            <MapMock mode="heatmap" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
