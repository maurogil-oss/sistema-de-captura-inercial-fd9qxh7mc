import { useState } from 'react'
import { useDebug } from '@/stores/DebugContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Terminal, Activity, Wifi, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DebugConsoleProps {
  latency: number
  drift: number
  samplingRate: number
  sensorStatus: { accel: boolean; gyro: boolean; mag: boolean }
  pendingSyncCount: number
  forceReconnect: () => void
}

export function DebugConsole({
  latency,
  drift,
  samplingRate,
  sensorStatus,
  pendingSyncCount,
  forceReconnect,
}: DebugConsoleProps) {
  const { logs, clearLogs } = useDebug()
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg bg-background/80 backdrop-blur-md gap-2"
      >
        <Terminal className="w-4 h-4" />
        <span>Open Debug Console</span>
        {pendingSyncCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
            {pendingSyncCount}
          </span>
        )}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[450px] max-w-[calc(100vw-2rem)] shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Terminal className="w-4 h-4" /> Debug Console
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[400px]">
        {/* Status Bar */}
        <div className="grid grid-cols-2 gap-px bg-border text-[10px] uppercase font-mono">
          <div className="p-2 flex flex-col justify-between bg-muted/50">
            <span className="text-muted-foreground flex items-center gap-1 font-semibold">
              <Wifi className="w-3 h-3" /> Network
            </span>
            <div className="mt-1 flex justify-between items-center">
              <span>Ping: {latency >= 0 ? `${latency}ms` : 'Err'}</span>
              <span className={cn(drift > 500 && 'text-amber-500 font-bold')}>
                Drift: {drift}ms
              </span>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span className={cn(pendingSyncCount > 0 && 'text-amber-500 font-bold')}>
                Queue: {pendingSyncCount}
              </span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-[10px] text-primary h-4"
                onClick={forceReconnect}
              >
                Reconnect
              </Button>
            </div>
          </div>
          <div className="p-2 flex flex-col justify-between bg-muted/50">
            <span className="text-muted-foreground flex items-center gap-1 font-semibold">
              <Activity className="w-3 h-3" /> Sensors
            </span>
            <div className="mt-1 flex justify-between items-center">
              <span>
                Rate:{' '}
                <span
                  className={cn(
                    samplingRate < 30 ? 'text-amber-500 font-bold' : 'text-emerald-500',
                  )}
                >
                  {samplingRate} Hz
                </span>
              </span>
              <span>FFT: 256/128</span>
            </div>
            <div className="mt-1 flex gap-2 font-bold">
              <span
                className={
                  sensorStatus.accel ? 'text-emerald-500' : 'text-muted-foreground opacity-50'
                }
              >
                ACC
              </span>
              <span
                className={
                  sensorStatus.gyro ? 'text-emerald-500' : 'text-muted-foreground opacity-50'
                }
              >
                GYR
              </span>
              <span
                className={
                  sensorStatus.mag ? 'text-emerald-500' : 'text-muted-foreground opacity-50'
                }
              >
                MAG
              </span>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 bg-[#0a0a0a] text-green-400 font-mono text-[11px] p-2 overflow-hidden relative">
          <ScrollArea className="h-full">
            <div className="pr-4 pb-2">
              {logs.length === 0 && <span className="opacity-50 italic">Waiting for logs...</span>}
              {logs.map((log) => (
                <div key={log.id} className="mb-1.5 flex gap-2 items-start leading-tight">
                  <span className="opacity-50 shrink-0 select-none">
                    [{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]
                  </span>
                  <span
                    className={cn(
                      'shrink-0 select-none',
                      log.level === 'info' && 'text-blue-400',
                      log.level === 'warning' && 'text-yellow-400',
                      log.level === 'error' && 'text-red-400',
                    )}
                  >
                    [{log.source}]
                  </span>
                  <span
                    className={cn(
                      log.level === 'error' && 'text-red-400 font-semibold',
                      log.level === 'warning' && 'text-yellow-400 font-semibold',
                    )}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            className="absolute top-1 right-2 h-5 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
