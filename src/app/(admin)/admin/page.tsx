import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/admin/stats-card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export const metadata = { title: "Admin Dashboard" }

export default async function AdminDashboardPage() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    productCount,
    orderCount,
    customerCount,
    affiliateCount,
    revenueToday,
    revenueWeek,
    revenueMonth,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.affiliate.count({ where: { status: "APPROVED" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: weekStart } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" }, createdAt: { gte: monthStart } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _count: { id: true },
      _sum: { total: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ])

  const topProductIds = topProducts.map((p) => p.productId)
  const products = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, slug: true },
      })
    : []
  const productMap = new Map(products.map((p) => [p.id, p]))

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Today"
          value={formatCurrency(Number(revenueToday._sum.total || 0))}
        />
        <StatsCard
          title="This Week"
          value={formatCurrency(Number(revenueWeek._sum.total || 0))}
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(Number(revenueMonth._sum.total || 0))}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Products" value={productCount} />
        <StatsCard title="Orders" value={orderCount} />
        <StatsCard title="Customers" value={customerCount} />
        <StatsCard title="Affiliates" value={affiliateCount} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-secondary">No orders yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted">
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">
                        {order.user.name || order.user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">
                        {order.status.replace(/_/g, " ")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        {formatCurrency(order.total.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Popular Products</h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-secondary">No sales data yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-secondary">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-secondary">Sold</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-secondary">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.map((item) => {
                    const product = productMap.get(item.productId)
                    return (
                      <tr key={item.productId} className="hover:bg-muted">
                        <td className="px-4 py-3 text-sm">
                          {product ? (
                            <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                              {product.name}
                            </Link>
                          ) : (
                            <span className="text-secondary">Deleted product</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-secondary">
                          {item._count.id}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                          {formatCurrency(Number(item._sum.total || 0))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
