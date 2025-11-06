'use client'

import { io, Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/constants'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      reconnection: false, // manual reconnection handled in useResilientSocket
      transports: ['websocket'],
      withCredentials: true,
      timeout: 8000,
    })

    socket.on('connect', () => {
      console.log('Socket.IO connected')
    })

    socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason)
    })

    socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error)
    })
  }

  return socket
}

export function connectSocket(userId: string, token: string) {
  const socket = getSocket()
  socket.auth = { userId, token }
  socket.connect()
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false
}

