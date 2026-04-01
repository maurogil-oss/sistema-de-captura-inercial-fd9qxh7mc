import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle2 } from 'lucide-react'

export function ESGPerformanceReport() {
  const [reportGenerated, setReportGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setReportGenerated(true)
    }, 1500)
  }

  return (
    <Card className="glass-panel border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" />
          Relatórios de Performance ESG
        </CardTitle>
        <CardDescription>
          Consolide o histórico de Minting e impacto ambiental para investidores e partes
          interessadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!reportGenerated ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 rounded-xl border border-dashed border-border/50 bg-muted/10">
            <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Gere um relatório completo das atividades de mitigação de carbono e simulações do
              período atual.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
            >
              {isGenerating ? 'Gerando Relatório...' : 'Gerar Relatório ESG'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border/50 pb-4 gap-4">
              <div>
                <h3 className="text-lg font-bold">
                  Relatório Mensal de Performance Ambiental - ORBIS/UOS
                </h3>
                <p className="text-sm text-muted-foreground">
                  Competência:{' '}
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <Download className="w-4 h-4" /> Exportar PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Total tCO2e Mitigado</div>
                <div className="text-2xl font-bold text-emerald-500">428.5 t</div>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Ativos Ambientais (Minted)</div>
                <div className="text-2xl font-bold text-blue-500">1,240</div>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Valor Liquidado (USD)</div>
                <div className="text-2xl font-bold text-orange-500">$ 12,450.00</div>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border/50 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Ações de Zeladoria Validadas
                </div>
                <div className="text-2xl font-bold text-primary">3,492</div>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Certificação de Autenticidade Concluída
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">
                  Todos os dados de telemetria base associados a este relatório foram validados
                  criptograficamente pela rede de oráculos L0 e são imutáveis na ledger RWA.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
