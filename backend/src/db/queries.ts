import { pool } from './pool';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ── AI Tool Usage ──

export async function getTodayUsage(userId: string, toolSlug: string): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT count FROM ai_tool_usage WHERE user_id = ? AND tool_slug = ? AND usage_date = CURDATE()',
    [userId, toolSlug],
  );
  return rows.length > 0 ? rows[0].count : 0;
}

export async function incrementUsage(userId: string, toolSlug: string): Promise<void> {
  await pool.execute(
    `INSERT INTO ai_tool_usage (user_id, tool_slug, usage_date, count)
     VALUES (?, ?, CURDATE(), 1)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [userId, toolSlug],
  );
}

// ── AI Tool Credits ──

export async function getCredits(userId: string, toolSlug: string): Promise<number> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT credits FROM ai_tool_credits WHERE user_id = ? AND tool_slug = ?',
    [userId, toolSlug],
  );
  return rows.length > 0 ? rows[0].credits : 0;
}

export async function decrementCredits(userId: string, toolSlug: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE ai_tool_credits SET credits = credits - 1
     WHERE user_id = ? AND tool_slug = ? AND credits > 0`,
    [userId, toolSlug],
  );
  return result.affectedRows > 0;
}

export async function addCredits(userId: string, toolSlug: string, amount: number): Promise<void> {
  await pool.execute(
    `INSERT INTO ai_tool_credits (user_id, tool_slug, credits)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE credits = credits + ?`,
    [userId, toolSlug, amount, amount],
  );
}

// ── Day Pass ──

export async function hasActiveDayPass(userId: string): Promise<string | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT valid_until FROM xp_store_purchases
     WHERE user_id = ? AND item_key = 'day-pass' AND valid_until > NOW()
     ORDER BY valid_until DESC LIMIT 1`,
    [userId],
  );
  return rows.length > 0 ? rows[0].valid_until : null;
}

// ── User (from shared account DB) ──

export async function getUserById(userId: string): Promise<{ tier: string; xp: number } | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT tier, xp FROM users WHERE id = ?',
    [userId],
  );
  return rows.length > 0 ? { tier: rows[0].tier, xp: rows[0].xp } : null;
}

// ── XP Store ──

export async function recordPurchase(
  userId: string,
  itemKey: string,
  xpCost: number,
  creditsAdded: number | null,
  validUntil: string | null,
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO xp_store_purchases (user_id, item_key, xp_cost, credits_added, valid_until)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, itemKey, xpCost, creditsAdded, validUntil],
  );
  return result.insertId;
}

export async function deductXp(userId: string, amount: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE users SET xp = xp - ? WHERE id = ? AND xp >= ?',
    [amount, userId, amount],
  );
  return result.affectedRows > 0;
}

export async function logXpChange(userId: string, amount: number, source: string): Promise<void> {
  await pool.execute(
    'INSERT INTO xp_log (user_id, amount, source, created_at) VALUES (?, ?, ?, NOW())',
    [userId, amount, source],
  );
}

export async function getPurchaseHistory(userId: string, limit = 50): Promise<RowDataPacket[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM xp_store_purchases WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit],
  );
  return rows;
}