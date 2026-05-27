"use client"

import * as React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function NavUsersImpl({
  users,
  onSelectUser,
  selectedUserId,
}: {
  users: {
    id: string
    name: string
    email: string
    image?: string | null
  }[]
  onSelectUser?: (userId: string) => void
  selectedUserId?: string
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Users</SidebarGroupLabel>
      <SidebarMenu>
        {users.map((user) => (
          <SidebarMenuItem key={user.id}>
            <SidebarMenuButton
              onClick={() => onSelectUser?.(user.id)}
              className={`flex items-center gap-2 cursor-pointer ${
                selectedUserId === user.id ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export const NavUsers = React.memo(NavUsersImpl)
