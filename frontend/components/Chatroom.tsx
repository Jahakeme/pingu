"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import io, { Socket } from "socket.io-client";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";

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

export interface SelectedUser {
  id: string;
  name: string;
  image?: string | null;
}

export interface ChatroomProps {
  selectedUser?: SelectedUser;
  onSelectUser?: (user: SelectedUser) => void;
}

const Chatroom: React.FC<ChatroomProps> = ({ selectedUser }) => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string | undefined): string => {
    if (!timestamp) return "";
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

  const markMessagesAsRead = async () => {
    if (!selectedUser || !session?.user?.id) return;

    try {
      await fetch(`/api/messages/mark-as-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: selectedUser.id,
          recipientId: session.user.id,
        }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    // Load messages from database
    const loadMessages = async () => {
      if (!selectedUser) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch("/api/messages");
        if (response.ok) {
          const dbMessages = await response.json();
          // Filter messages for the selected conversation
          const conversationMessages: Message[] = dbMessages
            .filter((msg: { senderId: string; recipientId?: string }) => {
              const currentUserId = session?.user?.id;
              const selectedUserId = selectedUser.id;
              
              // Show messages where:
              // 1. Current user sent to selected user
              // 2. Selected user sent to current user
              return (
                (msg.senderId === currentUserId && msg.recipientId === selectedUserId) ||
                (msg.senderId === selectedUserId && msg.recipientId === currentUserId)
              );
            })
            .map((msg: { content: string; senderId: string; createdAt: string }) => ({
              text: msg.content,
              isUser: session?.user?.id === msg.senderId,
              userId: msg.senderId,
              timestamp: msg.createdAt,
            }));
          setMessages(conversationMessages);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [session?.user?.id, selectedUser]);

  useEffect(() => {
    // ✅ Connect to your backend socket server
    const socket: Socket = io("https://ping-gilt.vercel.app", {
      transports: ["websocket"], // helps avoid polling issues
    });
    socketRef.current = socket;

    socket.on("message", (serverMessage: ServerMessage) => {
      const isCurrentUser = socket.id === serverMessage.socketId;
      const currentUserId = session?.user?.id;
      
      // Only add message if it's part of the current conversation
      const isRelevantMessage = 
        (serverMessage.userId === currentUserId && serverMessage.recipientId === selectedUser?.id) ||
        (serverMessage.userId === selectedUser?.id && serverMessage.recipientId === currentUserId);
      
      if (!isRelevantMessage) return;
      
      const message: Message = {
        text: serverMessage.text,
        isUser: isCurrentUser,
        userName: serverMessage.userName,
        userId: serverMessage.userId,
        timestamp: serverMessage.timestamp,
      };
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser, session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !socketRef.current || !selectedUser) return;
    
    socketRef.current.emit("chatMessage", {
      text: message,
      userId: session?.user?.id || "Anonymous",
      userName: session?.user?.name || "User",
      recipientId: selectedUser.id,
    });
    
    // Mark messages as read when replying
    markMessagesAsRead();
    
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Conversation Header */}
      {selectedUser && (
        <div className="border-b p-4 bg-muted/50">
          <h2 className="text-lg font-semibold">{selectedUser.name || "User"}</h2>
        </div>
      )}

      {/* Messages Area */}
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

      {/* Input Area */}
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
                  className="pr-12 min-h-[52px] resize-none"
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

