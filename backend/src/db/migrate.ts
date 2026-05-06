import { pool } from './pool';

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS ai_tool_usage (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL,
    tool_slug   VARCHAR(60) NOT NULL,
    usage_date  DATE NOT NULL,
    count       INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_user_tool_date (user_id, tool_slug, usage_date),
    INDEX idx_date (usage_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci`,

  `CREATE TABLE IF NOT EXISTS ai_tool_credits (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL,
    tool_slug   VARCHAR(60) NOT NULL,
    credits     INT NOT NULL DEFAULT 0,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_tool (user_id, tool_slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci`,

  `CREATE TABLE IF NOT EXISTS xp_store_purchases (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       VARCHAR(36) NOT NULL,
    item_key      VARCHAR(80) NOT NULL,
    xp_cost       INT NOT NULL,
    credits_added INT,
    valid_until   DATETIME,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_created (user_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci`,
];

async function migrate(): Promise<void> {
  console.log('Running migrations...');
  for (const sql of MIGRATIONS) {
    await pool.execute(sql);
  }
  console.log(`Done. ${MIGRATIONS.length} tables ensured.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});