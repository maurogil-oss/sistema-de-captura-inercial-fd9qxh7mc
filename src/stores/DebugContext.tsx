import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type LogLevel = 'info' | 'warning' | 'error'
export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  message: string
  source: string
}

interface DebugContextType {
  logs: LogEntry[]
  addLog: (level: LogLevel, message: string, source: string) => void
  clearLogs: () => void
}

const DebugContext = createContext<DebugContextType | undefined>(undefined)

export function DebugProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((level: LogLevel, message: string, source: string) => {
    setLogs((prev) => {
      const newLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        level,
        message,
        source,
      }
      return [newLog, ...prev].slice(0, 100) // Keep last 100 logs
    })
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return (
    <DebugContext.Provider value={{ logs, addLog, clearLogs }}>{children}</DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)
  if (!context) throw new Error('useDebug must be used within a DebugProvider')
  return context
}
