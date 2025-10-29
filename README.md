# Chatroom Project

This is a monorepo containing both frontend and backend for the chatroom application.

## Structure

```
chatroom/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── prisma/       # Prisma client for API routes
│   └── utils/        # Utility functions
└── backend/          # Express backend server
    ├── prisma/       # Prisma schema and connection
    └── server.ts     # Socket.io server
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend WebSocket server will run on `http://localhost:4000`

## Database Setup

Both frontend and backend share the same database. Run migrations from either directory:

```bash
# From frontend or backend
npx prisma migrate dev
npx prisma generate
```

## Environment Variables

Make sure to set up your `.env` files in both frontend and backend directories with the appropriate database connection strings and other environment variables.
