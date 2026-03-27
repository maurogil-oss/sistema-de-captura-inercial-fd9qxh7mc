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
  const { syncStatus, sendEvent, remoteData, remoteStats, remoteEventLog, isReceiving } =
    useCloudSync(sessionId, sensors.isCapturing)

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

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in pb-12 md:pb-6 transition-colors duration-500',
        isAlerting && !sensors.isCapturing && 'bg-destructive/5 rounded-xl -m-4 p-4',
      )}
    >
      <TripHeader
        sessionId={sessionId}
        syncStatus={syncStatus}
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
        remoteData.length === 0 &&
        syncStatus !== 'Erro de Conexão' && (
          <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-600 animate-in fade-in">
            <Activity className="h-4 w-4" />
            <AlertTitle>Modo Monitor</AlertTitle>
            <AlertDescription>
              Aguardando telemetria na sessão <strong>{sessionId}</strong>. Use um dispositivo móvel
              para transmitir.
            </AlertDescription>
          </Alert>
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
                  <div className="space-y-6 pt-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[200px] flex flex-col space-y-3">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="flex-1 w-full rounded-xl" />
                      </div>
                    ))}
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
