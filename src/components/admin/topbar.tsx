import { auth } from "@/auth"
import { logout } from "@/actions/auth"

export async function AdminTopbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-secondary">
          {session?.user?.name || session?.user?.email}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-secondary hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  )
}
