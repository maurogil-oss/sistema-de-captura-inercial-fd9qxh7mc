import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, AlertTriangle, MapPin, Smartphone, CloudOff } from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'
import { useInertialSensors } from '@/hooks/useInertialSensors'
import { useCloudSync } from '@/hooks/useCloudSync'
import { TripHeader } from '@/components/TripHeader'
import { TripMetricsCard } from '@/components/TripMetricsCard'
import { BatteryEfficiencyCard } from '@/components/BatteryEfficiencyCard'
import { TripCriticalEvents } from '@/components/TripCriticalEvents'
import { TripExport } from '@/components/TripExport'
import { useToast } from '@/hooks/use-toast'
import { cn, generateSessionId } from '@/lib/utils'

export default function TripDetails() {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [sessionId, setSessionId] = useState<string>('')
  const [isAlerting, setIsAlerting] = useState(false)

  // Session ID Management
  useEffect(() => {
    if (!paramSessionId || paramSessionId === 'latest-session') {
      const newSession = generateSessionId()
      navigate(`/trip/${newSession}`, { replace: true })
    } else {
      setSessionId(paramSessionId)
    }
  }, [paramSessionId, navigate])

  const sensors = useInertialSensors()
  const {
    syncStatus,
    sendEvent,
    sendPresence,
    remoteData,
    remoteStats,
    remoteEventLog,
    isReceiving,
    mobileConnected,
    isOnline,
  } = useCloudSync(sessionId, sensors.isCapturing)

  const [lastSentEventId, setLastSentEventId] = useState<string | null>(null)

  const currentStats = {
    zenScore: sensors.zenScore,
    phi: sensors.phi,
    maxJerk: sensors.maxJerk,
    potholes: sensors.potholes,
    batteryLevel: sensors.batteryLevel,
  }

  const latestDataRef = useRef(sensors.data)
  const latestStatsRef = useRef(currentStats)
  const latestEventsRef = useRef(sensors.eventLog)

  useEffect(() => {
    latestDataRef.current = sensors.data
    latestStatsRef.current = currentStats
    latestEventsRef.current = sensors.eventLog
  }, [sensors.data, currentStats, sensors.eventLog])

  // Periodic Telemetry Update (Optimized for Battery vs Real-time smoothness, < 1s latency)
  useEffect(() => {
    if (!sensors.isCapturing) return
    const interval = setInterval(() => {
      sendEvent(
        latestDataRef.current.slice(-20),
        latestStatsRef.current,
        latestEventsRef.current,
        'TELEMETRY_UPDATE',
      )
    }, 800)
    return () => clearInterval(interval)
  }, [sensors.isCapturing, sendEvent])

  // Immediate Critical Event Dispatch
  useEffect(() => {
    if (
      sensors.isCapturing &&
      sensors.criticalEvent &&
      sensors.criticalEvent.id !== lastSentEventId
    ) {
      sendEvent(sensors.data.slice(-20), currentStats, sensors.eventLog, 'CRITICAL_EVENT')
      setLastSentEventId(sensors.criticalEvent.id)
    }
  }, [
    sensors.criticalEvent,
    sensors.isCapturing,
    sensors.data,
    currentStats,
    sensors.eventLog,
    sendEvent,
    lastSentEventId,
  ])

  const handleStopCapture = useCallback(() => {
    sensors.stopCapture()
    sendEvent(sensors.data, currentStats, sensors.eventLog, 'TRIP_SUMMARY')
  }, [sensors, sendEvent, currentStats])

  const isMonitorDevice = sensors.permissionState === 'unsupported'
  const isMonitoring = !sensors.isCapturing
  const isReceivingRemote = isMonitoring && isReceiving
  const hasData = sensors.isCapturing ? sensors.data.length > 0 : remoteData.length > 0

  const hasActivated =
    sensors.permissionState === 'granted' ||
    sensors.isCapturing ||
    remoteData.length > 0 ||
    isMonitorDevice

  const displayData = sensors.isCapturing ? sensors.data : remoteData
  const displayEvents = sensors.isCapturing ? sensors.eventLog : remoteEventLog
  const dStats = (isMonitorDevice || isReceivingRemote) && remoteStats ? remoteStats : currentStats

  const prevEventsLength = useRef(displayEvents.length)

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
    if (isMobile && sessionId) {
      sendPresence()
      const interval = setInterval(() => {
        if (!sensors.isCapturing) {
          sendPresence()
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [sessionId, sendPresence, sensors.isCapturing])

  // Mute audio/visual alerts for the sender (mobile) to focus on driving
  useEffect(() => {
    if (displayEvents.length > prevEventsLength.current) {
      const latest = displayEvents[displayEvents.length - 1]
      // Ensure mobile users never get an alert, only monitor devices
      if (!sensors.isCapturing && isMonitorDevice) {
        setIsAlerting(true)
        toast({
          title: 'Evento Crítico!',
          description: `${latest.type} detectado. Severidade: ${latest.severity}.`,
          variant: 'destructive',
        })
        setTimeout(() => setIsAlerting(false), 2000)
      }
    }
    prevEventsLength.current = displayEvents.length
  }, [displayEvents.length, toast, displayEvents, sensors.isCapturing, isMonitorDevice])

  useEffect(() => {
    if (hasData && dStats.zenScore < 70 && !sensors.isCapturing && isMonitorDevice) {
      toast({
        title: 'Atenção ao Zen Score',
        description: 'Pontuação de condução abaixo do limite seguro (70).',
        variant: 'destructive',
      })
    }
  }, [dStats.zenScore, hasData, toast, sensors.isCapturing, isMonitorDevice])

  if (!sessionId) return null

  let trafficState = 'yellow'
  if (syncStatus === 'Erro de Conexão' || !isOnline) {
    trafficState = 'red'
  } else if (
    syncStatus === 'Aguardando dispositivo móvel' ||
    syncStatus === 'Aguardando dados...' ||
    (!hasData && isMonitorDevice)
  ) {
    trafficState = 'yellow'
  } else {
    trafficState = 'green'
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in pb-12 md:pb-6 transition-colors duration-500',
        isAlerting && !sensors.isCapturing && 'bg-destructive/5 rounded-xl -m-4 p-4',
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/20 p-3 rounded-lg border border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 p-1.5 bg-background rounded-md border border-border/50 shadow-sm">
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                trafficState === 'red'
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-110'
                  : 'bg-muted opacity-50',
              )}
              title="Desconectado / Sem Dados"
            />
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                trafficState === 'yellow'
                  ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] scale-110'
                  : 'bg-muted opacity-50',
              )}
              title="Sessão Ativa / Aguardando Dados"
            />
            <div
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                trafficState === 'green'
                  ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] scale-110'
                  : 'bg-muted opacity-50',
              )}
              title="Sincronização em Tempo Real"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Status da Conexão
            </span>
            <span className="text-sm font-medium">{syncStatus}</span>
          </div>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded border border-border/50">
          Sessão: {sessionId}
        </div>
      </div>

      <TripHeader
        sessionId={sessionId}
        syncStatus={syncStatus}
        isOnline={isOnline}
        isCapturing={sensors.isCapturing}
        isMonitorDevice={isMonitorDevice}
        isReceiving={isReceivingRemote}
        permissionState={sensors.permissionState}
        isWaiting={sensors.isWaiting}
        startCapture={sensors.startCapture}
        stopCapture={handleStopCapture}
        sensorError={sensors.error}
      />

      {syncStatus === 'Erro de Conexão' && !sensors.isCapturing && isMonitorDevice && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2 bg-destructive/10 border-destructive/30"
        >
          <CloudOff className="h-4 w-4" />
          <AlertTitle>Conexão Perdida</AlertTitle>
          <AlertDescription>
            Não foi possível comunicar com a nuvem (Skip Cloud). Verifique sua conexão com a
            internet.
          </AlertDescription>
        </Alert>
      )}

      {isMonitorDevice &&
        !sensors.isCapturing &&
        !isOnline &&
        !hasData &&
        syncStatus !== 'Erro de Conexão' && (
          <Card className="border-primary/20 bg-primary/5 shadow-md animate-in fade-in zoom-in-95 duration-500">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8">
              <div className="shrink-0 p-4 bg-white rounded-2xl shadow-sm border border-border/50 hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `${window.location.origin}/trip/${sessionId}`,
                  )}`}
                  alt="QR Code da Sessão"
                  className="w-32 h-32 sm:w-44 sm:h-44"
                />
              </div>
              <div className="space-y-4 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  <Smartphone className="w-4 h-4" /> Aguardando Dispositivo Móvel
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Escaneie para Transmitir
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
                  Use a câmera do seu celular para ler o QR Code. Seu smartphone funcionará como um
                  sensor inercial e enviará a telemetria em tempo real para esta tela.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-xs font-mono text-muted-foreground">
                  <span className="uppercase font-semibold">Sessão ID:</span>
                  <span className="text-foreground bg-background/50 px-3 py-1.5 rounded-md border border-border/50">
                    {sessionId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {isMonitorDevice &&
        !sensors.isCapturing &&
        isOnline &&
        !hasData &&
        syncStatus !== 'Erro de Conexão' && (
          <Card className="border-amber-500/20 bg-amber-500/5 shadow-md animate-in fade-in zoom-in-95 duration-500">
            <CardContent className="p-6 flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Dispositivo Conectado!</h3>
                <p className="text-muted-foreground text-sm">
                  Aguardando o início da transmissão de dados no dispositivo móvel...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {sensors.isCapturing ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-emerald-500/10 to-background rounded-3xl border border-emerald-500/20 shadow-inner relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />

          <div className="relative z-10 space-y-8 w-full max-w-sm mx-auto flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center w-40 h-40 rounded-full bg-background shadow-2xl border border-border">
              <div className="absolute inset-0 rounded-full border-[6px] border-emerald-500/20" />
              <div
                className="absolute inset-0 rounded-full border-[6px] border-emerald-500 border-t-transparent animate-spin"
                style={{ animationDuration: '2.5s' }}
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="w-5 h-5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  L0 ATIVO
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Modo Foco do Motorista</h3>
              <p className="text-muted-foreground text-sm px-4">
                A captura está rodando em segundo plano. Mantenha os olhos na estrada e acompanhe os
                dados via computador.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col items-center transition-all duration-300 hover:scale-105">
                <span className="text-3xl font-mono font-bold text-foreground">
                  {currentStats.zenScore.toFixed(0)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Zen Score
                </span>
              </div>
              <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-border/50 shadow-sm flex flex-col items-center transition-all duration-300 hover:scale-105">
                <span className="text-3xl font-mono font-bold text-foreground">
                  {currentStats.potholes}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Anomalias
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-panel overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5 text-primary" /> Telemetria Inercial
                </CardTitle>
                <CardDescription>
                  {isReceivingRemote || remoteData.length > 0 || syncStatus === 'Conectado à Nuvem'
                    ? 'Dados sincronizados via Skip Cloud com latência sub-segundo.'
                    : 'Aguardando recepção do pacote inicial.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                {!hasActivated ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 shadow-inner">
                      <Smartphone className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Dispositivo Móvel Detectado</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Seu smartphone será usado como um sensor inercial para a sessão{' '}
                        <strong className="font-mono text-foreground">{sessionId}</strong>.
                      </p>
                    </div>
                    <button
                      onClick={sensors.startCapture}
                      disabled={sensors.isWaiting}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 rounded-full text-lg w-full max-w-xs animate-pulse"
                    >
                      <Activity className="w-5 h-5" />
                      {sensors.isWaiting ? 'Iniciando...' : 'Iniciar Transmissão Live'}
                    </button>
                    {sensors.error && (
                      <p className="text-sm text-destructive max-w-xs">{sensors.error}</p>
                    )}
                  </div>
                ) : (
                  <TripCharts
                    data={displayData}
                    animate={!isReceivingRemote}
                    waitingForData={hasActivated && !hasData}
                  />
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <TripCriticalEvents events={displayEvents} />
              <div className="space-y-6 flex flex-col">
                <BatteryEfficiencyCard batteryLevel={dStats.batteryLevel} />
                <TripExport sessionId={sessionId} stats={dStats} events={displayEvents} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="glass-panel flex flex-col h-[300px] sm:h-[400px]">
              <CardHeader className="pb-2 absolute z-10 bg-background/60 backdrop-blur-md w-full border-b border-border/50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Replay Dinâmico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative bg-muted/10">
                <MapMock mode="default" events={displayEvents} />
              </CardContent>
            </Card>
            <TripMetricsCard
              hasActivated={hasActivated}
              isCapturing={sensors.isCapturing}
              isReceiving={isReceivingRemote}
              hasData={hasData}
              maxJerk={dStats.maxJerk}
              potholes={dStats.potholes}
              phi={dStats.phi}
              zenScore={dStats.zenScore}
            />
          </div>
        </div>
      )}
    </div>
  )
}
