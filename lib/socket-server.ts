import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io: SocketIOServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const verified = jwt.verify(token, JWT_SECRET);
      socket.data.user = verified;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handling
  io.on('connection', (socket: Socket) => {
    console.log('[v0] Socket connected:', socket.id);

    // Join user room for targeted broadcasts
    const userId = (socket.data.user as any).userId || (socket.data.user as any).sub;
    socket.join(`user:${userId}`);

    // Todo update events
    socket.on('todo:update', (data) => {
      io!.to(`user:${userId}`).emit('todo:updated', data);
    });

    // Assignment events
    socket.on('assignment:request', (data) => {
      io!.to(`user:${data.assignedTo}`).emit('assignment:received', data);
    });

    // Commenting events
    socket.on('comment:add', (data) => {
      io!.to(`todo:${data.todoId}`).emit('comment:added', data);
    });

    // Presence events
    socket.on('presence:online', () => {
      io!.emit('user:online', { userId });
    });

    socket.on('disconnect', () => {
      console.log('[v0] Socket disconnected:', socket.id);
      io!.emit('user:offline', { userId });
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function broadcastToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

export function broadcastToTodo(todoId: string, event: string, data: any) {
  if (io) {
    io.to(`todo:${todoId}`).emit(event, data);
  }
}
