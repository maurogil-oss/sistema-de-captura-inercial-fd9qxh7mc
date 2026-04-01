import { RWAPortfolioCard } from './RWAPortfolioCard'
import { RWAForensicCard } from './RWAForensicCard'
import { RWALiquidityCard } from './RWALiquidityCard'
import { RWAActivityBridge } from './RWAActivityBridge'
import { RWAMap } from './RWAMap'
import { ESGPerformanceReport } from './ESGPerformanceReport'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

export function RWADashboard() {
  return (
    <div className="space-y-6 mt-8 pt-6 border-t border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Intelligence & RWA Layer</h2>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="w-3 h-3 mr-1" /> Live Minter
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <RWAMap />
          <RWAActivityBridge />
        </div>
        <div className="space-y-6 flex flex-col">
          <RWAPortfolioCard />
          <RWAForensicCard />
          <RWALiquidityCard />
        </div>
      </div>

      <ESGPerformanceReport />
    </div>
  )
}
