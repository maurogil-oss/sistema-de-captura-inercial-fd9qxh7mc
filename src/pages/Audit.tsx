import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Search, FileJson, Lock, Users } from 'lucide-react'
import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function Audit() {
  const [hash, setHash] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [proof, setProof] = useState<any>(null)

  const handleSearch = () => {
    if (!hash) return
    setIsSearching(true)
    setTimeout(() => {
      setProof({
        hash: hash,
        timestamp: new Date().toISOString(),
        anonymizedDevice: 'OrbisNode-xxx-892',
        proofData: {
          gForceZ_peak: '2.4G',
          frequency: '14.5Hz',
          location: 'Truncated (Level 3 GeoHash)',
        },
        status: 'Verified on OrbisChain',
      })
      setIsSearching(false)
    }, 800)
  }

  const equityData = [
    { zone: 'Zona Sul', nodes: 450, coverage: 85 },
    { zone: 'Zona Norte', nodes: 380, coverage: 78 },
    { zone: 'Zona Leste', nodes: 520, coverage: 92 },
    { zone: 'Zona Oeste', nodes: 410, coverage: 82 },
    { zone: 'Centro', nodes: 600, coverage: 95 },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria & Compliance</h1>
          <p className="text-muted-foreground">
            Portal de transparência legal para verificação de dados inerciais e equidade.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              OrbisChain Audit Explorer
            </CardTitle>
            <CardDescription>
              Insira o hash do evento inercial para visualizar a prova matemática anonimizada.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="0x8f2a...c912"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="font-mono bg-background/50"
              />
              <Button onClick={handleSearch} disabled={isSearching || !hash}>
                {isSearching ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
            {proof && (
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 animate-fade-in relative overflow-hidden">
                <FileJson className="absolute right-4 top-4 w-24 h-24 text-primary/5 -z-10" />
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Prova Válida Encontrada
                </h4>
                <pre className="text-xs text-muted-foreground font-mono bg-background/50 p-3 rounded border border-border/50 overflow-x-auto">
                  {JSON.stringify(proof, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="w-4 h-4 text-primary" />
                Compliance Widget (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-bold text-primary">100%</span>
                <span className="text-xs text-muted-foreground mb-1">Taxa de Ofuscação</span>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                100% dos dados de localização são truncados no Edge e anonimizados antes da
                transmissão para a nuvem.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel">
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
                    Densidade de Swarm Nodes (usuários ativos) por zona para garantir coleta de
                    dados sem viés geográfico.
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                {equityData.map((zone) => (
                  <div key={zone.zone} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{zone.zone}</span>
                      <span className="font-mono text-muted-foreground">{zone.nodes} nodes</span>
                    </div>
                    <Progress value={zone.coverage} className="h-1.5" />
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
