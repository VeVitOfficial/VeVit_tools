import { Router } from 'express'

const router = Router()

router.post('/purchase', (_req, res) => {
  // TODO: implement XP store purchase logic
  res.json({ success: true })
})

export default router
