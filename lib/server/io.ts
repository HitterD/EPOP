import type { Server } from 'socket.io'

declare global {
  // eslint-disable-next-line no-var
  var __io: Server | undefined
}

export function getIO(): Server | undefined {
  return (globalThis as unknown as { __io?: Server }).__io
}

export function emitToRoom(room: string, event: string, payload: unknown): void {
  const io = getIO()
  if (io) {
    io.to(room).emit(event, payload)
  }
}
