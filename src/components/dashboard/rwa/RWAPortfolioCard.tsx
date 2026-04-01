import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, TrendingUp } from 'lucide-react'

export function RWAPortfolioCard() {
  return (
    <Card className="glass-panel border-emerald-500/20">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-500" />
          Carbon Portfolio Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Total Volume</div>
          <div className="text-2xl font-bold text-emerald-500">
            12,450.50 <span className="text-sm font-normal text-muted-foreground">tCO2e</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Market Valuation</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 p-2 rounded border border-border/50 flex flex-col items-center text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                BRL
              </div>
              <div className="font-mono font-medium text-xs">1.84M</div>
            </div>
            <div className="bg-muted/30 p-2 rounded border border-border/50 flex flex-col items-center text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                USD
              </div>
              <div className="font-mono font-medium text-xs">368.5k</div>
            </div>
            <div className="bg-muted/30 p-2 rounded border border-border/50 flex flex-col items-center text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                EUR
              </div>
              <div className="font-mono font-medium text-xs">331.6k</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded border border-emerald-500/20 mt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Minting Efficiency</span>
          </div>
          <span className="font-mono font-bold text-emerald-500">98.4%</span>
        </div>
      </CardContent>
    </Card>
  )
}
