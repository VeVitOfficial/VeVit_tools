import { pool } from '../db/pool';

export async function purgeOldUsage(): Promise<void> {
  try {
    const [result] = await pool.execute(
      'DELETE FROM ai_tool_usage WHERE usage_date < CURDATE() - INTERVAL 30 DAY',
    );
    console.log('[cron] Purged old usage records');
  } catch (err) {
    console.error('[cron] Failed to purge old usage:', err);
  }
}