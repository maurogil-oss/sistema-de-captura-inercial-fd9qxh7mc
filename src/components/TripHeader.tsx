import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Cloud,
  CloudOff,
  CloudLightning,
  Activity,
  Shield,
  Square,
  Play,
  Key,
  Link as LinkIcon,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface TripHeaderProps {
  sessionId: string
  syncStatus: string
  isCapturing: boolean
  isMonitoring: boolean
  permissionState: string
  isWaiting: boolean
  startCapture: () => void
  stopCapture: () => void
}

export function TripHeader(props: TripHeaderProps) {
  const { toast } = useToast()

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: 'Link copiado!',
      description: 'Abra este link no seu celular para iniciar a transmissão remota da sessão.',
    })
  }

  const getSyncBadge = () => {
    if (props.syncStatus === 'Syncing')
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 gap-1">
          <CloudLightning className="w-3 h-3 animate-pulse" /> Sincronizando Nuvem
        </Badge>
      )
    if (props.syncStatus === 'Connected')
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
          <Cloud className="w-3 h-3" /> Nuvem Conectada
        </Badge>
      )
    if (props.syncStatus === 'Local-Only')
      return (
        <Badge variant="destructive" className="gap-1">
          <CloudOff className="w-3 h-3" /> Apenas Local
        </Badge>
      )
    return (
      <Badge variant="outline" className="gap-1">
        <CloudOff className="w-3 h-3" /> Offline
      </Badge>
    )
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
      <div className="w-full md:w-auto">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-mono truncate">
            {props.sessionId}
          </h1>
          {getSyncBadge()}
          <Badge
            variant="outline"
            className={cn(
              'border whitespace-nowrap',
              props.isCapturing
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : props.isMonitoring
                  ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                  : props.permissionState === 'idle' ||
                      props.permissionState === 'unsupported' ||
                      props.permissionState === 'denied'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-primary/10 text-primary border-primary/20',
            )}
          >
            {props.isCapturing
              ? 'GRAVANDO AO VIVO'
              : props.isMonitoring
                ? 'MONITORANDO SESSÃO'
                : props.permissionState === 'idle' ||
                    props.permissionState === 'unsupported' ||
                    props.permissionState === 'denied'
                  ? 'AGUARDANDO ATIVAÇÃO'
                  : 'SESSÃO PRONTA'}
          </Badge>
        </div>
        <p className="text-muted-foreground flex items-center gap-3 text-sm flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Rota Dinâmica
          </span>
          {props.isCapturing && (
            <span className="flex items-center gap-1 text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">
              <Activity className="w-4 h-4" /> Processando Buffer L0
            </span>
          )}
          {props.isMonitoring && (
            <span className="flex items-center gap-1 text-purple-500 font-medium bg-purple-500/10 px-2 py-0.5 rounded animate-pulse">
              <Activity className="w-4 h-4" /> Recebendo Dados da Nuvem
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-col md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 justify-between md:justify-end w-full md:w-auto">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Sessão Cloud-Sync
            </p>
            <p className="text-sm font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-primary" /> Autenticada
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyLink}
            className="ml-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Copiar Link da Sessão"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        {props.isCapturing ? (
          <Button
            size="lg"
            variant="destructive"
            onClick={props.stopCapture}
            className="gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg"
          >
            <Square className="w-5 h-5" fill="currentColor" /> Parar Captura
          </Button>
        ) : props.isMonitoring ? (
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold pointer-events-none opacity-80 border-purple-500/30 text-purple-500"
          >
            <Activity className="w-5 h-5 animate-spin" /> Escutando Nuvem...
          </Button>
        ) : props.isWaiting ? (
          <Button
            size="lg"
            disabled
            className="gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg bg-primary/80 text-primary-foreground"
          >
            <Activity className="w-5 h-5 animate-spin" /> Aguardando Sensores...
          </Button>
        ) : props.permissionState === 'granted' ? (
          <Button
            size="lg"
            onClick={props.startCapture}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg shadow-emerald-900/20"
          >
            <Play className="w-5 h-5" fill="currentColor" /> Iniciar Captura
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={props.startCapture}
            disabled={props.permissionState === 'unsupported'}
            className={cn(
              'gap-2 w-full md:w-auto py-6 md:py-4 text-base font-semibold shadow-lg text-white',
              props.permissionState === 'unsupported' ? '' : 'bg-amber-600 hover:bg-amber-700',
            )}
          >
            <Key className="w-5 h-5" fill="currentColor" /> Ativar Sensores
          </Button>
        )}
      </div>
    </div>
  )
}
