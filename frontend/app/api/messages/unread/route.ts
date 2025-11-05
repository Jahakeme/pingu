import { NextResponse } from "next/server";
import prisma from "@/prisma/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all unread messages for the current user
    const unreadMessages = await prisma.message.findMany({
      where: {
        recipientId: currentUserId,
        // Exclude messages that have been read by the current user
        NOT: {
          readBy: {
            some: {
              userId: currentUserId,
            },
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group messages by sender
    const groupedMessages = unreadMessages.reduce(
      (acc, message) => {
        const senderId = message.senderId;
        if (!acc[senderId]) {
          acc[senderId] = {
            senderId: message.sender.id,
            senderName: message.sender.name,
            senderImage: message.sender.image,
            messages: [],
          };
        }
        acc[senderId].messages.push({
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          senderId: string;
          senderName: string;
          senderImage: string | null;
          messages: Array<{
            id: string;
            content: string;
            createdAt: Date;
          }>;
        }
      >
    );

    // Convert to array
    const result = Object.values(groupedMessages);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

