import { Star } from 'lucide-react'
export default function StarRating({ value=0, size=14, showValue=false, count }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex" aria-label={`Rating ${value} out of 5`}>
        {[0,1,2,3,4].map(i => (
          <Star key={i} size={size}
            className={i < full ? 'fill-yellow-400 text-yellow-400' : (i===full && half ? 'fill-yellow-400/60 text-yellow-400' : 'text-neutral-300 dark:text-neutral-600')}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold">{value.toFixed(1)}</span>}
      {typeof count === 'number' && <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>}
    </div>
  )
}
