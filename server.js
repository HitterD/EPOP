const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    const userId = socket.handshake.auth?.userId || 'anonymous'
    // In development, allow missing token to avoid blocking UI
    if (process.env.NODE_ENV !== 'production' && !token) {
      socket.userId = userId
      return next()
    }
    // TODO: Verify JWT token here for production
    socket.userId = userId
    return next()
  })

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`)

    // Chat events
    socket.on('join_chat', (chatId) => {
      socket.join(`chat:${chatId}`)
      console.log(`User ${socket.userId} joined chat:${chatId}`)
    })

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`)
      console.log(`User ${socket.userId} left chat:${chatId}`)
    })

    socket.on('send_message', (data) => {
      const { chatId, message } = data
      // Broadcast to all users in the chat room
      const payload = {
        ...message,
        timestamp: new Date().toISOString(),
      }
      io.to(`chat:${chatId}`).emit('new_message', payload)
      // Emit standardized dot-style for FE listeners
      io.to(`chat:${chatId}`).emit('chat.message.created', { chatId, patch: payload })
    })

    socket.on('typing_start', (chatId) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId,
      })
      // Emit standardized dot-style
      socket.to(`chat:${chatId}`).emit('chat.typing.start', {
        userId: socket.userId,
        chatId,
      })
    })

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat:${chatId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        chatId,
      })
      // Emit standardized dot-style
      socket.to(`chat:${chatId}`).emit('chat.typing.stop', {
        userId: socket.userId,
        chatId,
      })
    })

    // Project events
    socket.on('join_project', (projectId) => {
      socket.join(`project:${projectId}`)
      console.log(`User ${socket.userId} joined project:${projectId}`)
    })

    socket.on('leave_project', (projectId) => {
      socket.leave(`project:${projectId}`)
      console.log(`User ${socket.userId} left project:${projectId}`)
    })

    socket.on('task_updated', (data) => {
      const { projectId, task } = data
      io.to(`project:${projectId}`).emit('task_updated', {
        task,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('task_moved', (data) => {
      const { projectId, taskId, fromBucket, toBucket } = data
      io.to(`project:${projectId}`).emit('task_moved', {
        taskId,
        fromBucket,
        toBucket,
        movedBy: socket.userId,
        timestamp: new Date().toISOString(),
      })
    })

    // Presence updates
    socket.on('update_presence', (status) => {
      socket.broadcast.emit('user_presence_changed', {
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
      socket.broadcast.emit('user_presence_changed', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date().toISOString(),
      })
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.IO server running`)
    })
})
