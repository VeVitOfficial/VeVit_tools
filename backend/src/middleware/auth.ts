import type { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  userId?: string
  premiumTier?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  // TODO: verify JWT
  req.userId = 'demo-user'
  req.premiumTier = 'none'
  next()
}
