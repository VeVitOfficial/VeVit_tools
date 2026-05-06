import { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool';

export async function logExpirations(): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT user_id, valid_until FROM xp_store_purchases
       WHERE item_key = 'day-pass' AND valid_until > NOW() - INTERVAL 10 MINUTE AND valid_until <= NOW()`,
    );
    if (rows.length > 0) {
      console.log(`[cron] Day passes expired: ${rows.length}`);
    }
  } catch (err) {
    console.error('[cron] Failed to check day pass expirations:', err);
  }
}