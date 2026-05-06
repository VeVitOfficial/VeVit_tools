import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: (req) => {
    const path = req.path
    if (path.includes('/ai/')) return 20
    if (path.includes('/video/') || path.includes('/image/')) return 10
    return 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
})
