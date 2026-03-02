import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL || '', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('[v0] Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('[v0] Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('[v0] Socket error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Event emitters
export function emitTodoUpdate(todoId: string, data: any) {
  if (socket) {
    socket.emit('todo:update', { todoId, data });
  }
}

export function emitAssignmentRequest(data: any) {
  if (socket) {
    socket.emit('assignment:request', data);
  }
}

// Event listeners (to be called from components)
export function onTodoUpdated(callback: (data: any) => void) {
  if (socket) {
    socket.on('todo:updated', callback);
  }
}

export function onAssignmentReceived(callback: (data: any) => void) {
  if (socket) {
    socket.on('assignment:received', callback);
  }
}

export function offTodoUpdated(callback: (data: any) => void) {
  if (socket) {
    socket.off('todo:updated', callback);
  }
}

export function offAssignmentReceived(callback: (data: any) => void) {
  if (socket) {
    socket.off('assignment:received', callback);
  }
}
