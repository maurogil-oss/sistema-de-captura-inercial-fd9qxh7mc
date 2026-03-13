import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Smartphone, MapPin, Activity } from 'lucide-react'
import { TripCharts } from '@/components/TripCharts'
import { MapMock } from '@/components/ui-custom/MapMock'
import { useInertialSensors } from '@/hooks/useInertialSensors'
import { useCloudSync } from '@/hooks/useCloudSync'
import { TripHeader } from '@/components/TripHeader'
import { TripMetricsCard } from '@/components/TripMetricsCard'

const generateSessionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rand = (len: number) =>
    Array.from({ length: len })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('')
  return `TRP-${rand(4)}-${rand(2)}`
}

export default function TripDetails() {
  const location = useLocation()
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    let session = params.get('session')
    if (!session) {
      session = generateSessionId()
      window.history.replaceState(null, '', `?session=${session}`)
    }
    setSessionId(session)
  }, [location.search])

  const sensors = useInertialSensors()
  const { syncStatus, sendBatch, remoteData, remoteStats, isReceiving } = useCloudSync(
    sessionId,
    sensors.isCapturing,
  )

  useEffect(() => {
    if (sensors.isCapturing && sensors.data.length > 0) {
      sendBatch(sensors.data, {
        zenScore: sensors.zenScore,
        phi: sensors.phi,
        maxJerk: sensors.maxJerk,
        potholes: sensors.potholes,
      })
    }
  }, [
    sensors.data,
    sensors.isCapturing,
    sendBatch,
    sensors.zenScore,
    sensors.phi,
    sensors.maxJerk,
    sensors.potholes,
  ])

  if (!sessionId) return null

  const isMonitorDevice = sensors.permissionState === 'unsupported'
  const isMonitoring = !sensors.isCapturing
  const isReceivingRemote = isMonitoring && isReceiving
  const hasData = sensors.isCapturing ? sensors.data.length > 0 : remoteData.length > 0

  const hasActivated =
    sensors.permissionState === 'granted' ||
    sensors.isCapturing ||
    isReceivingRemote ||
    isMonitorDevice

  const waitingForData = hasActivated && !hasData
  const displayData = sensors.isCapturing ? sensors.data : remoteData

  const dZen =
    (isMonitorDevice || isReceivingRemote) && remoteStats ? remoteStats.zenScore : sensors.zenScore
  const dPhi = (isMonitorDevice || isReceivingRemote) && remoteStats ? remoteStats.phi : sensors.phi
  const dJerk =
    (isMonitorDevice || isReceivingRemote) && remoteStats ? remoteStats.maxJerk : sensors.maxJerk
  const dPotholes =
    (isMonitorDevice || isReceivingRemote) && remoteStats ? remoteStats.potholes : sensors.potholes

  return (
    <div className="space-y-6 animate-fade-in pb-12 md:pb-6">
      <TripHeader
        sessionId={sessionId}
        syncStatus={syncStatus}
        isCapturing={sensors.isCapturing}
        isMonitorDevice={isMonitorDevice}
        isReceiving={isReceivingRemote}
        permissionState={sensors.permissionState}
        isWaiting={sensors.isWaiting}
        startCapture={sensors.startCapture}
        stopCapture={sensors.stopCapture}
      />

      {sensors.error && !isMonitorDevice && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription className="mt-1">{sensors.error}</AlertDescription>
        </Alert>
      )}

      {isMonitorDevice && !sensors.isCapturing && (
        <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-top-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <AlertTitle>Monitor Mode</AlertTitle>
          <AlertDescription className="mt-1">
            Visualizando telemetria remota. Os dados serão exibidos assim que o dispositivo móvel
            começar a transmitir na sessão <strong>{sessionId}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Smartphone className="w-5 h-5 text-primary" /> Telemetria Inercial de Alta
                  Frequência
                </CardTitle>
                <CardDescription className="mt-1">
                  {sensors.isCapturing
                    ? 'Buffer efêmero sincronizando com a nuvem (Batches de 60Hz).'
                    : isReceivingRemote
                      ? 'Exibindo dados remotos sincronizados em tempo real via nuvem.'
                      : 'Toque em Ativar Sensores ou abra o link no seu celular para iniciar a transmissão.'}
                </CardDescription>
              </div>
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
                  animate={!sensors.isCapturing && !isReceivingRemote}
                  waitingForData={waitingForData}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel overflow-hidden flex flex-col h-[300px] sm:h-[400px]">
            <CardHeader className="pb-2 absolute z-10 bg-background/60 backdrop-blur-md w-full border-b border-border/50">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Replay do Trajeto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-muted/10">
              <MapMock mode="default" />
              {waitingForData && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <p className="text-xs font-mono text-muted-foreground border border-border bg-background px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                    {isMonitorDevice ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        AGUARDANDO GPS DO CELULAR
                      </>
                    ) : (
                      'AGUARDANDO DADOS'
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <TripMetricsCard
            hasActivated={hasActivated}
            isCapturing={sensors.isCapturing}
            isReceiving={isReceivingRemote}
            hasData={hasData}
            maxJerk={dJerk}
            potholes={dPotholes}
            phi={dPhi}
            zenScore={dZen}
          />
        </div>
      </div>
    </div>
  )
}
