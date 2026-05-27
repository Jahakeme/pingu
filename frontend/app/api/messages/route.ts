import { NextRequest, NextResponse} from "next/server";
import prisma from "@/prisma/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Create message
export async function POST(req:NextRequest) {
    const body = await req.json();

    try {
        const message = await prisma.message.create({
            data: { ...body },
        })
        return  NextResponse.json(message, {status: 201})
    } catch (_error) {
        return NextResponse.json(
            {message:"Something went wrong"},
            {status: 501}
        )
    }   
}

// Update message
export async function PUT(req:NextRequest) {
    const { id, ...body } = await req.json();   
    try {
        const updatedMessage = await prisma.message.update({
            where: { id },  
            data: { ...body }
        })
        return NextResponse.json(updatedMessage, {status: 200})
    } catch (_error) {  
        return NextResponse.json(
            {message:"Something went wrong"}, 
            {status: 501}
        )
    }   
}

// Get messages for current conversation
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;
        if (!currentUserId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const otherUserId = req.nextUrl.searchParams.get("userId");

        const where = otherUserId
            ? {
                OR: [
                    { senderId: currentUserId, recipientId: otherUserId },
                    { senderId: otherUserId, recipientId: currentUserId },
                ],
            }
            : {
                OR: [
                    { senderId: currentUserId },
                    { recipientId: currentUserId },
                ],
            };

        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(messages, {status: 200})
    } catch (_error) {
        return NextResponse.json(
            {message:"Something went wrong"},
            {status: 501}
        )
    }
}

// Delete message
export async function DELETE(req:NextRequest) {
    const { id } = await req.json();    
    try {
        const deletedMessage = await prisma.message.delete({
            where: { id }
        })
        return NextResponse.json(deletedMessage, {status: 200})
    } catch (_error) {  
        return NextResponse.json(
            {message:"Something went wrong"},
            {status: 501}
        )
    }       
}