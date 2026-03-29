import { Bell, Search, Play, Square, Stethoscope } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSimulation } from '@/stores/SimulationContext'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const { isSimulating, toggleSimulation } = useSimulation()

  return (
    <header className="sticky top-0 z-40 w-full flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6">
      <SidebarTrigger className="-ml-2" />

      <div className="flex-1">
        <form className="hidden md:flex relative w-full max-w-sm items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar motorista, veículo ou trip_id..."
            className="w-full bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant={isSimulating ? 'destructive' : 'outline'}
          size="sm"
          onClick={toggleSimulation}
          className="font-mono text-xs hidden sm:flex"
        >
          {isSimulating ? <Square className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
          {isSimulating ? 'PARAR FLUXO L0' : 'SIMULAR FLUXO L0'}
        </Button>

        <Button variant="ghost" size="icon" asChild title="Diagnostics">
          <Link to="/diagnostics">
            <Stethoscope className="h-5 w-5" />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        </Button>

        <div className="flex items-center gap-2 border-l pl-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium leading-none">Usuário Admin</p>
            <p className="text-xs text-muted-foreground">Gestor de Frota</p>
          </div>
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?seed=1" alt="Usuário" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
