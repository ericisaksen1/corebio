"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { createVariant, deleteVariant } from "@/actions/products"
import { formatCurrency } from "@/lib/utils"

interface Variant {
  id: string
  name: string
  sku: string | null
  price: number
  stock: number
  options: unknown
}

interface VariantManagerProps {
  productId: string
  variants: Variant[]
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createVariant(productId, formData)
      if (result?.error) {
        toast(result.error, "error")
      } else {
        toast("Variant created!")
        setShowForm(false)
        router.refresh()
      }
    })
  }

  function handleDelete(variantId: string) {
    if (!confirm("Delete this variant?")) return
    startTransition(async () => {
      const result = await deleteVariant(variantId)
      if (result.error) {
        toast(result.error, "error")
      } else {
        toast("Variant deleted")
        router.refresh()
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Variants ({variants.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add"}
        </Button>
      </div>

      {showForm && (
        <form action={handleCreate} className="mt-4 space-y-3 border-b border-border pb-4">
          <Input label="Name" name="name" required placeholder="e.g., Small" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Option Name" name="optionName" placeholder="e.g., Size" />
            <Input label="Option Value" name="optionValue" placeholder="e.g., S" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Price" name="price" type="number" step="0.01" min="0" required />
            <Input label="Stock" name="stock" type="number" min="0" defaultValue="0" />
            <Input label="SKU" name="sku" placeholder="Optional" />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Creating..." : "Create Variant"}
          </Button>
        </form>
      )}

      {variants.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">No variants yet.</p>
      ) : (
        <div className="mt-4 divide-y divide-border">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{v.name}</p>
                <p className="text-xs text-secondary">
                  {formatCurrency(v.price)} &middot; Stock: {v.stock}
                  {v.sku && ` · ${v.sku}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                disabled={isPending}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
