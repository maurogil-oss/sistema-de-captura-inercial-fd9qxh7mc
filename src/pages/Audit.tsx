import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, FileJson, Lock, Users, Leaf, Hash } from 'lucide-react'
import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Audit() {
  const [selectedProof, setSelectedProof] = useState<any>(null)

  const vCerts = [
    { hash: '0x8f2a...c912', timestamp: '2023-10-27T14:32:00Z', type: 'V-Cert Generation' },
    { hash: '0x3b1c...e445', timestamp: '2023-10-27T15:10:00Z', type: 'V-Cert Generation' },
    { hash: '0x7a99...112b', timestamp: '2023-10-27T16:05:00Z', type: 'V-Cert Generation' },
    { hash: '0x22df...88ca', timestamp: '2023-10-27T17:45:00Z', type: 'V-Cert Generation' },
  ]

  const equityData = [
    { zone: 'Zona Sul (Alta Renda)', nodes: 450, greenWave: 85 },
    { zone: 'Zona Leste (Baixa Renda)', nodes: 520, greenWave: 82 },
    { zone: 'Zona Norte (Média Renda)', nodes: 380, greenWave: 78 },
    { zone: 'Zona Oeste (Média Renda)', nodes: 410, greenWave: 88 },
    { zone: 'Centro (Comercial)', nodes: 600, greenWave: 95 },
  ]

  const handleSelectHash = (hash: string) => {
    setSelectedProof({
      hash: hash,
      timestamp: new Date().toISOString(),
      anonymizedDevice: 'OrbisNode-xxx-' + Math.floor(Math.random() * 999),
      proofData: {
        gForceZ_peak: (Math.random() * 2 + 1).toFixed(2) + 'G',
        frequency: '14.5Hz',
        location: 'Truncated (Level 3 GeoHash)',
      },
      status: 'Verified on OrbisChain',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria & Compliance</h1>
          <p className="text-muted-foreground">
            Portal de transparência legal para verificação de dados inerciais, LGPD e equidade
            social.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel h-[500px] flex flex-col">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="w-5 h-5 text-primary" />
              OrbisChain Explorer (V-Certs)
            </CardTitle>
            <CardDescription>
              Lista de transações geradoras de V-Certs. Clique em um hash para visualizar a prova
              inercial anonimizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="h-48 border-b border-border/50 bg-muted/10">
              <div className="p-4 space-y-2">
                {vCerts.map((cert) => (
                  <div
                    key={cert.hash}
                    onClick={() => handleSelectHash(cert.hash)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                      selectedProof?.hash === cert.hash
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-background hover:bg-muted/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold">{cert.hash}</p>
                        <p className="text-xs text-muted-foreground">{cert.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex-1 p-4 bg-muted/5 relative overflow-hidden">
              <FileJson className="absolute right-4 bottom-4 w-32 h-32 text-primary/5 -z-10" />
              {selectedProof ? (
                <div className="animate-fade-in space-y-3 h-full flex flex-col">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Prova Válida (Zero-Knowledge)
                  </h4>
                  <pre className="text-xs text-muted-foreground font-mono bg-background/80 p-4 rounded-lg border border-border/50 flex-1 overflow-auto shadow-inner">
                    {JSON.stringify(selectedProof, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm space-y-2">
                  <Hash className="w-8 h-8 opacity-20" />
                  <p>Selecione uma transação para visualizar os dados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 h-[500px] flex flex-col">
          <Card className="glass-panel bg-primary/5 border-primary/20 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                Painel de Compliance LGPD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black text-primary tracking-tighter">100%</span>
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  Taxa de Anonimização
                </span>
              </div>
              <Progress value={100} className="h-2 mb-3" />
              <div className="flex items-start gap-3 bg-background/50 p-3 rounded-lg border border-primary/10">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  100% dos dados de localização são truncados no Edge (dispositivo móvel) e
                  completamente anonimizados antes da transmissão para a infraestrutura cloud.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel flex-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Mapa de Equidade Social
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="cursor-help">
                      Info
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Assegura que a distribuição de benefícios (Onda Verde) e coleta de dados (Swarm
                    Nodes) ocorra sem viés socioeconômico.
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pr-2">
              <div className="space-y-5 mt-2">
                {equityData.map((zone) => (
                  <div key={zone.zone} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">{zone.zone}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" /> {zone.nodes}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Leaf className="w-3 h-3" /> {zone.greenWave}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                        style={{ width: `${zone.greenWave}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
