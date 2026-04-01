import { useState } from 'react'
import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ActivitySquare,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const trafficFluidityData = [
  { location: 'Av. Paulista', beforeSpeed: 22, afterSpeed: 35 },
  { location: 'Rua Augusta', beforeSpeed: 15, afterSpeed: 25 },
  { location: 'Radial Leste', beforeSpeed: 35, afterSpeed: 48 },
]

export default function CityInfrastructure() {
  const [statusFilter, setStatusFilter] = useState('all')

  const [serviceOrders, setServiceOrders] = useState([
    {
      id: 'OS-1024',
      title: 'Recapeamento Setor A',
      status: 'open',
      priority: 'high',
      location: 'Av. Paulista',
      severity: '3.2G',
    },
    {
      id: 'OS-1025',
      title: 'Tapa-buraco Setor B',
      status: 'in-progress',
      priority: 'medium',
      location: 'Rua Augusta',
      severity: '2.5G',
    },
    {
      id: 'OS-1026',
      title: 'Manutenção Preditiva',
      status: 'resolved',
      priority: 'low',
      location: 'Radial Leste',
      severity: '1.8G',
    },
    {
      id: 'OS-1027',
      title: 'Correção de Desnível',
      status: 'open',
      priority: 'medium',
      location: 'Av. Brasil',
      severity: '2.9G',
    },
  ])

  const kanbanColumns = [
    { id: 'open', title: 'Aberto', icon: AlertTriangle, color: 'text-amber-500' },
    { id: 'in-progress', title: 'Em Manutenção', icon: Clock, color: 'text-blue-500' },
    { id: 'resolved', title: 'Resolvido', icon: CheckCircle2, color: 'text-emerald-500' },
  ]

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('card_id', id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('card_id')
    setServiceOrders((prev) => prev.map((so) => (so.id === id ? { ...so, status } : so)))
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zeladoria (Infraestrutura)</h1>
          <p className="text-muted-foreground">
            Gestão Acionável de Ordens de Serviço (OS) baseada em Telemetria.
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 py-1.5 px-3 flex items-center gap-2 w-fit"
        >
          <RefreshCw className="w-4 h-4 animate-spin-slow" />
          Integration Status: Synced
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-12 space-y-6">
          <Card className="glass-panel overflow-hidden h-[400px] flex flex-col relative">
            <CardHeader className="pb-2 border-b border-border/50 z-10 bg-card/70 backdrop-blur absolute w-full top-0">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mapeamento de Zeladoria</CardTitle>
                  <CardDescription>
                    Visualização geográfica de anomalias e status de manutenção
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Filtrar por Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="open">Abertas</SelectItem>
                      <SelectItem value="in-progress">Em Manutenção</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="bg-background shadow-sm h-9">
                    <MapIcon className="w-4 h-4 mr-2" />
                    Live View
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative h-full mt-16">
              <MapMock mode="potholes" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {kanbanColumns.map((col) => (
          <Card
            key={col.id}
            className="glass-panel flex flex-col h-[400px] border-dashed border-2 transition-colors hover:border-border/80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <col.icon className={`w-5 h-5 ${col.color}`} />
                {col.title}
                <Badge variant="secondary" className="ml-auto">
                  {serviceOrders.filter((so) => so.status === col.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-y-auto bg-muted/10 space-y-3">
              {serviceOrders
                .filter((so) => so.status === col.id)
                .map((so) => (
                  <div
                    key={so.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, so.id)}
                    className="bg-card border border-border/50 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm">{so.id}</span>
                      <Badge
                        variant={so.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {so.priority}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium mb-3">{so.title}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapIcon className="w-3 h-3" /> {so.location}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <ActivitySquare className="w-3 h-3" /> {so.severity}
                      </span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Impacto na Fluidez do Trânsito
              </CardTitle>
              <CardDescription>
                Comparativo de Velocidade Média (km/h) Antes e Depois das Intervenções
              </CardDescription>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <AlertTriangle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Métrica de fluidez baseada em dados inerciais coletados pelos Swarm Nodes.
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ChartContainer
              config={{
                beforeSpeed: { color: 'hsl(var(--destructive))', label: 'Antes (km/h)' },
                afterSpeed: { color: 'hsl(var(--primary))', label: 'Depois (km/h)' },
              }}
            >
              <BarChart
                data={trafficFluidityData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="location"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="beforeSpeed"
                  fill="var(--color-beforeSpeed)"
                  radius={[4, 4, 0, 0]}
                  name="Antes da Manutenção"
                />
                <Bar
                  dataKey="afterSpeed"
                  fill="var(--color-afterSpeed)"
                  radius={[4, 4, 0, 0]}
                  name="Depois da Manutenção"
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
