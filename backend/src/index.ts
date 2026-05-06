import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { rateLimiter } from './middleware/rateLimiter.js'
import { authMiddleware } from './middleware/auth.js'
import { aiLimitMiddleware } from './middleware/aiLimit.js'

import limitsRoutes from './routes/limits.js'
import xpStoreRoutes from './routes/xpStore.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' }
})

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '10mb' }))
app.use(rateLimiter)

app.use('/api/v2/limits', authMiddleware, limitsRoutes)
app.use('/api/v2/xp-store', authMiddleware, xpStoreRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`VeVit backend running on port ${PORT}`)
})
