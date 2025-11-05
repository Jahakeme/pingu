"use client"

import * as React from "react"
import {
  Inbox,
  Users,
} from "lucide-react"
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

  const navMain = [
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
      isActive: false,
    },
    {
      title: "Groups (feature coming soon)",
      url: "#people",
      icon: Users,
      isActive: false,
    },
  ]


  const user = session?.user 
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || undefined,
      }
    : {
        name: "Guest",
        email: "guest@example.com",
      }

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
          items={navMain} 
          unreadCount={unreadCount}
          onInboxClick={() => setIsUnreadModalOpen(true)}
        />
        {onSelectUser && people && (
          <NavUsers
            users={people}
            onSelectUser={(userId) => {
              const user = people.find(u => u.id === userId);
              if (user) {
                const selectedUserObj: SelectedUser = {
                  id: user.id,
                  name: user.name || "User",
                  image: user.image,
                };
                onSelectUser(selectedUserObj);
                // Close sidebar on mobile when user is selected
                if (isMobile) {
                  setOpenMobile(false);
                }
              }
            }}
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
