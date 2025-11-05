import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { conversationUserId, messageIds } = body;

    let messagesToMark: string[] = [];

    if (conversationUserId) {
      // Mark all unread messages from a specific conversation as read
      const conversationMessages = await prisma.message.findMany({
        where: {
          recipientId: currentUserId,
          senderId: conversationUserId,
          // Only get messages that haven't been read yet
          NOT: {
            readBy: {
              some: {
                userId: currentUserId,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
      messagesToMark = conversationMessages.map((m) => m.id);
    } else if (messageIds && Array.isArray(messageIds)) {
      // Mark specific messages as read
      messagesToMark = messageIds;
    } else {
      return NextResponse.json(
        { message: "Either conversationUserId or messageIds must be provided" },
        { status: 400 }
      );
    }

    if (messagesToMark.length === 0) {
      return NextResponse.json({ success: true, count: 0 }, { status: 200 });
    }

    // Create ReadMessage records for each unread message
    const readMessages = await Promise.all(
      messagesToMark.map((messageId) =>
        prisma.readMessage.create({
          data: {
            messageId,
            userId: currentUserId,
          },
        })
      )
    );

    return NextResponse.json(
      { success: true, count: readMessages.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

