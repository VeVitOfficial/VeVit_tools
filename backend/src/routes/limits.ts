import { Router } from 'express'

const router = Router()

router.get('/status', (_req, res) => {
  res.json({
    premiumTier: 'none',
    dayPassActiveUntil: null,
    tools: [],
    userXp: 0,
  })
})

export default router
