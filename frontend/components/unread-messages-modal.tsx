"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { SelectedUser } from "@/components/Chatroom";

interface UnreadMessage {
  id: string;
  content: string;
  createdAt: string;
}

interface UnreadMessageGroup {
  senderId: string;
  senderName: string;
  senderImage: string | null;
  messages: UnreadMessage[];
}

interface UnreadMessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser?: (user: SelectedUser) => void;
}

export function UnreadMessagesModal({
  open,
  onOpenChange,
  onSelectUser,
}: UnreadMessagesModalProps) {
  const queryClient = useQueryClient();

  const { data: unreadMessages, isLoading } = useQuery<UnreadMessageGroup[]>({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const res = await fetch("/api/messages/unread");
      if (!res.ok) throw new Error("Failed to fetch unread messages");
      return res.json();
    },
    enabled: open, // Only fetch when modal is open
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const res = await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds }),
      });
      if (!res.ok) throw new Error("Failed to mark messages as read");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const handleMessageClick = async (group: UnreadMessageGroup) => {
    // Mark all messages from this sender as read
    const messageIds = group.messages.map((m) => m.id);
    await markAsReadMutation.mutateAsync(messageIds);

    // Select the user and open conversation
    if (onSelectUser) {
      const selectedUser: SelectedUser = {
        id: group.senderId,
        name: group.senderName,
        image: group.senderImage,
      };
      onSelectUser(selectedUser);
    }

    // Close the modal
    onOpenChange(false);
  };

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const truncateMessage = (content: string, maxLength: number = 50): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Unread Messages</SheetTitle>
          <SheetDescription>
            {isLoading
              ? "Loading..."
              : unreadMessages && unreadMessages.length > 0
              ? `${unreadMessages.length} conversation${unreadMessages.length > 1 ? "s" : ""} with unread messages`
              : "No unread messages"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 overflow-y-auto flex-1 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading unread messages...</p>
            </div>
          ) : unreadMessages && unreadMessages.length > 0 ? (
            unreadMessages.map((group) => (
              <button
                key={group.senderId}
                onClick={() => handleMessageClick(group)}
                className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={group.senderImage || undefined}
                      alt={group.senderName}
                    />
                    <AvatarFallback>
                      {group.senderName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate">
                        {group.senderName}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {group.messages.length} unread
                      </span>
                    </div>
                    {group.messages.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {truncateMessage(group.messages[0].content)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(group.messages[0].createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">All caught up!</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

