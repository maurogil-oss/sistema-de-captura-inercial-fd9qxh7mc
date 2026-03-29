import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ShieldAlert, Activity, Server, Globe, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useHealth } from '@/stores/HealthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'

export default function Diagnostics() {
  const { status, config, details, checkHealth, updateConfig } = useHealth()

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnostics & Troubleshooting</h1>
        <p className="text-muted-foreground">
          Decision Tree and Cause x Impact Matrix for Telemetry Pipeline.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" /> API Health Diagnostics Panel
          </CardTitle>
          <CardDescription>
            Verify edge-to-cloud connectivity and debug networking issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Connection Configuration</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Backend Base URL</Label>
                    <Input
                      value={config.baseUrl}
                      onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-3 pt-2">
                    <Label>Health Check Path</Label>
                    <RadioGroup
                      value={config.path}
                      onValueChange={(val) => updateConfig({ path: val })}
                      className="flex gap-6 p-3 bg-muted/30 rounded-md border border-border/50"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="/health" id="diag-r1" />
                        <Label htmlFor="diag-r1" className="font-mono text-xs">
                          /health
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="/api/health" id="diag-r2" />
                        <Label htmlFor="diag-r2" className="font-mono text-xs">
                          /api/health
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <Button
                  onClick={() => checkHealth()}
                  disabled={status === 'checking'}
                  className="w-full sm:w-auto mt-2"
                >
                  {status === 'checking' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Last Check Details</h4>
              {status === 'idle' ? (
                <div className="text-muted-foreground text-sm flex items-center gap-2 h-20">
                  <Activity className="w-4 h-4" /> No health check executed yet.
                </div>
              ) : (
                <div className="space-y-4 text-sm bg-muted/20 p-4 rounded-lg border">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Target URL
                    </span>
                    <span className="font-mono text-xs break-all text-right max-w-[200px] sm:max-w-none">
                      {details?.url}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">HTTP Method</span>
                    <Badge variant="outline" className="font-mono">
                      {details?.method}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Status Code</span>
                    <Badge
                      variant={details?.rawStatus === 200 ? 'default' : 'destructive'}
                      className="font-mono"
                    >
                      {details?.rawStatus || 'N/A'} {details?.rawStatus === 200 ? 'OK' : ''}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground">Result Message</span>
                    <span
                      className={
                        details?.rawStatus === 200
                          ? 'text-emerald-500 font-medium'
                          : 'text-destructive font-medium'
                      }
                    >
                      {details?.message}
                    </span>
                  </div>

                  {status === 'unhealthy' && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs space-y-2">
                      <strong className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" /> Probable Causes:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        {details?.errorType === 'Timeout Error' && (
                          <li>Request Timeout: Server took &gt; {config.timeoutMs}ms.</li>
                        )}
                        {(details?.errorType === 'Network / CORS / TLS' ||
                          details?.message?.includes('fetch')) && (
                          <>
                            <li>Possible CORS blockage: Pre-flight failed.</li>
                            <li>Potential TLS/SSL mismatch: Certificate invalid or self-signed.</li>
                            <li>
                              Network unreachable: Your edge device has no internet route to
                              backend.
                            </li>
                          </>
                        )}
                        {details?.rawStatus === 404 && (
                          <li>Endpoint Not Found: '{config.path}' does not exist.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Cause x Impact Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4 bg-muted/20">
                <h3 className="font-semibold text-sm mb-2 text-destructive">Critical Impact</h3>
                <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                  <li>
                    <strong>Device Offline:</strong> Payloads are queued locally. Matrix: Check
                    WiFi/4G, check if Skip Cloud is reachable.
                  </li>
                  <li>
                    <strong>Sensor Permission Denied:</strong> No data collected. Matrix: Instruct
                    user to enable sensors in browser settings and reload.
                  </li>
                  <li>
                    <strong>NaN/Null Features:</strong> Data corrupted. Matrix: FFT algorithm
                    failure or sensor glitch. Check debug console.
                  </li>
                </ul>
              </div>
              <div className="border rounded-md p-4 bg-muted/20">
                <h3 className="font-semibold text-sm mb-2 text-amber-500">Medium Impact</h3>
                <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
                  <li>
                    <strong>High Latency (&gt; 500ms):</strong> Dashboard lags. Matrix: Monitor
                    network health, consider lowering sampling rate.
                  </li>
                  <li>
                    <strong>Low Sampling Rate (&lt; 30Hz):</strong> FFT resolution drops. Matrix:
                    Device is overloaded or CPU throttled. Close background apps.
                  </li>
                  <li>
                    <strong>High Timestamp Drift:</strong> Clock mismatch. Matrix: Device clock is
                    incorrect. Check ntp sync.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Decision Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Symptom: Dashboard not updating</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-4 space-y-2 text-muted-foreground text-sm">
                    <li>
                      Check "Pending Sync Count" in Debug Console. If &gt; 0, network is
                      disconnected. Action: <strong>Force Reconnect</strong>.
                    </li>
                    <li>
                      If Pending Sync is 0, check "Remote Data" in network tab. Is API reachable?
                      Action: <strong>Check Backend Health</strong>.
                    </li>
                    <li>Verify mobile device is capturing and "Sampling Rate" &gt; 0.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Symptom: Data jumps or glitches</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-4 space-y-2 text-muted-foreground text-sm">
                    <li>
                      Check Timestamp Drift in Debug Console. If &gt; 500ms, devices are out of
                      sync.
                    </li>
                    <li>Check FFT params. Ensure window size is 256 and overlap 128.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Symptom: Missing Sensor Data (MAG)</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-4 space-y-2 text-muted-foreground text-sm">
                    <li>Verify if the device hardware includes a magnetometer.</li>
                    <li>
                      Check if the browser requires explicit orientation permissions (iOS Safari).
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
