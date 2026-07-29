ALTER TABLE classroom_rooms
ADD COLUMN group_count INTEGER NOT NULL DEFAULT 4;

ALTER TABLE classroom_rooms
ADD COLUMN lock_team_answers INTEGER NOT NULL DEFAULT 0;
