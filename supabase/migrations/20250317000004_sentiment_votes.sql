-- 비트코인 시장 심리 투표 (Bull/Bear). 매일 00:00 UTC 기준 새 날짜로 집계.
CREATE TABLE IF NOT EXISTS sentiment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_key date NOT NULL,
  choice text NOT NULL CHECK (choice IN ('bull', 'bear')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_key)
);

CREATE INDEX IF NOT EXISTS idx_sentiment_votes_day ON sentiment_votes(day_key);

ALTER TABLE sentiment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sentiment_votes_select" ON sentiment_votes FOR SELECT USING (true);
CREATE POLICY "sentiment_votes_insert_own" ON sentiment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sentiment_votes_update_own" ON sentiment_votes FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE sentiment_votes IS '오늘의 시장 심리: Bull/Bear 투표, day_key 기준 매일 새로 집계';
