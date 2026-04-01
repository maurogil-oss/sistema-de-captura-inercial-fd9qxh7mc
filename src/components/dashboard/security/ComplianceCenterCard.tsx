import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileCheck, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ComplianceCenterCard() {
  const standards = [
    { name: 'dMRV (Edge AI Co2)', active: true, desc: 'Real-time reduction verification' },
    { name: 'SBCE Traceability', active: true, desc: 'Brazilian carbon market integration' },
    { name: 'ISO 14064 (GHG)', active: true, desc: 'Emissions quantification protocol' },
    { name: 'ISO 27001', active: true, desc: 'Information security management' },
    { name: 'ISO 37120', active: true, desc: 'Sustainable cities indicators' },
  ]

  return (
    <Card className="glass-panel border-blue-500/20 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-500" />
          Compliance Intelligence Center
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto">
        {standards.map((std) => (
          <div
            key={std.name}
            className="flex justify-between items-center p-2.5 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors"
          >
            <div className="space-y-1">
              <span className="text-sm font-semibold flex items-center gap-1.5">
                {std.active && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {std.name}
              </span>
              <p className="text-[11px] text-muted-foreground leading-tight">{std.desc}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] h-5 ml-2 shrink-0',
                std.active
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {std.active ? 'Active' : 'Pending'}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
