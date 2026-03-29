import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ShieldAlert, Activity } from 'lucide-react'

export default function Diagnostics() {
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnostics & Troubleshooting</h1>
        <p className="text-muted-foreground">
          Decision Tree and Cause x Impact Matrix for Telemetry Pipeline.
        </p>
      </div>

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
