import Link from "next/link";
import { Bell, LayoutDashboard, ShieldUser, UserRound, Wallet } from "lucide-react";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export default async function PortalLayout({
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
              NextGenICT Portal
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted md:flex">
            <Link href="/portal" className="inline-flex items-center gap-2 hover:text-primary">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/portal/profile" className="inline-flex items-center gap-2 hover:text-primary">
              <UserRound size={16} /> Profile
            </Link>
            <a href="#payments" className="inline-flex items-center gap-2 hover:text-primary">
              <Wallet size={16} /> Payments
            </a>
            {session?.role === "ADMIN" ? (
              <Link href="/admin" className="inline-flex items-center gap-2 hover:text-primary">
                <ShieldUser size={16} /> Admin
              </Link>
            ) : null}
            <span className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2">
              <Bell size={16} /> Alerts
            </span>
          </nav>

          {session ? (
            <LogoutButton className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-foreground hover:border-primary" />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/portal/login"
                className="rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-primary"
              >
                Login
              </Link>
              <Link
                href="/portal/signup"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-[min(1200px,calc(100%-2rem))] py-8 md:py-10">{children}</main>
    </div>
  );
}
