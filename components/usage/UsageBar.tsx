"use client"

interface UsageBarProps {
  current: number
  limit: number | typeof Infinity
  label: string
  plan: string
}

export function UsageBar({ current, limit, label }: UsageBarProps) {
  const percentage = limit === Infinity ? 0 : Math.min((current / limit) * 100, 100)
  const isNearLimit = limit !== Infinity && percentage > 80

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={isNearLimit ? "text-orange-600" : ""}>
          {current} / {limit === Infinity ? "∞" : limit}
        </span>
      </div>
      {limit !== Infinity && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isNearLimit ? "bg-orange-500" : "bg-blue-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}