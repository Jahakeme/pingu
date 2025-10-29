import { NextResponse } from "next/server"
import prisma from "@/prisma/connection"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    )
  }

  try {
    // Get all unread messages where the current user is the recipient
    const messages = await prisma.message.findMany({
      where: {
        recipientId: userId,
        isRead: false,
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
      orderBy: { createdAt: "desc" },
    })

    // Get unique users who have sent messages to the current user
    const userMap = new Map()
    messages.forEach((msg) => {
      if (!userMap.has(msg.senderId)) {
        userMap.set(msg.senderId, {
          id: msg.sender.id,
          name: msg.sender.name,
          image: msg.sender.image,
        })
      }
    })

    const unreadUsers = Array.from(userMap.values())

    return NextResponse.json(unreadUsers, { status: 200 })
  } catch (error) {
    console.error("Error fetching unread messages:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
