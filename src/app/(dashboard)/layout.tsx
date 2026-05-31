import type * as React from "react"
import { Suspense } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Layout comum das rotas operacionais com sidebar, cabecalho e area principal.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Suspense fallback={<AppSidebarFallback variant="inset" />}>
        <AppSidebar variant="inset" />
      </Suspense>
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

/**
 * Placeholder da sidebar usado enquanto a navegacao principal e carregada.
 */
function AppSidebarFallback({
  variant,
}: {
  variant: "sidebar" | "floating" | "inset"
}) {
  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-8 items-center gap-2 rounded-md px-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-4 w-32" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex h-8 items-center gap-2 rounded-md px-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex h-8 items-center gap-2 rounded-md px-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex h-8 items-center gap-2 rounded-md px-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
