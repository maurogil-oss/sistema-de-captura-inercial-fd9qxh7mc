import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Link as LinkIcon, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function RWAForensicCard() {
  return (
    <Card className="glass-panel border-blue-500/20">
      <CardHeader className="pb-2 border-b border-border/50">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Forensic Integrity Monitor
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            OrbisChain
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Conflict-Free Score</span>
          <span className="font-mono font-bold text-emerald-500">100%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">LGPD Compliance (IIP)</span>
          <span className="font-mono font-bold text-blue-500">99.9%</span>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Hash Validation
          </div>
          <div className="p-2 bg-muted/30 rounded border border-border/50 flex justify-between items-center">
            <span className="font-mono text-xs truncate max-w-[180px]">0x7f8b9a12c4e5...</span>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-5"
            >
              Valid
            </Badge>
          </div>
        </div>

        <Button variant="outline" className="w-full h-8 text-xs gap-2" asChild>
          <a href="#" target="_blank" rel="noreferrer">
            <LinkIcon className="w-3 h-3" /> Direct-to-Hash Explorer
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
