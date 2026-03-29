import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import FleetAnalytics from './pages/FleetAnalytics'
import CityInfrastructure from './pages/CityInfrastructure'
import TripDetails from './pages/TripDetails'
import OrbisSDK from './pages/OrbisSDK'
import NotFound from './pages/NotFound'
import Diagnostics from './pages/Diagnostics'
import { SimulationProvider } from './stores/SimulationContext'
import { DebugProvider } from './stores/DebugContext'
import { HealthProvider } from './stores/HealthContext'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <SimulationProvider>
      <DebugProvider>
        <HealthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/fleet" element={<FleetAnalytics />} />
                <Route path="/city" element={<CityInfrastructure />} />

                {/* Support unique session IDs for real-time Skip Cloud sync */}
                <Route path="/trip/:sessionId" element={<TripDetails />} />
                <Route
                  path="/trip/latest"
                  element={<Navigate to="/trip/latest-session" replace />}
                />

                <Route path="/sdk" element={<OrbisSDK />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
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
