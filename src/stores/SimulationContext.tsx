import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SimulationContextType {
  isSimulating: boolean
  toggleSimulation: () => void
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isSimulating, setIsSimulating] = useState(false)

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev)
  }

  return (
    <SimulationContext.Provider value={{ isSimulating, toggleSimulation }}>
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
