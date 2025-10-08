"use client"

import { SidebarNav } from "./sidebar-nav"
import { UserNav } from "./user-nav"
import { MobileNav } from "./mobile-nav"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-gray-50/40 md:block">
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            <MobileNav />
            <div className="flex flex-1 items-center justify-between space-x-2">
              <div className="flex-1"></div>
              <UserNav />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
