import cron from 'node-cron'
import pool from '../db/pool.js'

export function startResetLimitsCron() {
  cron.schedule('5 0 * * *', async () => {
    try {
      await pool.execute('DELETE FROM ai_tool_usage WHERE usage_date < DATE_SUB(NOW(), INTERVAL 30 DAY)')
      console.log('Old usage records purged')
    } catch (err) {
      console.error('Reset limits failed:', err)
    }
  })
}
