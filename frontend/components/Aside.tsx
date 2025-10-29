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

  return (
    <AppSidebar
      people={people}
      onSelectUser={onSelectUser}
      selectedUser={selectedUser}
    />
  )
}

export default Aside
