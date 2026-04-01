import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  FileJson,
  Lock,
  Users,
  Leaf,
  Hash,
  Globe,
  CheckCircle2,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Audit() {
  const [selectedProof, setSelectedProof] = useState<any>(null)
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [activeCert, setActiveCert] = useState<any>(null)

  const vCerts = [
    { hash: '0x8f2a...c912', timestamp: '2023-10-27T14:32:00Z', type: 'V-Cert Generation' },
    { hash: '0x3b1c...e445', timestamp: '2023-10-27T15:10:00Z', type: 'V-Cert Generation' },
    { hash: '0x7a99...112b', timestamp: '2023-10-27T16:05:00Z', type: 'V-Cert Generation' },
    { hash: '0x22df...88ca', timestamp: '2023-10-27T17:45:00Z', type: 'V-Cert Generation' },
  ]

  const carbonCerts = [
    { hash: '0xc112...99ab', timestamp: '2023-10-25T10:00:00Z', amount: 15, protocol: 'IPCC AR6' },
    { hash: '0x44fa...77dd', timestamp: '2023-09-28T14:20:00Z', amount: 22, protocol: 'IPCC AR6' },
    { hash: '0x99cc...1122', timestamp: '2023-08-30T09:15:00Z', amount: 18, protocol: 'IPCC AR6' },
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

  const handleViewIntegrity = (cert: any) => {
    setActiveCert({
      ...cert,
      mrvProof: {
        methodology: 'IPCC Guidelines for National Greenhouse Gas Inventories',
        emissionFactor: '0.25 kg CO2/km (Average ICE)',
        dataPointsVerified: Math.floor(Math.random() * 100000) + 50000,
        zeroKnowledgeProof:
          '0x' +
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        validatorNodes: 12,
      },
    })
    setCertModalOpen(true)
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

      <Tabs defaultValue="explorer" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="explorer">OrbisChain Explorer</TabsTrigger>
          <TabsTrigger value="carbon">RWA & Compliance Global</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel h-[500px] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="w-5 h-5 text-primary" />
                  V-Certs
                </CardTitle>
                <CardDescription>
                  Lista de transações geradoras de V-Certs. Clique em um hash para visualizar a
                  prova inercial anonimizada.
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
                        Assegura que a distribuição de benefícios (Onda Verde) e coleta de dados
                        (Swarm Nodes) ocorra sem viés socioeconômico.
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
        </TabsContent>

        <TabsContent value="carbon" className="mt-0">
          <div className="grid gap-6 md:grid-cols-12">
            <Card className="glass-panel md:col-span-8 flex flex-col h-[500px]">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Certificados de Carbono (RWA)
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Tokens validados via oráculos de telemetria baseados no{' '}
                  <a href="#" className="underline text-emerald-500">
                    IPCC
                  </a>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full bg-muted/5">
                  <div className="p-4 space-y-4">
                    {carbonCerts.map((cert) => (
                      <div
                        key={cert.hash}
                        className="p-4 rounded-lg border border-border/50 bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Leaf className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-semibold">{cert.hash}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                              >
                                {cert.amount} tCO2e
                              </Badge>
                              <span className="text-xs text-muted-foreground">{cert.protocol}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                          <span className="text-xs text-muted-foreground">
                            {new Date(cert.timestamp).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-2"
                              onClick={() => handleViewIntegrity(cert)}
                            >
                              <Search className="w-4 h-4" />
                              <span className="hidden sm:inline">Ver Integridade</span>
                              <span className="sm:hidden">Ver</span>
                            </Button>
                            <Button
                              size="sm"
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              asChild
                            >
                              <Link to="/certificate">
                                <ExternalLink className="w-4 h-4" />
                                <span className="hidden sm:inline">Relatório L5</span>
                                <span className="sm:hidden">L5</span>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="md:col-span-4 space-y-6">
              <Card className="glass-panel border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Global Goals Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Acordo de Paris (NDC)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <Progress value={100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground leading-tight">
                      Métricas MRV alinhadas às contribuições nacionalmente determinadas.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">SBCE (Mercado BR)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <Progress value={100} className="h-1.5" />
                    <p className="text-xs text-muted-foreground leading-tight">
                      Pronto para integração com o Sistema Brasileiro de Comércio de Emissões.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Diretrizes da ONU (ODS)</span>
                      <span className="text-xs font-semibold text-amber-500">Em auditoria</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-amber-500/20" />
                    <p className="text-xs text-muted-foreground leading-tight">
                      Processo de verificação de terceira parte em andamento para os Objetivos de
                      Desenvolvimento Sustentável.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Integridade do Ativo (MRV Proof)
            </DialogTitle>
            <DialogDescription>
              Prova criptográfica da redução de emissões associada ao certificado.
            </DialogDescription>
          </DialogHeader>
          {activeCert && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-md border border-border/50">
                <span className="text-sm font-medium">Hash na OrbisChain</span>
                <span className="text-xs font-mono text-muted-foreground">{activeCert.hash}</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Cálculo MRV (IPCC)</h4>
                <div className="bg-background/80 p-3 rounded-lg border border-border/50 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metodologia:</span>
                    <span className="text-right max-w-[200px]">
                      {activeCert.mrvProof.methodology}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fator de Emissão:</span>
                    <span>{activeCert.mrvProof.emissionFactor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pontos Verificados:</span>
                    <span>{activeCert.mrvProof.dataPointsVerified.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Validadores:</span>
                    <span>{activeCert.mrvProof.validatorNodes} Nodos</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Zero-Knowledge Proof</h4>
                <div className="bg-muted/50 p-2 rounded-md border border-border/50 overflow-hidden">
                  <p className="text-[10px] font-mono break-all text-muted-foreground">
                    {activeCert.mrvProof.zeroKnowledgeProof}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
