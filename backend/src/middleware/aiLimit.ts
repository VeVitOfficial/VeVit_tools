import type { Request, Response, NextFunction } from 'express'
import pool from '../db/pool.js'
import type { AuthRequest } from './auth.js'

const DAILY_LIMITS: Record<string, number> = {
  'translate': 30,
  'summarize-text': 20,
  'ai-search': 15,
  'ai-chat': 20,
  'ai-seo': 10,
  'ai-sql-gen': 15,
  'ai-vision': 10,
  'ai-code-review': 10,
  'screenshot-to-code': 5,
  'ai-pdf-summarize': 5,
  'ai-pdf-translate': 3,
  'ai-image-gen': 3,
}

export async function aiLimitMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.userId
  const toolSlug = req.params.operation || req.body.toolSlug

  if (!userId || !toolSlug) {
    res.status(400).json({ error: 'missing_params' })
    return
  }

  const dailyLimit = DAILY_LIMITS[toolSlug] || 10

  // TODO: check premium tier, day pass, credits
  // Placeholder: allow all for now
  next()
}
