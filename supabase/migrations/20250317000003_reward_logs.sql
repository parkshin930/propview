-- 보상 지급 이력 (중복 지급 방지 + 감사)
CREATE TABLE IF NOT EXISTS reward_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('daily', 'weekly')),
  period_key text NOT NULL,
  rank integer NOT NULL DEFAULT 1,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  credits integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, period_key, rank)
);

CREATE INDEX IF NOT EXISTS idx_reward_logs_period ON reward_logs(kind, period_key);
CREATE INDEX IF NOT EXISTS idx_reward_logs_user ON reward_logs(user_id);

ALTER TABLE reward_logs ENABLE ROW LEVEL SECURITY;
-- 정책 없음: 일반 유저는 접근 불가. 크론은 service_role로 RLS 우회.

COMMENT ON TABLE reward_logs IS '일일/주간 보상 지급 이력 (크론 중복 방지)';
