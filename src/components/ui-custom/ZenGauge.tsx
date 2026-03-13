import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function ZenGauge({ score, className }: { score: number; className?: string }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300)
    return () => clearTimeout(timer)
  }, [score])

  const getColor = (val: number) => {
    if (val >= 80) return 'text-primary'
    if (val >= 60) return 'text-amber-500'
    return 'text-destructive'
  }

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  return (
    <div className={cn('relative flex items-center justify-center aspect-square', className)}>
      <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 160 160">
        <circle
          className="text-muted/20"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
        />
        <circle
          className={cn('transition-all duration-1000 ease-out', getColor(animatedScore))}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="80"
          cy="80"
          style={{ filter: `drop-shadow(0 0 8px currentColor)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span
          className={cn('text-5xl font-bold tracking-tighter font-mono', getColor(animatedScore))}
        >
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
          Zen Score
        </span>
      </div>
    </div>
  )
}
