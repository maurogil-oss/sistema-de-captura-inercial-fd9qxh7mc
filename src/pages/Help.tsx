import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Wrench, Wifi, Battery, Cpu } from 'lucide-react'

export default function Help() {
  return (
    <div className="space-y-6 w-full mx-auto pb-10 max-w-5xl animate-in fade-in zoom-in duration-500">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ajuda & Documentação</h1>
        <p className="text-muted-foreground max-w-2xl">
          Guia de referência para interpretação de métricas e configurações do sistema. Utilize este
          sumário para entender como a telemetria é capturada e otimizada pelo Orbis SDK.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-primary" />
              Configuração Remota (Remote Config)
            </CardTitle>
            <CardDescription>Ajuste de parâmetros do SDK em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              O painel de configuração permite ajustar remotamente como os dispositivos coletam
              dados, equilibrando precisão analítica e consumo de bateria do smartphone.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Threshold G-Force
                </Badge>
                <p className="text-xs leading-relaxed">
                  Define a força inercial mínima necessária para registrar um impacto. Valores mais
                  baixos (ex: 1.0G) detectam pequenas irregularidades do asfalto, enquanto valores
                  altos (ex: 3.0G) filtram apenas buracos severos ou colisões.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Freq. Amostragem
                </Badge>
                <p className="text-xs leading-relaxed">
                  A taxa (em Hz) de leitura dos sensores. 50Hz significa 50 leituras por segundo.
                  Frequências maiores geram mais precisão a custo de bateria e processamento local.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:border-purple-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-purple-500" />
              Manutenção Preditiva (Wear Analysis)
            </CardTitle>
            <CardDescription>Como priorizamos reparos viários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              A análise de desgaste identifica segmentos viários críticos cruzando e processando
              dados coletados de múltiplos veículos simultaneamente.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 w-fit">
                  Priority Score
                </Badge>
                <p className="text-xs leading-relaxed">
                  Calculado multiplicando a <strong>Frequência</strong> (número de detecções ou
                  passagens) pela <strong>Severidade Média</strong> (Força G). Segmentos com Score
                  &gt; 10 são classificados automaticamente como Alta Prioridade.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Gerar O.S.
                </Badge>
                <p className="text-xs leading-relaxed">
                  Permite criar uma Ordem de Serviço acionável para as equipes de manutenção,
                  incluindo as coordenadas geoespaciais e o nível de urgência do segmento detectado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:border-blue-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="w-5 h-5 text-blue-500" />
              Simulação de Rede (Network Sandbox)
            </CardTitle>
            <CardDescription>Testes de resiliência e estabilidade offline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              Ferramenta exclusiva de desenvolvimento para estressar o comportamento do SDK durante
              a perda de conectividade com a infraestrutura cloud.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Offline Queue
                </Badge>
                <p className="text-xs leading-relaxed">
                  Quando a rede 3G/4G cai, os eventos críticos (impactos, frenagens bruscas) são
                  empacotados e armazenados numa fila local e criptografada no dispositivo do
                  motorista.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit">
                  Cloud Sync (Live)
                </Badge>
                <p className="text-xs leading-relaxed">
                  Ao recuperar o sinal, o SDK orquestra e descarrega a fila pendente sem perda de
                  integridade dos dados, mantendo a exata ordem cronológica original.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel hover:border-emerald-500/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Battery className="w-5 h-5 text-emerald-500" />
              Monitoramento de Bateria
            </CardTitle>
            <CardDescription>Eficiência energética da frota e smartphones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground pt-2">
            <p>
              O sistema inteiro foi arquitetado e otimizado para rodar em background nos smartphones
              dos motoristas sem drenar a bateria substancialmente.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 w-fit">
                  Alvo de 2% a 4% / h
                </Badge>
                <p className="text-xs leading-relaxed">
                  Este é o consumo base esperado do SDK em viagens longas. O alvo é alcançado por
                  meio de rigorosas otimizações de processamento em tempo real (Edge AI), ativando
                  as antenas de celular para o envio de dados apenas quando eventos fora do normal
                  ocorrem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel md:col-span-2 hover:border-orange-500/50 transition-colors">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="w-5 h-5 text-orange-500" />
              Edge Computing (Processamento Local)
            </CardTitle>
            <CardDescription>Inteligência e autonomia no dispositivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground pt-5">
            <p className="text-foreground/90 font-medium">
              Em vez de transmitir 100% da volumosa telemetria bruta (raw data) para a nuvem de
              forma ininterrupta, o Orbis SDK aplica algoritmos avançados de{' '}
              <strong>Edge Computing</strong> diretamente na memória do smartphone.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs">
                    1
                  </span>
                  Redução de Latência
                </h4>
                <p className="text-xs leading-relaxed">
                  O algoritmo identifica assinaturas inerciais de buracos, quebra-molas e eventos de
                  risco instantaneamente, agindo em milissegundos sem depender da nuvem.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs">
                    2
                  </span>
                  Eficiência de Filtragem
                </h4>
                <p className="text-xs leading-relaxed">
                  Descarta e filtra as leituras contínuas normais (ruído viário natural sem
                  impacto), economizando massivamente os pacotes de dados 3G/4G/5G.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs">
                    3
                  </span>
                  Privacidade por Design
                </h4>
                <p className="text-xs leading-relaxed">
                  A análise mais pesada ocorre de forma blindada no celular do motorista,
                  transmitindo aos servidores apenas a inferência anonimizada do impacto ou
                  infraestrutura viária.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
