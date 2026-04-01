import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, BellRing, TrendingUp, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToastAction } from '@/components/ui/toast'

export function RWALiquidityAlerts() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<{ id: string; target: number; active: boolean }[]>([
    { id: '1', target: 35.0, active: true },
    { id: '2', target: 40.0, active: true },
  ])
  const [newTarget, setNewTarget] = useState('')
  const [currentPrice, setCurrentPrice] = useState(29.6)

  const handleAddAlert = () => {
    const val = parseFloat(newTarget)
    if (!isNaN(val) && val > 0) {
      setAlerts([...alerts, { id: Math.random().toString(), target: val, active: true }])
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

    alerts.forEach((alert) => {
      if (alert.active && newPrice >= alert.target && currentPrice < alert.target) {
        toast({
          title: 'Liquidity Alert Triggered!',
          description: `Carbon asset valuation hit $${alert.target.toFixed(2)} USD/tCO2e.`,
          action: (
            <ToastAction
              altText="Review for Liquidation"
              onClick={() => window.alert('Reviewing for Liquidation...')}
            >
              Review
            </ToastAction>
          ),
        })
        setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, active: false } : a)))
      }
    })
  }

  return (
    <Card className="glass-panel border-blue-500/20 flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-500" />
            Liquidity Alerts System
          </div>
          <Badge variant="outline" className="font-mono bg-blue-500/10 text-blue-500">
            ${currentPrice.toFixed(2)} USD
          </Badge>
        </CardTitle>
        <CardDescription>
          Set valuation thresholds for carbon assets to receive automated liquidation alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 flex-1">
        <div className="flex items-end gap-2">
          <div className="space-y-1.5 flex-1">
            <Label htmlFor="target-price" className="text-xs">
              Target Price (USD/tCO2e)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-price"
                type="number"
                placeholder="e.g. 35.00"
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
            Add Alert
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Active Targets</Label>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={simulateMarket}>
              <TrendingUp className="w-3 h-3 mr-1" /> Simulate Market Shift
            </Button>
          </div>

          <ScrollArea className="h-[120px] rounded-md border border-border/50 bg-muted/20 p-2">
            {alerts.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground py-4">
                No alerts configured.
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex justify-between items-center p-2 rounded bg-background border border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <Bell
                        className={`w-3.5 h-3.5 ${alert.active ? 'text-blue-500' : 'text-muted-foreground'}`}
                      />
                      <span className="text-sm font-medium">${alert.target.toFixed(2)}</span>
                    </div>
                    <Badge variant={alert.active ? 'default' : 'secondary'} className="text-[10px]">
                      {alert.active ? 'Active' : 'Triggered'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
