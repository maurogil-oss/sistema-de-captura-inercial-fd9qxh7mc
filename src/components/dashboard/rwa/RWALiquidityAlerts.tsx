import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, BellRing, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToastAction } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AlertStatus = 'active' | 'triggered' | 'liquidated'

export function RWALiquidityAlerts() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<{
    id: string
    target: number
    active: boolean
    status: AlertStatus
  }>([
    { id: '1', target: 35.0, active: true, status: 'active' },
    { id: '2', target: 40.0, active: true, status: 'active' },
    { id: '3', target: 28.0, active: false, status: 'triggered' },
  ])
  const [newTarget, setNewTarget] = useState('')
  const [currentPrice, setCurrentPrice] = useState(29.6)

  const [liquidatingAlert, setLiquidatingAlert] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [isLiquidating, setIsLiquidating] = useState(false)

  const handleAddAlert = () => {
    const val = parseFloat(newTarget)
    if (!isNaN(val) && val > 0) {
      setAlerts([
        ...alerts,
        { id: Math.random().toString(), target: val, active: true, status: 'active' },
      ])
      setNewTarget('')
      toast({
        title: 'Alert Configured',
        description: `Market alert set for $${val.toFixed(2)} USD/tCO2e.`,
      })
    }
  }

  const simulateMarket = () => {
    const newPrice = currentPrice + (Math.random() * 8 - 1)
    setCurrentPrice(newPrice)

    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.status === 'active' && newPrice >= alert.target && currentPrice < alert.target) {
          toast({
            title: 'Liquidity Alert Triggered!',
            description: `Carbon asset valuation hit $${alert.target.toFixed(2)} USD/tCO2e.`,
            action: (
              <ToastAction altText="Liquidar Agora" onClick={() => setLiquidatingAlert(alert.id)}>
                Liquidar
              </ToastAction>
            ),
          })
          return { ...alert, active: false, status: 'triggered' }
        }
        return alert
      }),
    )
  }

  const confirmLiquidation = () => {
    setIsLiquidating(true)
    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === liquidatingAlert ? { ...a, status: 'liquidated' } : a)),
      )
      toast({
        title: 'Liquidação Concluída com Sucesso',
        description: `Ativo convertido para ${currency}. Fundos já transferidos para a Tesouraria Verde Municipal.`,
      })
      setIsLiquidating(false)
      setLiquidatingAlert(null)
    }, 1500)
  }

  return (
    <>
      <Card className="glass-panel border-blue-500/20 flex flex-col h-full">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-500" />
              Painel de Execução & Liquidez
            </div>
            <Badge variant="outline" className="font-mono bg-blue-500/10 text-blue-500">
              ${currentPrice.toFixed(2)} USD
            </Badge>
          </CardTitle>
          <CardDescription>
            Configure alertas de valuation para ativos de carbono e execute a liquidação (conversão
            fiat).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 flex-1">
          <div className="flex items-end gap-2">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="target-price" className="text-xs">
                Preço Alvo (USD/tCO2e)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target-price"
                  type="number"
                  placeholder="Ex: 35.00"
                  className="pl-8"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleAddAlert}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Alertas de Mercado</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={simulateMarket}
              >
                <TrendingUp className="w-3 h-3 mr-1" /> Simular Flutuação
              </Button>
            </div>

            <ScrollArea className="h-[180px] rounded-md border border-border/50 bg-muted/20 p-2">
              {alerts.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-4">
                  Nenhum alerta configurado.
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col p-2.5 rounded-lg bg-background border border-border/50 gap-2 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Bell
                            className={`w-4 h-4 ${alert.status === 'active' ? 'text-blue-500' : 'text-muted-foreground'}`}
                          />
                          <span className="text-sm font-bold">${alert.target.toFixed(2)}</span>
                        </div>
                        <Badge
                          variant={
                            alert.status === 'active'
                              ? 'default'
                              : alert.status === 'liquidated'
                                ? 'outline'
                                : 'secondary'
                          }
                          className="text-[10px] font-medium tracking-wide"
                        >
                          {alert.status === 'active'
                            ? 'Ativo'
                            : alert.status === 'triggered'
                              ? 'Atingido'
                              : 'Liquidado'}
                        </Badge>
                      </div>

                      {alert.status === 'triggered' && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                            onClick={() => setLiquidatingAlert(alert.id)}
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" /> Liquidar Agora
                          </Button>
                        </div>
                      )}

                      {alert.status === 'liquidated' && (
                        <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-500/10 rounded py-1.5 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Transferência Concluída
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!liquidatingAlert} onOpenChange={(open) => !open && setLiquidatingAlert(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Executar Liquidação de Ativos RWA</DialogTitle>
            <DialogDescription>
              Selecione a moeda de conversão fiat para o lote de créditos de carbono (Target
              alcançado: $
              {alerts.find((a) => a.id === liquidatingAlert)?.target?.toFixed(2) || '0.00'}{' '}
              USD/tCO2e).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Moeda de Destino</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-3.5 border border-border/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comprador Aprovado:</span>
                <span className="font-medium text-right">Global ESG Fund Ltd.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Conversão:</span>
                <span className="font-medium text-emerald-500">Garantida via Smart Contract</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Destino dos Fundos:</span>
                <span className="font-medium text-right">Tesouraria Municipal (Conta #9421)</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLiquidatingAlert(null)}
              disabled={isLiquidating}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmLiquidation}
              disabled={isLiquidating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px]"
            >
              {isLiquidating ? 'Processando...' : 'Confirmar Liquidação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
