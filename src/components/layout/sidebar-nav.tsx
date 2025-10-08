"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, FolderOpen, TrendingUp, MessageSquare, Settings } from "lucide-react"

const navItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Series",
    href: "/series",
    icon: FolderOpen,
  },
  {
    title: "Themes",
    href: "/themes",
    icon: TrendingUp,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="mb-2 px-4 text-lg font-semibold tracking-tight">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🎵</span>
            <span>Disco</span>
          </Link>
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent" : "transparent"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
