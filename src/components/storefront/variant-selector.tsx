"use client"

import { cn } from "@/lib/utils"

interface Variant {
  id: string
  name: string
  price: any
  stock: number
  options: { name: string; value: string }[]
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariantId: string | null
  onSelect: (variantId: string) => void
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  // Group variants by option name
  const optionGroups = new Map<string, Set<string>>()
  for (const variant of variants) {
    const options = variant.options as { name: string; value: string }[]
    for (const opt of options) {
      if (!optionGroups.has(opt.name)) {
        optionGroups.set(opt.name, new Set())
      }
      optionGroups.get(opt.name)!.add(opt.value)
    }
  }

  // If there's only one option group, show simple buttons
  // Otherwise show the first group as the primary selector
  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([optionName, values]) => (
        <div key={optionName}>
          <label className="block text-sm font-medium text-foreground">
            {optionName}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              const matchingVariant = variants.find((v) => {
                const opts = v.options as { name: string; value: string }[]
                return opts.some(
                  (o) => o.name === optionName && o.value === value
                )
              })

              const isSelected =
                matchingVariant?.id === selectedVariantId
              const isOutOfStock = matchingVariant
                ? matchingVariant.stock <= 0
                : true

              return (
                <button
                  key={value}
                  onClick={() => matchingVariant && onSelect(matchingVariant.id)}
                  disabled={isOutOfStock}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground",
                    isOutOfStock && "cursor-not-allowed opacity-40"
                  )}
                >
                  {value}
                  {isOutOfStock && " (Sold out)"}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
