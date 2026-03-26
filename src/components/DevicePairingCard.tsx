import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateSessionId } from '@/lib/utils'

interface DevicePairingCardProps {
  onSessionIdGenerated?: (sessionId: string) => void
}

export function DevicePairingCard({ onSessionIdGenerated }: DevicePairingCardProps) {
  const [sessionId, setSessionId] = useState('')
  const [pairingUrl, setPairingUrl] = useState('')

  useEffect(() => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    setPairingUrl(`${window.location.origin}/trip/${newSessionId}`)

    if (onSessionIdGenerated) {
      onSessionIdGenerated(newSessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sessionId) return null

  return (
    <Card className="glass-panel overflow-hidden relative group border-primary/20 bg-primary/5">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Smartphone className="w-4 h-4" /> Conectar Dispositivo Móvel
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Iniciar Transmissão de Telemetria</h2>
          <p className="text-muted-foreground text-sm">
            Escaneie o QR Code ao lado com o seu smartphone para iniciar uma nova sessão de captura
            de dados inerciais. Seu celular funcionará como um sensor L0 e os dados serão
            sincronizados aqui em tempo real.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Session ID
              </span>
              <span className="text-xl font-mono font-bold text-foreground">{sessionId}</span>
            </div>
            <Button asChild className="gap-2 shadow-md">
              <Link to={`/trip/${sessionId}`}>
                <Activity className="w-4 h-4" />
                Abrir Painel de Monitoramento
              </Link>
            </Button>
          </div>
        </div>

        <div className="shrink-0 p-3 bg-white rounded-xl shadow-sm border border-border/50 hover:scale-105 transition-transform duration-300">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pairingUrl)}`}
            alt="QR Code da Sessão"
            className="w-40 h-40"
          />
        </div>
      </CardContent>
    </Card>
  )
}
