"use client"

import { type LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  unreadCount,
  onInboxClick,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
  unreadCount?: number
  onInboxClick?: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isInbox = item.title === "Inbox"
          const shouldShowBadge = isInbox && unreadCount !== undefined && unreadCount > 0

          return (
            <SidebarMenuItem key={item.title}>
              {isInbox && onInboxClick ? (
                <SidebarMenuButton
                  onClick={(e) => {
                    e.preventDefault()
                    onInboxClick()
                  }}
                  isActive={item.isActive}
                  className="relative"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {shouldShowBadge && (
                    <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
