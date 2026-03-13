import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Activity, Cpu, Key, Layers, Server, Shield, Smartphone, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const LAYER_DATA = [
  {
    title: 'Layer 0: Raw Data',
    desc: 'Ephemeral buffer stored locally on the device. Contains high-frequency 60Hz (60 samples per second) streams: accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, and gps. Cleared after processing unless an event triggers a clip saving.',
    badge: 'Local Buffer',
    theme: 'primary',
  },
  {
    title: 'Layer 1: Telemetric Events',
    desc: 'JSON packets sent to the cloud. Contains event classifications (Hard Brake, Rapid Accel, Hard Cornering, Pothole Impact, Phone Usage), base severity (1-10), location, and speed. Includes the 5s data clip.',
    badge: 'Cloud Ingestion',
    theme: 'blue',
  },
  {
    title: 'Layer 2: Trip Context',
    desc: 'Events aggregated into continuous trips. Includes Trip ID, Driver ID, Distance, Duration, Idle Time, Weather Condition. Enriched with Environmental Context Auditor which adjusts event severity.',
    badge: 'Data Enrichment',
    theme: 'amber',
  },
  {
    title: 'Layer 3: Business Intelligence',
    desc: 'Final computed metrics for dashboards. Includes Driver Zen Score, Carbon Footprint, Wear & Tear Index, and Pavement Health Index (PHI).',
    badge: 'Analytics View',
    theme: 'purple',
  },
]

export default function OrbisSDK() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production Fleet Alpha',
      key: 'orb_live_****************8f92',
      devices: 142,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Testing Sandbox',
      key: 'orb_test_****************3a1b',
      devices: 5,
      status: 'Active',
    },
  ])

  const generateApiKey = () => {
    setApiKeys([
      ...apiKeys,
      {
        id: Date.now().toString(),
        name: 'New Integration Key',
        key: `orb_live_****************${Math.floor(Math.random() * 9000 + 1000)}`,
        devices: 0,
        status: 'Active',
      },
    ])
    toast({ title: 'API Key Generated', description: 'New Orbis SDK key created successfully.' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orbis Inertial SDK</h1>
        <p className="text-muted-foreground">Centralized Data Ingestion & Edge AI Management.</p>
      </div>

      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="edge">Edge AI Processing</TabsTrigger>
          <TabsTrigger value="catalog">Data Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" /> Data Ingestion Endpoint
                </CardTitle>
                <CardDescription>Secure backend interface for telemetry packets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value="https://ingest.orbis-sdk.com/v1/telemetry"
                      className="font-mono text-sm bg-muted/50"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toast({ description: 'Copied to clipboard' })}
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex items-start gap-3">
                  <Shield className="w-8 h-8 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-sm">Traffic Optimization Active</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Achieving <strong>99.4% data reduction</strong> by transmitting only event
                      clips (2s before / 3s after trigger) instead of raw 60Hz (60 samples per
                      second) streams.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Authenticate SDK instances</CardDescription>
                </div>
                <Button onClick={generateApiKey} size="sm" className="gap-2">
                  <Key className="w-4 h-4" /> Generate
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead>Name</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead className="text-right">Devices</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id} className="border-border/50">
                        <TableCell className="font-medium text-xs">{k.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {k.key}
                        </TableCell>
                        <TableCell className="text-right">{k.devices}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edge" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Capture',
                value: '60Hz',
                desc: '60 samples/sec',
                icon: Activity,
                color: 'text-blue-500',
              },
              {
                title: 'Sensor Fusion',
                value: 'Auto-Calib',
                desc: 'Kalman Filter',
                icon: Smartphone,
                color: 'text-purple-500',
              },
              {
                title: 'Jerk (da/dt)',
                value: 'Triggers',
                desc: 'Hard Brake/Accel',
                icon: Zap,
                color: 'text-amber-500',
              },
              {
                title: 'FFT Analysis',
                value: 'Anomalies',
                desc: 'Pothole detection',
                icon: Cpu,
                color: 'text-destructive',
              },
            ].map((stat, i) => (
              <Card key={i} className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <stat.icon className={cn('w-4 h-4', stat.color)} /> {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Mathematical Edge Calculations</CardTitle>
              <CardDescription>Algorithms running locally on Sovereign Kernel L0</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">High-Pass Filter (Gravity Removal)</h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    |a| = √(x² + y² + z²) - 1g
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Isolates pure linear acceleration by removing the constant force of gravity.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">
                    Jerk Calculation (Sudden Braking/Acceleration)
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    da/dt = (a₂ - a₁) / Δt
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Measures the rate of change of acceleration to detect hard braking and rapid
                    acceleration.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">Centrifugal Force (Lateral G-Force)</h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    F_c = m * v² / r
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calculates lateral force during turns to identify aggressive cornering events.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <h4 className="font-semibold mb-2">
                    Fast Fourier Transform (FFT) for Pothole Detection
                  </h4>
                  <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded mb-2 border border-border/50">
                    X(k) = Σ x(n) e^(-i2πkn/N)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fast Fourier Transform applied to z-axis to detect pavement anomalies and
                    potholes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> Multi-Layer Data Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-primary/20 ml-3 md:ml-6 space-y-8 pb-4">
                {LAYER_DATA.map((layer, i) => (
                  <div key={i} className="relative pl-6 md:pl-8">
                    <span
                      className={cn(
                        'absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-background border-2 flex items-center justify-center',
                        layer.theme === 'primary' && 'border-primary',
                        layer.theme === 'blue' && 'border-blue-500',
                        layer.theme === 'amber' && 'border-amber-500',
                        layer.theme === 'purple' && 'border-purple-500',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          layer.theme === 'primary' && 'bg-primary',
                          layer.theme === 'blue' && 'bg-blue-500',
                          layer.theme === 'amber' && 'bg-amber-500',
                          layer.theme === 'purple' && 'bg-purple-500',
                        )}
                      />
                    </span>
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{layer.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{layer.desc}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-fit bg-background font-mono text-xs',
                          layer.theme === 'blue' && 'text-blue-500 border-blue-500/30',
                          layer.theme === 'amber' && 'text-amber-500 border-amber-500/30',
                          layer.theme === 'purple' && 'text-purple-500 border-purple-500/30',
                        )}
                      >
                        {layer.badge}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
