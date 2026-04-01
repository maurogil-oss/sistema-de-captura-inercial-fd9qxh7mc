import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  TreePine,
  Hammer,
  Wind,
  Users,
  ArrowUpRight,
  Trophy,
  Star,
  Leaf,
  MapPin,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

const neighborhoodsRanking = [
  { name: 'Centro Histórico', co2: 24.5, points: 1250, position: 1 },
  { name: 'Vila Mariana', co2: 18.2, points: 980, position: 2 },
  { name: 'Pinheiros', co2: 15.7, points: 840, position: 3 },
  { name: 'Mooca', co2: 12.1, points: 620, position: 4 },
  { name: 'Santana', co2: 9.8, points: 450, position: 5 },
]

export default function Transparency() {
  return (
    <div className="space-y-8 animate-fade-in-up pb-12 w-full max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-primary/10 p-8 md:p-12 text-center">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-primary to-blue-500" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-background shadow-xl rounded-full flex items-center justify-center border-4 border-primary/20 mb-2">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Portal do Cidadão
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl px-4 font-medium">
            Veja o impacto real da nossa rede colaborativa. Seus dados de condução segura estão
            transformando a infraestrutura da cidade todos os dias.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-panel overflow-hidden relative group border-amber-500/20 hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Hammer className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-amber-500 tracking-tighter">5.420</h3>
              <p className="font-bold text-lg text-foreground">Buracos Tapados</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground cursor-help underline decoration-dotted underline-offset-4">
                  Identificados pela comunidade
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Detectados automaticamente via telemetria inercial dos smartphones (Swarm Nodes).
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative group border-emerald-500/20 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner">
              <TreePine className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-emerald-500 tracking-tighter">12.350</h3>
              <p className="font-bold text-lg text-foreground">Árvores Plantadas</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground cursor-help underline decoration-dotted underline-offset-4">
                  Financiadas por V-Certs
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Créditos gerados pela condução eficiente são revertidos em fundos verdes para a
                cidade.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative group border-blue-500/20 hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Wind className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-blue-500 tracking-tighter">
                84 <span className="text-2xl">Ton</span>
              </h3>
              <p className="font-bold text-lg text-foreground">Redução de CO2</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground cursor-help underline decoration-dotted underline-offset-4">
                  Redução em emissões
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Devido à otimização do fluxo de trânsito e redução de frenagens bruscas graças a
                vias reparadas.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-emerald-500/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Leaf className="w-6 h-6 text-emerald-500" />
                Ranking de Descarbonização por Bairro
              </CardTitle>
              <CardDescription>
                Acompanhe a redução de CO2 por região e veja quem está liderando a descarbonização.
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-help">
                  Entenda o Cálculo (IPCC)
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Utilizamos as diretrizes do Painel Intergovernamental sobre Mudanças Climáticas
                (IPCC) para converter telemetria (marcha lenta evitada, frenagens) em redução de
                emissões de GEE.
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {neighborhoodsRanking.map((neighborhood, idx) => (
              <div
                key={neighborhood.name}
                className="flex flex-col p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-colors relative overflow-hidden group"
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -z-10" />
                )}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                              ? 'bg-amber-700/60 text-white'
                              : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {neighborhood.position}
                    </span>
                    <span className="font-semibold text-sm">{neighborhood.name}</span>
                  </div>
                  {idx === 0 && <Trophy className="w-4 h-4 text-amber-500" />}
                </div>

                <div className="mt-auto space-y-1">
                  <div className="text-2xl font-black text-emerald-500 tracking-tighter">
                    -{neighborhood.co2}
                    <span className="text-sm font-medium text-muted-foreground ml-1">Ton</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {neighborhood.points} pts da comunidade
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-panel bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Comunidade Ativa</h3>
                  <p className="text-sm text-muted-foreground">O poder dos Swarm Nodes</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-foreground">42.8K</div>
                <div className="text-xs font-semibold text-emerald-500 flex items-center justify-end gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12% este mês
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Meta Anual de Engajamento</span>
                  <span className="font-bold">85%</span>
                </div>
                <Progress value={85} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Juntos, já mapeamos mais de 80% das vias arteriais da cidade de forma passiva,
                apenas dirigindo de forma consciente com o app rodando em background.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/30 shadow-lg shadow-primary/5">
          <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full items-center text-center space-y-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={`https://img.usecurling.com/ppl/thumbnail?gender=${
                      i % 2 === 0 ? 'female' : 'male'
                    }&seed=${i + 10}`}
                    alt="Cidadão"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-background bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs z-10">
                +42K
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Faça parte da mudança!</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Transforme sua condução diária em melhorias reais para o seu bairro. Baixe o app,
                dirija com cuidado e acumule pontos para a sua região.
              </p>
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-2 text-sm font-semibold text-foreground">4.9 na App Store</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
