import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Lock, Fingerprint, EyeOff, Shield } from 'lucide-react'

export function DefenseLayersCard() {
  const layers = [
    {
      level: '0',
      name: 'IronShield',
      icon: Shield,
      desc: 'Anti-Tampering, Anti-Debugging & GPS Anti-Spoofing active',
    },
    {
      level: '1',
      name: 'Cryptographic Signatures',
      icon: Lock,
      desc: 'VPackets validated via HMAC SHA-256, Timestamps & Secret Keys',
    },
    {
      level: '2',
      name: 'Zero-Knowledge Proofs (ZKP)',
      icon: EyeOff,
      desc: 'Road/efficiency data validated without revealing PII',
    },
    {
      level: '3',
      name: 'Invisible Watermarking',
      icon: Fingerprint,
      desc: 'Proprietary digital signatures within source code & packets',
    },
  ]

  return (
    <Card className="glass-panel border-primary/20 h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Multi-Layer Defense Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.level}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mt-0.5">
              <layer.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  LAYER {layer.level}
                </span>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-4 px-1.5"
                >
                  Active
                </Badge>
              </div>
              <span className="text-sm font-semibold block text-foreground leading-none">
                {layer.name}
              </span>
              <p className="text-[11px] text-muted-foreground leading-snug">{layer.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
