import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import { SimulationProvider } from './stores/SimulationContext'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <SimulationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/fleet" element={<FleetAnalytics />} />
            <Route path="/city" element={<CityInfrastructure />} />
            <Route path="/trip/latest" element={<TripDetails />} />
            <Route path="/sdk" element={<OrbisSDK />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </SimulationProvider>
  </BrowserRouter>
)

export default App
