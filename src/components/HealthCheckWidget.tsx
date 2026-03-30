import { useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, Settings2, Globe, Server, Activity } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { useHealth } from '@/stores/HealthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function HealthCheckWidget() {
  const { status, config, details, checkHealth, updateConfig } = useHealth()

  if (status === 'healthy' || status === 'idle') return null

  return (
    <Alert
      variant="destructive"
      className="mb-6 animate-fade-in-down border-destructive/50 bg-destructive/10"
    >
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold flex items-center gap-2">
        API Health check failed
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-4 mt-2">
        <p className="text-sm font-medium">{details?.message || 'failed to fetch'}</p>

        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-background/50 hover:bg-background/80"
              >
                <Activity className="w-4 h-4 mr-2" />
                View Technical Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-muted-foreground" />
                  Diagnostic Details
                </DialogTitle>
                <DialogDescription>Detailed API connection troubleshooting info.</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 text-sm">
                <Card className="bg-muted/30 border-muted">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="font-semibold text-muted-foreground flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Target URL
                      </span>
                      <span className="font-mono text-xs break-all bg-muted px-2 py-1 rounded max-w-[250px] sm:max-w-none text-right">
                        {details?.url}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/50 pb-2">
                      <span className="font-semibold text-muted-foreground">HTTP Method</span>
                      <Badge variant="outline" className="font-mono">
                        {details?.method}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-1">
                      <span className="font-semibold text-muted-foreground">Raw Status</span>
                      <Badge
                        variant={details?.rawStatus === 200 ? 'default' : 'destructive'}
                        className="font-mono"
                      >
                        {details?.rawStatus || 'N/A'} {details?.rawStatus === 200 ? 'OK' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <span className="font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Potential Failure Reasons
                  </span>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-xs">
                    {details?.errorType === 'Timeout Error' && (
                      <li>
                        <strong>Request Timeout:</strong> The server took longer than{' '}
                        {config.timeoutMs}ms to respond. Increase timeout or check network latency.
                      </li>
                    )}
                    {(details?.errorType === 'Network / CORS / TLS' ||
                      details?.message?.includes('fetch')) && (
                      <>
                        <li>
                          <strong>Possible CORS blockage:</strong> The backend might not be
                          accepting requests from this domain. Check pre-flight headers.
                        </li>
                        {details?.url.startsWith('https') && (
                          <li>
                            <strong>Potential TLS/SSL mismatch:</strong> Check the SSL/TLS
                            certificate chain. It might be invalid, expired, or self-signed.
                          </li>
                        )}
                        <li>
                          <strong>Network unreachable:</strong> Edge device offline, DNS failure, or
                          skipped backend is down.
                        </li>
                      </>
                    )}
                    {details?.rawStatus && details.rawStatus >= 500 && (
                      <li>
                        <strong>Server Error:</strong> The backend service is crashing or
                        unavailable (HTTP {details.rawStatus}).
                      </li>
                    )}
                    {details?.rawStatus === 404 && (
                      <li>
                        <strong>Endpoint Not Found:</strong> The path '{config.path}' doesn't exist
                        on the server. Try toggling between / and /api/health.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
                    <Settings2 className="w-4 h-4" /> Connection Configuration
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 col-span-2">
                      <Label>Backend Base URL</Label>
                      <Input
                        value={config.baseUrl}
                        onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="space-y-3 col-span-2 sm:col-span-1">
                      <Label>Health Check Path</Label>
                      <RadioGroup
                        value={config.path}
                        onValueChange={(val) => updateConfig({ path: val })}
                        className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md border border-border/50"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="/" id="r1" />
                          <Label htmlFor="r1" className="font-mono text-xs">
                            / (Base URL)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="/api/health" id="r2" />
                          <Label htmlFor="r2" className="font-mono text-xs">
                            /api/health
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2 col-span-2 sm:col-span-1 flex flex-col justify-end">
                      <Button
                        onClick={() => checkHealth()}
                        disabled={status === 'checking'}
                        className="w-full"
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
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </AlertDescription>
    </Alert>
  )
}
