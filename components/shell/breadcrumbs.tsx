"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

// Map path segments to readable names
const pathNames: Record<string, string> = {
  dashboard: "Dashboard",
  chat: "Chat",
  projects: "Projects",
  files: "Files",
  directory: "Directory",
  calendar: "Calendar",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
  admin: "Admin",
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  
  // Don't show breadcrumbs on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null
  }

  const pathSegments = pathname.split("/").filter((segment) => segment)

  // If we're on the root or dashboard, just show home
  if (pathSegments.length === 0 || pathname === "/dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Home className="h-4 w-4" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1
          const href = "/" + pathSegments.slice(0, index + 1).join("/")
          const name = pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
