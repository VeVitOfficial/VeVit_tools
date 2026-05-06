import cron from 'node-cron'
import fs from 'fs-extra'
import path from 'path'

const UPLOAD_DIR = '/tmp/vevit-uploads'

export function startCleanupCron() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      if (!await fs.pathExists(UPLOAD_DIR)) return
      const dirs = await fs.readdir(UPLOAD_DIR)
      const now = Date.now()
      for (const dir of dirs) {
        const dirPath = path.join(UPLOAD_DIR, dir)
        const stat = await fs.stat(dirPath)
        if (now - stat.mtime.getTime() > 60 * 60 * 1000) {
          await fs.remove(dirPath)
        }
      }
    } catch (err) {
      console.error('Cleanup failed:', err)
    }
  })
}
