import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, FileText, FileJson } from 'lucide-react'
import { TripEvent } from '@/hooks/useInertialSensors'
import { useToast } from '@/hooks/use-toast'

interface TripExportProps {
  sessionId: string
  stats: any
  events: TripEvent[]
}

export function TripExport({ sessionId, stats, events }: TripExportProps) {
  const { toast } = useToast()

  const handleExportJSON = () => {
    const payload = JSON.stringify(
      {
        sessionId,
        exportDate: new Date().toISOString(),
        summary: stats,
        criticalEvents: events,
      },
      null,
      2,
    )

    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Orbis_Trip_${sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({ title: 'Exportação Concluída', description: 'O arquivo JSON foi baixado com sucesso.' })
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=800')
    if (!printWindow) return

    const html = `
      <html>
        <head>
          <title>Orbis Report - ${sessionId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { color: #000; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; }
            .metric { display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding: 10px 0; }
            .label { font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #eaeaea; padding: 12px; text-align: left; }
            th { background-color: #f9f9f9; }
            .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Relatório de Telemetria Orbis</h1>
          <div class="metric"><span class="label">ID da Sessão:</span> <span>${sessionId}</span></div>
          <div class="metric"><span class="label">Data de Emissão:</span> <span>${new Date().toLocaleString()}</span></div>
          <div class="metric"><span class="label">Zen Score:</span> <span>${Math.round(stats.zenScore || 100)}/100</span></div>
          <div class="metric"><span class="label">Eventos Críticos:</span> <span>${events.length}</span></div>
          <div class="metric"><span class="label">Economia de Bateria:</span> <span>~80% (Edge AI Ativo)</span></div>
          
          <h2>Registro de Eventos</h2>
          ${
            events.length === 0
              ? '<p>Nenhum evento registrado nesta sessão.</p>'
              : `
          <table>
            <thead><tr><th>Tipo</th><th>Gravidade</th><th>Horário</th><th>Detalhes</th></tr></thead>
            <tbody>
              ${events.map((e) => `<tr><td>${e.type}</td><td>${e.severity}</td><td>${e.timestamp}</td><td>${e.details}</td></tr>`).join('')}
            </tbody>
          </table>
          `
          }
          <div class="footer">Gerado automaticamente por Orbis Sistema de Captura Inercial</div>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
      toast({ title: 'Relatório Gerado', description: 'A janela de impressão do PDF foi aberta.' })
    }, 500)
  }

  return (
    <Card className="glass-panel">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-primary" /> B2B Export Suite
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full text-xs h-9" onClick={handleExportPDF}>
            <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF Resumo
          </Button>
          <Button variant="outline" className="w-full text-xs h-9" onClick={handleExportJSON}>
            <FileJson className="w-3.5 h-3.5 mr-1.5" /> Dados Brutos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
