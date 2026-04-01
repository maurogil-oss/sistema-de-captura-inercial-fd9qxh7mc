import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import FleetAnalytics from './pages/FleetAnalytics'
import CityInfrastructure from './pages/CityInfrastructure'
import Treasury from './pages/Treasury'
import Audit from './pages/Audit'
import Transparency from './pages/Transparency'
import TripDetails from './pages/TripDetails'
import OrbisSDK from './pages/OrbisSDK'
import NotFound from './pages/NotFound'
import Diagnostics from './pages/Diagnostics'
import Settings from './pages/Settings'
import Help from './pages/Help'
import { useEffect } from 'react'
import { SimulationProvider } from './stores/SimulationContext'
import { DebugProvider } from './stores/DebugContext'
import { HealthProvider } from './stores/HealthContext'
import { useAnomalyStore } from './stores/useAnomalyStore'
import { useDeviceStore } from './stores/useDeviceStore'

const GlobalSyncInit = () => {
  useEffect(() => {
    useAnomalyStore.getState().initializeGlobalSync()
    useDeviceStore.getState().initializeDeviceSync()
  }, [])
  return null
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <SimulationProvider>
      <DebugProvider>
        <HealthProvider>
          <TooltipProvider>
            <GlobalSyncInit />
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/fleet" element={<FleetAnalytics />} />
                <Route path="/city" element={<CityInfrastructure />} />
                <Route path="/treasury" element={<Treasury />} />
                <Route path="/audit" element={<Audit />} />
                <Route path="/portal-cidadao" element={<Transparency />} />

                {/* Support unique session IDs for real-time Skip Cloud sync */}
                <Route path="/trip/:sessionId" element={<TripDetails />} />
                <Route
                  path="/trip/latest"
                  element={<Navigate to="/trip/latest-session" replace />}
                />

                <Route path="/sdk" element={<OrbisSDK />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </HealthProvider>
      </DebugProvider>
    </SimulationProvider>
  </BrowserRouter>
)

export default App
