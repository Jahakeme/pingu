"use client";
import Aside from '@/components/Aside';
import Chatroom from '@/components/Chatroom';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { bitcount } from '@/lib/fonts';
import type { SelectedUser } from '@/components/Chatroom';

const Dashy = () => {
  const [selectedUser, setSelectedUser] = useState<SelectedUser | undefined>();

  return (
    <SidebarProvider>
      <Aside onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="flex items-center gap-2">
            <h1 className={`${bitcount.className} text-xl font-bold`}>Pingu</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <Chatroom selectedUser={selectedUser} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Dashy
