import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')

socket.on('connect', () => {
  console.log('Socket connected')
})

socket.on('disconnect', () => {
  console.log('Socket disconnected')
})
