import { NextRequest, NextResponse} from "next/server";    
import prisma from "@/prisma/connection";

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

// Get all messages
export async function GET() {
    try {   
        const allMessages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(allMessages, {status: 200})
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