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
import { Settings, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
          <div className="flex items-center gap-1.5 mb-2">
            <Label className="text-xs text-muted-foreground">Perfil de Via</Label>
            <Tooltip>
              <TooltipTrigger type="button" className="cursor-help">
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] text-xs">
                Ajuste os parâmetros padrão para diferentes tipos de pavimento ou ative o modo
                Customizado.
              </TooltipContent>
            </Tooltip>
          </div>
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
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">Threshold G-Force</Label>
              <Tooltip>
                <TooltipTrigger type="button" className="cursor-help">
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  Força mínima para detectar irregularidades. Valores baixos aumentam a
                  sensibilidade para micro-impactos.
                </TooltipContent>
              </Tooltip>
            </div>
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
            <div className="flex items-center gap-1.5">
              <Label className="text-xs text-muted-foreground">Frequência de Amostragem</Label>
              <Tooltip>
                <TooltipTrigger type="button" className="cursor-help">
                  <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  Taxa de leitura do sensor por segundo (Hz). Maior frequência melhora a precisão,
                  mas consome mais bateria.
                </TooltipContent>
              </Tooltip>
            </div>
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
