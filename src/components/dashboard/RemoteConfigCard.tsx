import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfigStore } from '@/stores/useConfigStore'
import { Settings } from 'lucide-react'

export function RemoteConfigCard() {
  const { config, setConfig, setProfile } = useConfigStore()

  return (
    <Card className="glass-panel w-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Configuração Remota (SDK)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Perfil de Via</Label>
          <Select value={config.profile} onValueChange={(v: any) => setProfile(v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Selecione um perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Paved Vias</SelectItem>
              <SelectItem value="critical">Critical Vias</SelectItem>
              <SelectItem value="custom">Customizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Threshold G-Force</Label>
            <span className="text-xs font-mono font-medium">
              {config.gForceThreshold.toFixed(1)}G
            </span>
          </div>
          <Slider
            value={[config.gForceThreshold]}
            min={0.1}
            max={5.0}
            step={0.1}
            onValueChange={([v]) => setConfig({ gForceThreshold: v })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs text-muted-foreground">Frequência de Amostragem</Label>
            <span className="text-xs font-mono font-medium">{config.samplingFreq}Hz</span>
          </div>
          <Slider
            value={[config.samplingFreq]}
            min={10}
            max={100}
            step={10}
            onValueChange={([v]) => setConfig({ samplingFreq: v })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
