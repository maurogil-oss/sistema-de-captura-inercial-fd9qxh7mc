import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, MapPin, Smartphone, CloudOff, RefreshCw } from 'lucide-react'
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
    sendPayload,
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

      sendPayload({
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
    }, 1000) // Send features every second
    return () => clearInterval(interval)
  }, [sensors.isCapturing, sendPayload, sessionId, sensors.potholes])

  const isMonitorDevice = sensors.permissionState === 'unsupported'
  const hasData = sensors.isCapturing ? !!sensors.fftFeatures : remoteData.length > 0
  const isOnline = syncStatus === 'Connected' || sensors.isCapturing

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

      {(syncStatus === 'Offline' || syncStatus === 'Reconnecting') &&
        !sensors.isCapturing &&
        isMonitorDevice && (
          <Alert
            variant={syncStatus === 'Reconnecting' ? 'default' : 'destructive'}
            className={cn(
              'animate-in fade-in',
              syncStatus === 'Reconnecting' ? 'bg-amber-500/10' : 'bg-destructive/10',
            )}
          >
            {syncStatus === 'Reconnecting' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CloudOff className="h-4 w-4" />
            )}
            <AlertTitle>
              {syncStatus === 'Reconnecting' ? 'Reconectando...' : 'Conexão Perdida'}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p>Falha ao sincronizar com a Skip Cloud.</p>
              {syncStatus === 'Offline' && (
                <button
                  onClick={handleRetry}
                  className="mt-3 inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}

      {isMonitorDevice && !sensors.isCapturing && !hasData && syncStatus !== 'Offline' && (
        <Card className="border-primary/20 bg-primary/5 shadow-md">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 p-4 bg-white rounded-2xl">
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
              <p className="text-muted-foreground text-sm">
                Seu smartphone funcionará como sensor inercial e enviará a telemetria via Skip
                Cloud.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {sensors.isCapturing ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-emerald-500/10 to-background rounded-3xl border border-emerald-500/20 shadow-inner">
          <div className="space-y-4 text-center">
            <div className="mx-auto w-24 h-24 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.8)]" />
            <h3 className="text-2xl font-bold">Captura Edge Ativa</h3>
            <p className="text-muted-foreground">
              Processando blocos de 256 amostras (FFT) e enviando payload estruturado.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-panel overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" /> Análise Espectral (FFT) em Tempo
                  Real
                </CardTitle>
                <CardDescription>
                  Extração de features baseada em janelas (Edge Processing)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TripCharts data={remoteData} waitingForData={!hasData} />
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-6">
              <TripExport sessionId={sessionId} />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="glass-panel flex flex-col h-[300px] sm:h-[400px]">
              <CardHeader className="pb-2 absolute z-10 bg-background/60 backdrop-blur-md w-full border-b border-border/50">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Mapa de Contexto
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
