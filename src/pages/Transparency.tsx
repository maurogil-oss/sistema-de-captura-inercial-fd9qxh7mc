import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, TreePine, Hammer, ThumbsUp, Users, MapPin, CheckCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export default function Transparency() {
  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col items-center text-center space-y-4 py-8 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl border border-primary/10">
        <Users className="w-16 h-16 text-primary p-4 bg-primary/10 rounded-full" />
        <h1 className="text-4xl font-extrabold tracking-tight">Portal do Cidadão</h1>
        <p className="text-lg text-muted-foreground max-w-2xl px-4">
          Veja os resultados reais do engajamento cidadão na melhoria da nossa cidade. Cada buraco
          mapeado é um passo para ruas mais seguras.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Hammer className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-3xl font-bold text-amber-500">500+</h3>
            <p className="font-medium">Buracos Tapados</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                  Graças ao mapeamento inercial da comunidade.
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Os sensores dos smartphones detectaram automaticamente as irregularidades,
                priorizando as ordens de serviço.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <TreePine className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-bold text-emerald-500">1.250</h3>
            <p className="font-medium">Árvores Plantadas</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                  Financiadas pelos V-Certs gerados.
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Créditos gerados pela condução eficiente são revertidos em fundos verdes para a
                cidade.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-3xl font-bold text-rose-500">-12%</h3>
            <p className="font-medium">Acidentes Viários</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                  Redução nos últimos 6 meses.
                </p>
              </TooltipTrigger>
              <TooltipContent>
                A manutenção preventiva reduziu as manobras evasivas perigosas.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="glass-panel overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-blue-500">8.4k</h3>
            <p className="font-medium">Cidadãos Ativos</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                  Nós da rede (Swarm Nodes) mapeando a cidade.
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Total de usuários contribuindo passivamente para a base de dados via UOS.
              </TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-primary" />
            Últimas Conquistas do Bairro
          </CardTitle>
          <CardDescription>Veja o que a comunidade alcançou nas últimas semanas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                title: 'Recapeamento Av. Paulista',
                status: 'Concluído',
                progress: 100,
                date: 'Ontem',
                icon: CheckCircle,
                color: 'text-emerald-500',
              },
              {
                title: 'Iluminação Inteligente na Praça da Sé',
                status: 'Em Andamento',
                progress: 65,
                date: 'Em andamento',
                icon: Hammer,
                color: 'text-amber-500',
              },
              {
                title: 'Sinalização Escolar Zona Sul',
                status: 'Concluído',
                progress: 100,
                date: 'Há 3 dias',
                icon: CheckCircle,
                color: 'text-emerald-500',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/50"
              >
                <div
                  className={`p-2 rounded-full bg-background border border-border/50 ${item.color}`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <Badge
                      variant={item.progress === 100 ? 'default' : 'secondary'}
                      className={
                        item.progress === 100
                          ? 'bg-emerald-500 hover:bg-emerald-600 border-none'
                          : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
