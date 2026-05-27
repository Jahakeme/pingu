"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { Socket } from "socket.io-client";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Message = {
  text: string;
  isUser: boolean;
  userName?: string;
  userId?: string;
  timestamp?: string;
};

type ServerMessage = {
  text: string;
  userId: string;
  userName: string;
  socketId: string;
  timestamp: string;
  recipientId?: string;
};

type DbMessage = {
  content: string;
  senderId: string;
  recipientId?: string;
  createdAt: string;
};

export interface SelectedUser {
  id: string;
  name: string;
  image?: string | null;
}

export interface ChatroomProps {
  selectedUser?: SelectedUser;
  onSelectUser?: (user: SelectedUser) => void;
}

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const formatTime = (timestamp: string | undefined): string => {
  if (!timestamp) return "";
  try {
    return TIME_FMT.format(new Date(timestamp));
  } catch {
    return "";
  }
};

const Chatroom: React.FC<ChatroomProps> = ({ selectedUser }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const currentUserId = session?.user?.id;
  const selectedUserId = selectedUser?.id;

  const [message, setMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load historical messages via TanStack Query (deduped, cached)
  const { data: history } = useQuery<Message[]>({
    queryKey: ["messages", currentUserId, selectedUserId],
    enabled: Boolean(currentUserId && selectedUserId),
    queryFn: async () => {
      const res = await fetch(`/api/messages?userId=${selectedUserId}`);
      if (!res.ok) return [];
      const dbMessages: DbMessage[] = await res.json();
      return dbMessages.map((m) => ({
        text: m.content,
        isUser: currentUserId === m.senderId,
        userId: m.senderId,
        timestamp: m.createdAt,
      }));
    },
  });

  // Reset live messages and mark-as-read in parallel when conversation changes
  useEffect(() => {
    setLiveMessages([]);
    if (!selectedUserId || !currentUserId) return;

    void fetch("/api/messages/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationUserId: selectedUserId }),
    }).catch((err) => console.error("Error marking messages as read:", err));
  }, [currentUserId, selectedUserId]);

  // Socket lifecycle — connect once per mount, lazy-load module
  useEffect(() => {
    let cancelled = false;
    let created: Socket | null = null;

    (async () => {
      const { io } = await import("socket.io-client");
      if (cancelled) return;
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      created = io(backendUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
      setSocket(created);
    })();

    return () => {
      cancelled = true;
      created?.disconnect();
      setSocket(null);
    };
  }, []);

  // Attach listeners keyed by conversation
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (serverMessage: ServerMessage) => {
      const isCurrentUser = socket.id === serverMessage.socketId;
      const isRelevant =
        (serverMessage.userId === currentUserId &&
          serverMessage.recipientId === selectedUserId) ||
        (serverMessage.userId === selectedUserId &&
          serverMessage.recipientId === currentUserId);

      if (!isRelevant) {
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
        return;
      }

      setLiveMessages((prev) => [
        ...prev,
        {
          text: serverMessage.text,
          isUser: isCurrentUser,
          userName: serverMessage.userName,
          userId: serverMessage.userId,
          timestamp: serverMessage.timestamp,
        },
      ]);

      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
    };

    const handleNewUnread = (data: { recipientId: string }) => {
      if (data.recipientId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
      }
    };

    socket.on("message", handleMessage);
    socket.on("newUnreadMessage", handleNewUnread);

    return () => {
      socket.off("message", handleMessage);
      socket.off("newUnreadMessage", handleNewUnread);
    };
  }, [socket, currentUserId, selectedUserId, queryClient]);

  const messages = useMemo(
    () => [...(history ?? []), ...liveMessages],
    [history, liveMessages]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !socket || !selectedUserId) return;

    socket.emit("chatMessage", {
      text: message,
      userId: currentUserId || "Anonymous",
      userName: session?.user?.name || "User",
      recipientId: selectedUserId,
    });

    setMessage("");
  }, [message, socket, currentUserId, selectedUserId, session?.user?.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div className="flex h-full flex-col">
      {selectedUser && (
        <div className="border-b p-4 bg-muted/50">
          <h2 className="text-lg font-semibold">{selectedUser.name || "User"}</h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!selectedUser ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
              </h2>
              <p>Select a user from the sidebar to start a conversation</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <h2 className="text-xl font-semibold mb-2">
                Begin a conversation with {selectedUser?.name || "this user"}
              </h2>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.isUser ? "items-end" : "items-start"}`}
            >
              {!msg.isUser && msg.userName && (
                <span className="text-xs text-muted-foreground mb-1">{msg.userName}</span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                {msg.timestamp && (
                  <p className={`text-xs mt-1 ${
                    msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedUser && (
        <div className="border-t p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder="Send a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12 min-h-13 resize-none"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="absolute right-2 bottom-2 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatroom;
