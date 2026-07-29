CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  day_key TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen
ON sessions (last_seen);

CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  total_visits INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO site_stats (id, total_visits)
VALUES (1, 0);

CREATE TABLE IF NOT EXISTS daily_stats (
  day_key TEXT PRIMARY KEY,
  visits INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER IF NOT EXISTS sessions_increment_stats
AFTER INSERT ON sessions
BEGIN
  UPDATE site_stats
  SET total_visits = total_visits + 1
  WHERE id = 1;

  INSERT INTO daily_stats (day_key, visits)
  VALUES (NEW.day_key, 1)
  ON CONFLICT(day_key) DO UPDATE SET visits = visits + 1;
END;

CREATE TABLE IF NOT EXISTS platform_sessions (
  site_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  day_key TEXT NOT NULL,
  PRIMARY KEY (site_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_sessions_site_last_seen
ON platform_sessions (site_id, last_seen);

CREATE TABLE IF NOT EXISTS platform_site_stats (
  site_id TEXT PRIMARY KEY,
  total_visits INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS platform_daily_stats (
  site_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, day_key)
);

CREATE TRIGGER IF NOT EXISTS platform_sessions_increment_stats
AFTER INSERT ON platform_sessions
BEGIN
  INSERT INTO platform_site_stats (site_id, total_visits)
  VALUES (NEW.site_id, 1)
  ON CONFLICT(site_id) DO UPDATE
  SET total_visits = total_visits + 1;

  INSERT INTO platform_daily_stats (site_id, day_key, visits)
  VALUES (NEW.site_id, NEW.day_key, 1)
  ON CONFLICT(site_id, day_key) DO UPDATE
  SET visits = visits + 1;
END;

CREATE TABLE IF NOT EXISTS learning_sync_snapshots (
  site_id TEXT NOT NULL,
  sync_id TEXT NOT NULL,
  cipher_text TEXT NOT NULL,
  iv TEXT NOT NULL,
  snapshot_version INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (site_id, sync_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_sync_snapshots_expires_at
ON learning_sync_snapshots (expires_at);

CREATE TABLE IF NOT EXISTS classroom_rooms (
  code TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  teacher_token_hash TEXT NOT NULL,
  mode TEXT NOT NULL,
  status TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  options_json TEXT NOT NULL DEFAULT '[]',
  correct_option TEXT NOT NULL DEFAULT 'A',
  explanation TEXT NOT NULL DEFAULT '',
  reveal_answer INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  question_version INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER,
  ends_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_classroom_rooms_expires_at
ON classroom_rooms (expires_at);

CREATE TABLE IF NOT EXISTS classroom_participants (
  code TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  team TEXT NOT NULL DEFAULT '',
  joined_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  PRIMARY KEY (code, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_classroom_participants_code_last_seen
ON classroom_participants (code, last_seen);

CREATE TABLE IF NOT EXISTS classroom_answers (
  code TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  question_version INTEGER NOT NULL,
  answer TEXT NOT NULL,
  answered_at INTEGER NOT NULL,
  PRIMARY KEY (code, participant_id, question_version)
);

CREATE INDEX IF NOT EXISTS idx_classroom_answers_code_version
ON classroom_answers (code, question_version);
