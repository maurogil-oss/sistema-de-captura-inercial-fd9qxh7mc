import { Activity, Car, Leaf, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/ui-custom/StatCard'
import { ZenGauge } from '@/components/ui-custom/ZenGauge'
import { MapMock } from '@/components/ui-custom/MapMock'
import { EventBadge } from '@/components/ui-custom/EventBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockKPIs, mockRecentEvents } from '@/data/mockData'

export default function Index() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground">Real-time telemetry and fleet intelligence.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Distance"
          value={`${mockKPIs.totalDistance} km`}
          icon={Activity}
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="Carbon Footprint"
          value={`${mockKPIs.carbonFootprint} tCO2`}
          icon={Leaf}
          trend="down"
          trendValue="5%"
        />
        <StatCard
          title="Active Vehicles"
          value={mockKPIs.activeVehicles}
          icon={Car}
          description="out of 50 total"
        />
        <StatCard
          title="Critical Events"
          value={mockKPIs.criticalEvents}
          icon={AlertTriangle}
          description="Last 24h"
          className="border-destructive/30 bg-destructive/5"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 flex flex-col glass-panel">
          <CardHeader>
            <CardTitle>Global Zen Score</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
            <ZenGauge score={mockKPIs.zenScore} className="w-48 max-w-full" />
            <p className="text-sm text-muted-foreground text-center mt-6">
              Fleet driving behavior is <strong className="text-primary">excellent</strong>. Keep
              monitoring harsh braking events.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 glass-panel overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between z-10 pb-2">
            <CardTitle>Live Telemetry Map</CardTitle>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">LIVE L1 FEED</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-[300px]">
            <MapMock />
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Recent Severe Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <EventBadge type={event.type} severity={event.severity as any} />
                  <div>
                    <p className="text-sm font-medium">{event.driver}</p>
                    <p className="text-xs text-muted-foreground font-mono">{event.location}</p>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground">{event.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
