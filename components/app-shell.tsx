"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  Gavel,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Chit Funds", href: "/chit-funds", icon: Wallet },
  { name: "Members", href: "/members", icon: Users },
  { name: "Payments", href: "/payments", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
]

function NavLink({
  item,
  mobile = false,
  onClick,
}: {
  item: (typeof navigation)[0]
  mobile?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        mobile
          ? isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent"
          : isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {item.name}
      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
    </Link>
  )
}

function Logo({ className }: { className?: string }) {
  const [imgError, setImgError] = React.useState(false)

  if (imgError) {
    return (
      <div className={`flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold ${className || "h-8 w-8"}`}>
        JC
      </div>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="Jyothi's Chitfund Logo"
      className={`object-contain ${className || "h-8 w-8"}`}
      onError={() => setImgError(true)}
    />
  )
}

function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <Logo />
        <span className="text-lg font-bold text-sidebar-foreground tracking-tight">Jyothi's Chitfund</span>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border lg:block">
        <Sidebar />
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <div className="flex items-center gap-3">
                    <Logo className="h-7 w-7" />
                    <span className="text-lg font-bold tracking-tight">Jyothi's Chitfund</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                  <nav className="flex flex-col gap-1">
                    {navigation.map((item) => (
                      <NavLink key={item.name} item={item} mobile onClick={() => setOpen(false)} />
                    ))}
                  </nav>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">Jyothi's Chitfund</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
