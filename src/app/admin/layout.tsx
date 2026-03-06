import Link from "next/link";
import { ShieldUser } from "lucide-react";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="font-display text-lg font-semibold text-foreground">
              NextGenICT Admin
            </span>
          </Link>

          <nav className="flex items-center gap-3 text-sm font-semibold text-muted">
            {session?.role === "ADMIN" ? (
              <Link href="/admin" className="inline-flex items-center gap-2 hover:text-primary">
                <ShieldUser size={16} /> Dashboard
              </Link>
            ) : null}
            <Link href="/admin/content" className="hover:text-primary">
              Content CMS
            </Link>
            {session?.role === "ADMIN" ? (
              <Link href="/admin/classes" className="hover:text-primary">
                Classes
              </Link>
            ) : null}
            <Link href="/portal" className="hover:text-primary">
              Student Portal
            </Link>
          </nav>

          {session ? (
            <LogoutButton className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary" />
          ) : (
            <Link
              href="/admin/login"
              className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
            >
              Login
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto w-[min(1200px,calc(100%-2rem))] py-8 md:py-10">{children}</main>
    </div>
  );
}
