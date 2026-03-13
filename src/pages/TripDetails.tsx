import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { mockTripTimeline } from '@/data/mockData'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Smartphone, MapPin } from 'lucide-react'
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
  const { syncStatus, sendBatch, remoteData, remoteStats } = useCloudSync(
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

  const isMonitoring = !sensors.isCapturing && remoteData.length > 0
  const hasActivated = sensors.permissionState === 'granted' || sensors.isCapturing || isMonitoring

  const displayData = sensors.isCapturing
    ? sensors.data
    : isMonitoring
      ? remoteData
      : sensors.data.length > 0
        ? sensors.data
        : mockTripTimeline
  const dZen = isMonitoring && remoteStats ? remoteStats.zenScore : sensors.zenScore
  const dPhi = isMonitoring && remoteStats ? remoteStats.phi : sensors.phi
  const dJerk = isMonitoring && remoteStats ? remoteStats.maxJerk : sensors.maxJerk
  const dPotholes = isMonitoring && remoteStats ? remoteStats.potholes : sensors.potholes

  return (
    <div className="space-y-6 animate-fade-in pb-12 md:pb-6">
      <TripHeader
        sessionId={sessionId}
        syncStatus={syncStatus}
        isCapturing={sensors.isCapturing}
        isMonitoring={isMonitoring}
        permissionState={sensors.permissionState}
        isWaiting={sensors.isWaiting}
        startCapture={sensors.startCapture}
        stopCapture={sensors.stopCapture}
      />

      {sensors.error && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription className="mt-1">{sensors.error}</AlertDescription>
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
                    : isMonitoring
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
                <TripCharts data={displayData} animate={!sensors.isCapturing && !isMonitoring} />
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
              {!sensors.isCapturing && !isMonitoring && sensors.data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                  <p className="text-xs font-mono text-muted-foreground border border-border bg-background px-3 py-1.5 rounded-full shadow-sm">
                    AGUARDANDO DADOS
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <TripMetricsCard
            hasActivated={hasActivated}
            isCapturing={sensors.isCapturing}
            isMonitoring={isMonitoring}
            hasData={displayData.length > 0}
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
