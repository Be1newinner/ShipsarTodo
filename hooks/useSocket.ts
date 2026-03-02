'use client';

import { useEffect } from 'react';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket-client';

export function useSocket() {
  useEffect(() => {
    const socket = initializeSocket();

    return () => {
      // Don't disconnect on unmount to maintain persistent connection
      // disconnectSocket();
    };
  }, []);

  return getSocket();
}
