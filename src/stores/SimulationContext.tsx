import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SimulationContextType {
  isSimulating: boolean
  toggleSimulation: () => void
  isSimulatedOffline: boolean
  toggleSimulatedOffline: () => void
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false)

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev)
  }

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev)
  }

  return (
    <SimulationContext.Provider
      value={{ isSimulating, toggleSimulation, isSimulatedOffline, toggleSimulatedOffline }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider')
  }
  return context
}
