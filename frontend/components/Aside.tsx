"use client"

import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { useQuery } from '@tanstack/react-query'
import type { SelectedUser } from '@/components/Chatroom'

interface AsideProps {
  onSelectUser?: (user: SelectedUser) => void
  selectedUser?: SelectedUser
}

const Aside = ({ onSelectUser, selectedUser }: AsideProps) => {
  // Fetch users
  const { data: people } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) return []
      return res.json()
    },
  })

  // Fetch unread count
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const res = await fetch('/api/messages/unread-count')
      if (!res.ok) return { count: 0 }
      return res.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  return (
    <AppSidebar
      people={people}
      onSelectUser={onSelectUser}
      selectedUser={selectedUser}
      unreadCount={unreadCountData?.count}
    />
  )
}

export default Aside
