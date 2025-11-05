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

    // Count unread messages for the current user
    const count = await prisma.message.count({
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
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

