
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import prisma from './prisma/connection.js';


interface ClientMessage {
  text: string;
  userId?: string;
  userName?: string;
  recipientId?: string;
}

interface ServerMessage {
  text: string;
  userId: string;
  userName: string;
  socketId: string;
  timestamp: string;
  recipientId?: string;
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('chatMessage', async (data: ClientMessage) => {
    const message: ServerMessage = {
      text: data.text,
      userId: data.userId || 'Anonymous',
      userName: data.userName || 'User',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      recipientId: data.recipientId,
    };
    
    try {
      await prisma.message.create({
        data: {
          content: message.text,
          senderId: message.userId,
          recipientId: data.recipientId,
        },
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
    
    io.emit('message', message);
    console.log('Message received:', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Chat server is running.');
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
