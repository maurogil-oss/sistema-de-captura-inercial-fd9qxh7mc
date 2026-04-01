import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Network, Database, Key, ShieldAlert } from 'lucide-react'

export function PQCPrivacyCard() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="glass-panel border-purple-500/20 flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b border-border/50 shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-500" />
            Post-Quantum Crypto (PQC)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 flex-1">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">Lattice-Based Readiness</span>
              <span className="text-xs font-mono font-bold text-purple-500">Kyber/Dilithium</span>
            </div>
            <Progress value={100} className="h-2 bg-purple-500/20" />
            <p className="text-[10px] text-muted-foreground">
              System is structurally prepared for NIST-approved algorithms.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Database className="w-3.5 h-3.5" /> Hashing Upgrade Path
              </span>
              <span className="font-mono text-xs font-medium">SHA-256 &rarr; SHA-512</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Key className="w-3.5 h-3.5" /> Forward Secrecy
              </span>
              <div className="flex flex-col items-end">
                <Badge variant="outline" className="text-[10px] h-5 bg-background">
                  Active
                </Badge>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  Auto session key rotation
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-amber-500/20 shrink-0">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Privacy-by-Design & No-PII
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          <div className="flex justify-between items-center p-2 rounded-md bg-muted/30 border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">Identity Data</span>
            <Badge
              variant="destructive"
              className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5"
            >
              Isolated on Device
            </Badge>
          </div>
          <div className="flex justify-between items-center p-2 rounded-md bg-muted/30 border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">Transmission Logs</span>
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Kinetic Hashes Only
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
