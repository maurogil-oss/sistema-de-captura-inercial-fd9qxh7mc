import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings2, WifiOff, HardDrive, RefreshCw, Battery, Zap, Activity } from 'lucide-react'
import { useSimulation } from '@/stores/SimulationContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Settings() {
  const { isSimulatedOffline, toggleSimulatedOffline } = useSimulation()
  const [queueSize, setQueueSize] = useState(0)

  // Remote Config States
  const [threshold, setThreshold] = useState([2.0])
  const [samplingRate, setSamplingRate] = useState([60])
  const [profile, setProfile] = useState('standard')
  const [lastSynced, setLastSynced] = useState<string>('Atualizado há 2 min')
  const [isSaving, setIsSaving] = useState(false)

  // Poll Local Storage for Queue Size
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const stored = localStorage.getItem('telemetry_offline_queue')
        if (stored) {
          const parsed = JSON.parse(stored)
          setQueueSize(Array.isArray(parsed) ? parsed.length : 0)
        } else {
          setQueueSize(0)
        }
      } catch (e) {
        setQueueSize(0)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSaveConfig = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setLastSynced('Sincronizado agora')
      toast.success('Configurações propagadas', {
        description: 'Os parâmetros foram atualizados remotamente na frota ativa.',
      })
    }, 1200)
  }

  const handleProfileChange = (val: string) => {
    setProfile(val)
    if (val === 'critical') {
      setThreshold([1.2])
      setSamplingRate([100])
    } else if (val === 'high-speed') {
      setThreshold([3.0])
      setSamplingRate([30])
    } else {
      setThreshold([2.0])
      setSamplingRate([60])
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel de Calibração</h1>
        <p className="text-muted-foreground">
          Configuração Remota do SDK e Simulador de Estresse de Conectividade.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12 items-start">
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <Card className="glass-panel border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    Remote Configuration
                  </CardTitle>
                  <CardDescription>
                    Ajuste dinamicamente a sensibilidade de coleta de toda a frota sem necessidade
                    de update.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {lastSynced}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Perfil de Rodovia / Condição</Label>
                <Select value={profile} onValueChange={handleProfileChange}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão Urbano</SelectItem>
                    <SelectItem value="critical">Área Crítica (Alta Sensibilidade)</SelectItem>
                    <SelectItem value="high-speed">
                      Rodovia Expresso (Baixa Sensibilidade)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="flex flex-col">
                      <span>G-Force Impact Threshold</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Nível de força para ativar o evento de buraco/impacto
                      </span>
                    </Label>
                    <span className="font-mono text-sm">{threshold[0].toFixed(1)}G</span>
                  </div>
                  <Slider
                    value={threshold}
                    onValueChange={setThreshold}
                    max={5.0}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="flex flex-col">
                      <span>Sampling Frequency (FFT)</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        Frequência de amostragem inercial na borda
                      </span>
                    </Label>
                    <span className="font-mono text-sm">{samplingRate} Hz</span>
                  </div>
                  <Slider
                    value={samplingRate}
                    onValueChange={setSamplingRate}
                    max={120}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border/50 py-4 flex justify-end">
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Propagando...' : 'Aplicar na Frota (OTA)'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card
            className={cn(
              'glass-panel transition-colors duration-500',
              isSimulatedOffline ? 'border-destructive/50 bg-destructive/5' : 'border-border/50',
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <WifiOff
                  className={cn(
                    'w-4 h-4',
                    isSimulatedOffline ? 'text-destructive' : 'text-muted-foreground',
                  )}
                />
                Network Stress Simulator
              </CardTitle>
              <CardDescription className="text-xs">
                Teste o comportamento do buffer local simulando áreas de sombra de conectividade
                (Zero-Signal).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                <Label htmlFor="stress-test" className="cursor-pointer font-medium">
                  Forçar Offline
                </Label>
                <Switch
                  id="stress-test"
                  checked={isSimulatedOffline}
                  onCheckedChange={toggleSimulatedOffline}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center justify-between">
                  Local Queue Counter
                  {isSimulatedOffline && (
                    <span className="text-[10px] text-destructive animate-pulse flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Acumulando
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border/50 rounded-lg">
                  <div
                    className={cn(
                      'p-2 rounded-md',
                      queueSize > 0
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/20 text-emerald-500',
                    )}
                  >
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-2xl font-bold tracking-tight">{queueSize}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Eventos pendentes de sincronização
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded border border-border/50">
                <p>
                  Ao desligar a simulação, o SDK irá fatiar a fila e transmitir os dados garantindo
                  tolerância a falhas sem perda.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-500" />
                  Battery Usage
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]"
                >
                  Optimized
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-bold font-mono">2.4%</span>
                  <span className="text-sm text-muted-foreground"> / hora</span>
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  <p>Média da frota em tela apagada</p>
                  <p className="text-emerald-500 font-medium">Alvo &lt; 4.0% mantido</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
