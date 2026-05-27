"use client"

import * as React from "react"
import { Inbox, Users } from "lucide-react"
import Image from "next/image"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavUsers } from "@/components/nav-users"
import { UnreadMessagesModal } from "@/components/unread-messages-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { SearchForm } from "@/components/search-form"
import { useSession } from "next-auth/react"

interface Info {
  id: string
  name: string
  email: string
  image?: string | null
}

import type { SelectedUser } from '@/components/Chatroom';

const NAV_MAIN = [
  { title: "Inbox", url: "#", icon: Inbox, isActive: false },
  { title: "Groups (feature coming soon)", url: "#people", icon: Users, isActive: false },
]

const GUEST_USER = { name: "Guest", email: "guest@example.com" } as const

export function AppSidebar({
  people,
  onSelectUser,
  selectedUser,
  unreadCount,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  people?: Info[]
  onSelectUser?: (user: SelectedUser) => void
  selectedUser?: SelectedUser
  unreadCount?: number
}) {
  const { data: session } = useSession()
  const { setOpenMobile, isMobile } = useSidebar()
  const [isUnreadModalOpen, setIsUnreadModalOpen] = React.useState(false)

  const handleInboxClick = React.useCallback(() => setIsUnreadModalOpen(true), [])

  const handleUserSelect = React.useCallback(
    (userId: string) => {
      if (!people || !onSelectUser) return
      const u = people.find((p) => p.id === userId)
      if (!u) return
      onSelectUser({ id: u.id, name: u.name || "User", image: u.image })
      if (isMobile) setOpenMobile(false)
    },
    [people, onSelectUser, isMobile, setOpenMobile]
  )

  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
      }
    : GUEST_USER

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
          <div className="group-data-[collapsible=icon]:hidden shrink-0">
            <Image
              src="/pingulogo.svg"
              alt="Pingu Logo"
              width={120}
              height={120}
              className="w-16 h-12 md:w-24 md:h-20"
            />
          </div>
          <div className="shrink-0">
            <SidebarTrigger />
          </div>
        </div>
        <div className="p-2 group-data-[collapsible=icon]:hidden">
          <SearchForm />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={NAV_MAIN}
          unreadCount={unreadCount}
          onInboxClick={handleInboxClick}
        />
        {onSelectUser && people && (
          <NavUsers
            users={people}
            onSelectUser={handleUserSelect}
            selectedUserId={selectedUser?.id}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
      <UnreadMessagesModal
        open={isUnreadModalOpen}
        onOpenChange={setIsUnreadModalOpen}
        onSelectUser={onSelectUser}
      />
    </Sidebar>
  )
}
