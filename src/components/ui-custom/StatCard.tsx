import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  tooltip?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  className,
  tooltip,
}: StatCardProps) {
  return (
    <Card className={cn('glass-panel overflow-hidden relative group', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-sm font-medium text-muted-foreground cursor-help underline decoration-dotted underline-offset-4">
                {title}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px] text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        )}
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono tracking-tight">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trendValue && (
              <span
                className={cn(
                  'font-medium',
                  trend === 'up'
                    ? 'text-primary'
                    : trend === 'down'
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                )}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
