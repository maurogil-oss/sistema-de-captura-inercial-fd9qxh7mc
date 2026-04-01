import { ComplianceCenterCard } from './security/ComplianceCenterCard'
import { DefenseLayersCard } from './security/DefenseLayersCard'
import { PQCPrivacyCard } from './security/PQCPrivacyCard'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldAlert, Link as LinkIcon, Wallet, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export function ForensicSecurityMatrix() {
  return (
    <div className="space-y-6 w-full pt-6 pb-2">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Orbis Forensic Security Matrix</h2>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 hidden md:inline-flex"
            >
              Multi-Layer Architecture
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de defesa cibernética, PQC e compliance RWA.
          </p>
        </div>

        <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5 w-full lg:w-auto">
          <CardContent className="p-3 flex flex-wrap items-center justify-between lg:justify-end gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> RWA Integrity Verified
              </span>
              <span className="text-xs text-muted-foreground">Audit-Ready for VCs (B2B) & B2G</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 border-emerald-500/20 hover:bg-emerald-500/10"
                asChild
              >
                <Link to="/treasury">
                  <Wallet className="w-3.5 h-3.5" /> Green Treasury
                </Link>
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                asChild
              >
                <Link to="/audit">
                  <LinkIcon className="w-3.5 h-3.5" /> Audit Logs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ComplianceCenterCard />
        <DefenseLayersCard />
        <PQCPrivacyCard />
      </div>
    </div>
  )
}
