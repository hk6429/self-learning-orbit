CREATE TABLE IF NOT EXISTS family_cheers (
  site_id TEXT NOT NULL,
  sync_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  cipher_text TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (site_id, sync_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_family_cheers_poll
ON family_cheers (site_id, sync_id, created_at);

CREATE INDEX IF NOT EXISTS idx_family_cheers_expires_at
ON family_cheers (expires_at);
