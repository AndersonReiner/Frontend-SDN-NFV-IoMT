import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExternalLinkIcon } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium">
            Rede Hospitalar IoMT
          </h1>
        </div>
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href="http://localhost:8000/docs" target="_blank" />}
        >
          Swagger
          <ExternalLinkIcon />
        </Button>
      </div>
    </header>
  )
}
