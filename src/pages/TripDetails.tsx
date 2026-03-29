import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Activity,
  MapPin,
  CloudOff,
  RefreshCw,
  AlertCircle,
  ServerCrash,
  ShieldAlert,
  FileJson,
  Clock,
  Database,
} from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'
import { useInertialSensors } from '@/hooks/useInertialSensors'
import { useCloudSync } from '@/hooks/useCloudSync'
import { TripHeader } from '@/components/TripHeader'
import { TripExport } from '@/components/TripExport'
import { DebugConsole } from '@/components/DebugConsole'
import { cn, generateSessionId } from '@/lib/utils'

export default function TripDetails() {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    if (!paramSessionId || paramSessionId === 'latest-session') {
      const newSession = generateSessionId()
      navigate(`/trip/${newSession}`, { replace: true })
    } else {
      setSessionId(paramSessionId)
    }
  }, [paramSessionId, navigate])

  const [retryTrigger, setRetryTrigger] = useState(0)
  const handleRetry = useCallback(() => setRetryTrigger((prev) => prev + 1), [])

  const sensors = useInertialSensors()
  const {
    syncStatus,
    syncErrorType,
    sendTelemetry,
    remoteData,
    pendingSyncCount,
    latency,
    timestampDrift,
    forceReconnect,
  } = useCloudSync(sessionId, sensors.isCapturing, retryTrigger)

  const latestFftRef = useRef(sensors.fftFeatures)
  const latestDataRef = useRef(sensors.data)

  useEffect(() => {
    latestFftRef.current = sensors.fftFeatures
    latestDataRef.current = sensors.data
  }, [sensors.fftFeatures, sensors.data])

  useEffect(() => {
    if (!sensors.isCapturing) return
    const interval = setInterval(() => {
      if (!latestFftRef.current) return

      sendTelemetry({
        deviceId: sessionId,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        sensorType: 'inertial',
        features: latestFftRef.current,
        quality: {
          signalConfidence: latestDataRef.current.length > 0 ? 0.98 : 0.0,
          anomalyScore: sensors.potholes > 0 ? 0.75 : 0.1,
        },
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [sensors.isCapturing, sendTelemetry, sessionId, sensors.potholes])

  const isMonitorDevice = sensors.permissionState === 'unsupported'
  const hasData = sensors.isCapturing ? !!sensors.fftFeatures : remoteData.length > 0
  const isOnline =
    ['Connected', 'Creating Transmission', 'Transmission Active'].includes(syncStatus) ||
    sensors.isCapturing

  if (!sessionId) return null

  return (
    <div className="space-y-6 animate-fade-in pb-12 md:pb-6 transition-colors duration-500">
      <TripHeader
        sessionId={sessionId}
        syncStatus={syncStatus}
        isOnline={isOnline}
        isCapturing={sensors.isCapturing}
        isMonitorDevice={isMonitorDevice}
        isReceiving={!sensors.isCapturing && isOnline}
        permissionState={sensors.permissionState}
        isWaiting={sensors.isWaiting}
        startCapture={sensors.startCapture}
        stopCapture={sensors.stopCapture}
        sensorError={sensors.error}
      />

      <div className="flex justify-end">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 backdrop-blur-sm rounded-full border shadow-sm text-xs font-medium w-fit transition-all duration-300">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground hidden sm:inline">Backend Health:</span>
          <span
            className={cn(
              'flex items-center gap-1.5 font-bold tracking-tight',
              syncErrorType === 'server'
                ? 'text-destructive'
                : latency >= 0 && latency < 500
                  ? 'text-emerald-500'
                  : latency >= 500
                    ? 'text-amber-500'
                    : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full shadow-sm',
                syncErrorType === 'server'
                  ? 'bg-destructive animate-pulse'
                  : latency >= 0 && latency < 500
                    ? 'bg-emerald-500'
                    : latency >= 500
                      ? 'bg-amber-500'
                      : 'bg-muted',
              )}
            />
            {syncErrorType === 'server'
              ? 'Downtime'
              : latency >= 0
                ? `${latency}ms`
                : 'Checking...'}
          </span>
        </div>
      </div>

      {syncErrorType !== 'none' && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2 bg-destructive/10 border-destructive/20 shadow-sm"
        >
          <div className="flex gap-3">
            {syncErrorType === 'timeout' && (
              <Clock className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            {(syncErrorType === 'auth' || syncErrorType === 'cors') && (
              <ShieldAlert className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            {syncErrorType === 'server' && (
              <ServerCrash className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            {(syncErrorType === 'serialization' || syncErrorType === 'schema') && (
              <FileJson className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}
            {(syncErrorType === 'payload_size' || syncErrorType === 'network') && (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            )}

            <div className="space-y-1">
              <AlertTitle className="text-destructive font-semibold text-base">
                {syncErrorType === 'timeout' && 'Connection Timeout'}
                {syncErrorType === 'auth' && 'Unauthorized Access'}
                {syncErrorType === 'cors' && 'CORS / Security Error'}
                {syncErrorType === 'server' && 'Backend Offline / Service Unavailable'}
                {syncErrorType === 'serialization' && 'JSON Serialization Error'}
                {syncErrorType === 'schema' && 'Invalid Payload Schema'}
                {syncErrorType === 'payload_size' && 'Payload Too Large'}
                {syncErrorType === 'network' && 'Network Connectivity Error'}
              </AlertTitle>
              <AlertDescription className="text-destructive/90 text-sm">
                {syncErrorType === 'timeout' &&
                  'The request to the backend timed out. Retrying automatically...'}
                {syncErrorType === 'auth' && 'Invalid or missing authentication headers.'}
                {syncErrorType === 'cors' &&
                  'Cross-Origin Resource Sharing policy blocked the request.'}
                {syncErrorType === 'server' &&
                  'The Skip Cloud database or backend API is currently down.'}
                {syncErrorType === 'serialization' &&
                  'Failed to parse telemetry data into valid JSON. Details logged locally.'}
                {syncErrorType === 'schema' &&
                  'The telemetry payload does not match the required schema.'}
                {syncErrorType === 'payload_size' &&
                  'The data payload exceeds the maximum allowed size limit.'}
                {syncErrorType === 'network' && 'A general network connectivity issue occurred.'}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {(syncStatus === 'Offline' || syncStatus === 'Retrying') &&
        !sensors.isCapturing &&
        isMonitorDevice &&
        syncErrorType === 'none' && (
          <Alert
            variant={syncStatus === 'Retrying' ? 'default' : 'destructive'}
            className={cn(
              'animate-in fade-in',
              syncStatus === 'Retrying' ? 'bg-amber-500/10' : 'bg-destructive/10',
            )}
          >
            {syncStatus === 'Retrying' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            <AlertTitle>
              {syncStatus === 'Retrying' ? 'Reconectando...' : 'Conexão Perdida'}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p>Falha ao sincronizar com a Skip Cloud.</p>
              {syncStatus === 'Offline' && (
                <button
                  onClick={handleRetry}
                  className="mt-3 inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}

      {isMonitorDevice && !sensors.isCapturing && !hasData && syncStatus !== 'Offline' && (
        <Card className="border-primary/20 bg-primary/5 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 p-4 bg-white rounded-2xl shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/trip/${sessionId}`)}`}
                alt="QR Code"
                className="w-32 h-32"
              />
            </div>
            <div className="space-y-4 text-center sm:text-left">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Escaneie para Transmitir
              </h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Seu smartphone funcionará como sensor inercial e enviará a telemetria via Skip
                Cloud.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {sensors.isCapturing ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-emerald-500/10 to-background rounded-3xl border border-emerald-500/20 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_100%)]" />
          <div className="space-y-4 text-center z-10">
            <div className="mx-auto w-24 h-24 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_35px_rgba(16,185,129,0.8)] flex items-center justify-center">
              <Activity className="w-10 h-10 text-white animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Captura Edge Ativa</h3>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">
              Processando blocos de 256 amostras (FFT) e enviando payload estruturado em tempo real.
            </p>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-3 text-sm font-medium bg-background/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
              <div
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  syncStatus === 'Connecting'
                    ? 'text-primary animate-pulse'
                    : syncStatus === 'Connected' ||
                        syncStatus === 'Creating Transmission' ||
                        syncStatus === 'Transmission Active'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shadow-sm',
                    syncStatus === 'Connecting'
                      ? 'bg-primary'
                      : syncStatus === 'Connected' ||
                          syncStatus === 'Creating Transmission' ||
                          syncStatus === 'Transmission Active'
                        ? 'bg-emerald-500'
                        : 'bg-muted',
                  )}
                />
                Connecting
              </div>
              <div className="hidden md:block w-8 h-px bg-border" />
              <div
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  syncStatus === 'Connected'
                    ? 'text-primary animate-pulse'
                    : syncStatus === 'Creating Transmission' || syncStatus === 'Transmission Active'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shadow-sm',
                    syncStatus === 'Connected'
                      ? 'bg-primary'
                      : syncStatus === 'Creating Transmission' ||
                          syncStatus === 'Transmission Active'
                        ? 'bg-emerald-500'
                        : 'bg-muted',
                  )}
                />
                Connected
              </div>
              <div className="hidden md:block w-8 h-px bg-border" />
              <div
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  syncStatus === 'Creating Transmission'
                    ? 'text-primary animate-pulse'
                    : syncStatus === 'Transmission Active'
                      ? 'text-emerald-500'
                      : 'text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shadow-sm',
                    syncStatus === 'Creating Transmission'
                      ? 'bg-primary'
                      : syncStatus === 'Transmission Active'
                        ? 'bg-emerald-500'
                        : 'bg-muted',
                  )}
                />
                Creating Transmission
              </div>
              <div className="hidden md:block w-8 h-px bg-border" />
              <div
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  syncStatus === 'Transmission Active'
                    ? 'text-emerald-500 font-bold'
                    : 'text-muted-foreground',
                )}
              >
                <div
                  className={cn(
                    'w-3 h-3 rounded-full shadow-sm',
                    syncStatus === 'Transmission Active'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-muted',
                  )}
                />
                Transmission Active
              </div>
            </div>

            {syncStatus === 'Retrying' && (
              <div className="text-amber-500 text-sm font-bold flex items-center justify-center gap-2 mt-4 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" /> Retrying Connection...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-panel overflow-hidden shadow-md">
              <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" /> Análise Espectral (FFT) em Tempo
                  Real
                </CardTitle>
                <CardDescription>
                  Extração de features baseada em janelas (Edge Processing)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <TripCharts data={remoteData} waitingForData={!hasData} />
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <TripExport sessionId={sessionId} />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="glass-panel flex flex-col h-[300px] sm:h-[400px] shadow-md overflow-hidden">
              <CardHeader className="pb-2 absolute z-10 bg-background/80 backdrop-blur-md w-full border-b border-border/50 transition-all">
                <CardTitle className="text-sm flex items-center gap-2 font-semibold">
                  <MapPin className="w-4 h-4 text-primary" /> Mapa de Contexto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative bg-muted/10">
                <MapMock mode="default" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <DebugConsole
        latency={latency}
        drift={timestampDrift}
        samplingRate={sensors.samplingRate}
        sensorStatus={sensors.sensorStatus}
        pendingSyncCount={pendingSyncCount}
        forceReconnect={forceReconnect}
      />
    </div>
  )
}
