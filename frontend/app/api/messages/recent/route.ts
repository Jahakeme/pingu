import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json([])
    }

    // Fetch recent messages (limit to 10)
    const recentMessages = await prisma.message.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    })

    return NextResponse.json(recentMessages)
  } catch (error) {
    console.error('Error fetching recent messages:', error)
    return NextResponse.json([])
  }
}
