import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Severity = 'low' | 'medium' | 'high' | 'critical'

export function EventBadge({
  type,
  severity,
  className,
}: {
  type: string
  severity: Severity
  className?: string
}) {
  const variants: Record<Severity, string> = {
    low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 animate-pulse',
  }

  const translations: Record<string, string> = {
    HARD_BRAKE: 'Frenagem Brusca',
    RAPID_ACCEL: 'Aceleração Agressiva',
    CORNERING: 'Curva Perigosa',
    POTHOLE: 'Impacto de Buraco',
    IDLING: 'Ociosidade',
  }

  const translatedType = translations[type] || type.replace('_', ' ')

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[10px] uppercase tracking-wider',
        variants[severity],
        className,
      )}
    >
      {translatedType}
    </Badge>
  )
}
