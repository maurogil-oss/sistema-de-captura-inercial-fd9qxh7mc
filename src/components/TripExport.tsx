import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Download, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SkipCloud } from '@/lib/skip-cloud'

interface TripExportProps {
  sessionId: string
}

export function TripExport({ sessionId }: TripExportProps) {
  const { toast } = useToast()

  const handleExportCSV = async () => {
    try {
      toast({ title: 'Preparando Download...', description: 'Acessando dados da Skip Cloud.' })

      const result = await SkipCloud.collection('telemetry').getList(1, 1000, {
        filter: `sessionId = '${sessionId}'`,
        sort: '-created',
      })

      const history = result.items
      if (history.length === 0) {
        toast({
          title: 'Vazio',
          description: 'Nenhum registro encontrado para exportar.',
          variant: 'destructive',
        })
        return
      }

      const headers = [
        'timestamp',
        'deviceId',
        'sensorType',
        'fftPeak',
        'fftEnergy',
        'dominantFrequency',
        'signalVariance',
        'motionIndex',
        'signalConfidence',
        'anomalyScore',
      ]

      const rows = history.map((r: any) => {
        return [
          r.timestamp || r.created,
          r.deviceId || '',
          r.sensorType || 'inertial',
          r.features?.fftPeak || 0,
          r.features?.fftEnergy || 0,
          r.features?.dominantFrequency || 0,
          r.features?.signalVariance || 0,
          r.features?.motionIndex || 0,
          r.quality?.signalConfidence || 0,
          r.quality?.anomalyScore || 0,
        ].join(',')
      })

      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Telemetry_${sessionId}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({ title: 'Exportação Concluída', description: 'O arquivo CSV foi baixado.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao exportar dados.', variant: 'destructive' })
    }
  }

  return (
    <Card className="glass-panel w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="w-4 h-4" /> Dados e Exportação
        </CardTitle>
        <CardDescription className="text-xs">
          Baixe os dados processados completos da nuvem para análise offline.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Button
          onClick={handleExportCSV}
          className="w-full gap-2 bg-slate-800 text-white hover:bg-slate-700"
        >
          <FileText className="w-4 h-4" /> Exportar Sessão (.csv)
        </Button>
      </CardContent>
    </Card>
  )
}
