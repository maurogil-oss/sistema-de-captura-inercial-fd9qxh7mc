import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Wrench, ShieldCheck, Lock, Users, Briefcase } from 'lucide-react'

export default function Help() {
  return (
    <div className="space-y-6 w-full mx-auto pb-10 max-w-5xl animate-in fade-in zoom-in duration-500">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ajuda & Documentação Expandida</h1>
        <p className="text-muted-foreground max-w-2xl">
          Guia de referência atualizado abrangendo métricas de calibração, gestão operacional (OS),
          auditoria legal e impacto social.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestão de OS */}
        <Card className="glass-panel hover:border-blue-500/50 transition-colors md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Gestão de Ordens de Serviço (Kanban)
            </CardTitle>
            <CardDescription>Fluxo de trabalho para Zeladoria e Infraestrutura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-4">
            <p className="text-foreground/90 font-medium">
              O módulo de Zeladoria utiliza um sistema Kanban para transformar anomalias detectadas
              automaticamente em ações corretivas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground">Aberto (Open)</h4>
                <p className="text-xs leading-relaxed">
                  Anomalias confirmadas por múltiplos Swarm Nodes que atingiram o limite de
                  severidade (Priority Score). Agurdam triagem da equipe técnica.
                </p>
              </div>
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground">Em Manutenção</h4>
                <p className="text-xs leading-relaxed">
                  Ordens despachadas para as equipes de campo. O status é sincronizado em tempo-real
                  com os aplicativos móveis dos operadores.
                </p>
              </div>
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground">Resolvido</h4>
                <p className="text-xs leading-relaxed">
                  Reparo concluído. O sistema continuará monitorando a área passivamente para
                  garantir a qualidade do serviço (Falta de novos impactos valida o reparo).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparência Blockchain */}
        <Card className="glass-panel hover:border-emerald-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Transparência Blockchain (OrbisChain)
            </CardTitle>
            <CardDescription>Auditoria legal via DLT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              O OrbisChain Explorer permite que órgãos controladores (ex: MP, TCE) verifiquem a
              autenticidade dos V-Certs gerados sem acessar dados sensíveis.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 w-fit">
                  Prova de Conhecimento Zero (ZKP)
                </Badge>
                <p className="text-xs leading-relaxed">
                  Os hashes armazenados provam matematicamente que um evento inercial ocorreu numa
                  determinada região e horário, garantindo a imutabilidade do registro sem expor a
                  identidade do motorista.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacidade por Design */}
        <Card className="glass-panel hover:border-purple-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-purple-500" />
              Privacidade por Design (LGPD)
            </CardTitle>
            <CardDescription>Conformidade e Proteção de Dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              A plataforma monitora a conformidade LGPD em tempo real através do Painel de
              Compliance.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Truncamento no Edge
                </Badge>
                <p className="text-xs leading-relaxed">
                  O Orbis SDK processa dados brutos diretamente no smartphone. Apenas metadados
                  anonimizados (como força do impacto e geohash aproximado) são enviados para a
                  nuvem, garantindo uma taxa de anonimização de 100%.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impacto Social */}
        <Card className="glass-panel hover:border-amber-500/50 transition-colors md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-amber-500" />
              Impacto Social & Portal do Cidadão
            </CardTitle>
            <CardDescription>Engajamento e Equidade Urbana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Mapa de Equidade Social
                </h4>
                <p className="text-xs leading-relaxed">
                  Visível na seção de Auditoria, o mapa de equidade cruza a densidade de usuários
                  (Swarm Nodes) com dados socioeconômicos. O objetivo é assegurar que áreas de menor
                  renda recebam distribuição justa dos benefícios da "Onda Verde" e de reparos de
                  zeladoria, evitando viés algorítmico na priorização de O.S.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  Portal do Cidadão (Gamificação)
                </h4>
                <p className="text-xs leading-relaxed">
                  Uma interface pública projetada para mostrar à população o valor prático dos dados
                  coletados. Exibe KPIs tangíveis de alto impacto social, como a quantidade de
                  buracos tapados preventivamente, toneladas de CO2 economizadas e árvores plantadas
                  com fundos dos V-Certs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legacy Configs */}
        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Configuração Remota (SDK)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p className="text-xs leading-relaxed">
              Ajuste de parâmetros do SDK em tempo real, como o <strong>
                Threshold G-Force
              </strong>{' '}
              para definir a sensibilidade a impactos e a <strong>Freq. Amostragem</strong> para
              balancear precisão e consumo de bateria (Alvo de 2% a 4% / h).
            </p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              Manutenção Preditiva (Wear Analysis)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p className="text-xs leading-relaxed">
              O <strong>Priority Score</strong> de um segmento viário é calculado multiplicando a
              Frequência de detecções pela Severidade Média. Scores &gt; 10 geram cards
              automaticamente no Kanban de Zeladoria.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
