import { MapMock } from '@/components/ui-custom/MapMock'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Target } from 'lucide-react'

export default function CityInfrastructure() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">City Infrastructure</h1>
        <p className="text-muted-foreground">B2G Dashboard: Pavement Health & Safety Audits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel overflow-hidden h-[500px] flex flex-col">
            <CardHeader className="pb-2 border-b border-border/50 z-10 bg-card/50 backdrop-blur absolute w-full">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Zeladoria 360: Pavement Health Index</CardTitle>
                  <CardDescription>Pothole impacts mapped via inertial FFT</CardDescription>
                </div>
                <Badge variant="outline" className="bg-background">
                  Risk Mode
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <MapMock mode="potholes" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Critical Zones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { zone: 'Sector 4A', reason: 'High Pothole Density', phi: 32 },
                { zone: 'Main Intersect', reason: 'Near-Miss Cluster', phi: 85 },
              ].map((z) => (
                <div key={z.zone} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">{z.zone}</span>
                    <Badge variant={z.phi < 50 ? 'destructive' : 'secondary'} className="font-mono">
                      PHI {z.phi}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{z.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Speed Audit
              </CardTitle>
              <CardDescription>School Zones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Regulated Avg</span>
                  <span className="font-mono">40 km/h</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>Real L0 Avg</span>
                  <span className="font-mono">52 km/h</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-destructive w-[75%]" />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  12km/h delta detected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
