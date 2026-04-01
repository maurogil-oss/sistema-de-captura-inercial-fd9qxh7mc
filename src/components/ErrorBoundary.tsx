import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ops! Algo deu errado.</h2>
          <p className="text-muted-foreground text-sm max-w-[400px] mb-6">
            Ocorreu um erro na renderização deste componente. A telemetria continua funcionando e
            sendo capturada em background.
          </p>
          {this.state.error && (
            <div className="p-3 bg-muted/50 rounded text-left text-xs font-mono overflow-auto max-w-[500px] w-full text-muted-foreground mb-6">
              {this.state.error.message}
            </div>
          )}
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Tentar Novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
