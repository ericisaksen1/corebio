import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-secondary">{title}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-secondary">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
