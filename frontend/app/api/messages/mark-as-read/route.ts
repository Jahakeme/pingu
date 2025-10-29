import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/connection"

export async function POST(req: NextRequest) {
  const { senderId, recipientId } = await req.json()

  if (!senderId || !recipientId) {
    return NextResponse.json(
      { message: "senderId and recipientId are required" },
      { status: 400 }
    )
  }

  try {
    // Update all messages from senderId to recipientId to mark them as read
    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        recipientId: recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json(
      { message: "Messages marked as read" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
