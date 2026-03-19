-- 오늘의 전략 게시글 (인증 유저 전용)
CREATE TABLE IF NOT EXISTS strategy_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chart_image_url text NOT NULL,
  symbol text NOT NULL,
  position text NOT NULL CHECK (position IN ('long', 'short')),
  analysis_rationale text NOT NULL,
  target_price text NOT NULL,
  stop_loss text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strategy_posts_user_id ON strategy_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_posts_created_at ON strategy_posts(created_at DESC);

-- 좋아요 (1인 1회, 실시간 카운트용)
CREATE TABLE IF NOT EXISTS strategy_post_likes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_post_id uuid NOT NULL REFERENCES strategy_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, strategy_post_id)
);

CREATE INDEX IF NOT EXISTS idx_strategy_post_likes_post ON strategy_post_likes(strategy_post_id);

-- RLS
ALTER TABLE strategy_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "strategy_posts_select" ON strategy_posts FOR SELECT USING (true);
CREATE POLICY "strategy_posts_insert" ON strategy_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strategy_posts_update_own" ON strategy_posts FOR UPDATE USING (auth.uid() = user_id);
-- 좋아요 수는 strategy_post_likes 트리거로만 갱신 (클라이언트는 likes 업데이트 불필요)

CREATE POLICY "strategy_post_likes_select" ON strategy_post_likes FOR SELECT USING (true);
CREATE POLICY "strategy_post_likes_insert" ON strategy_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "strategy_post_likes_delete" ON strategy_post_likes FOR DELETE USING (auth.uid() = user_id);

-- Storage: Supabase Dashboard → Storage → New bucket "strategy-charts" (public).
-- Policy: Authenticated users can upload; public read for chart_image_url.

-- 좋아요 추가/삭제 시 strategy_posts.likes 자동 반영
CREATE OR REPLACE FUNCTION strategy_post_likes_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE strategy_posts SET likes = likes + 1, updated_at = now() WHERE id = NEW.strategy_post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE strategy_posts SET likes = GREATEST(0, likes - 1), updated_at = now() WHERE id = OLD.strategy_post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER strategy_post_likes_after_insert
  AFTER INSERT ON strategy_post_likes FOR EACH ROW EXECUTE PROCEDURE strategy_post_likes_sync();
CREATE TRIGGER strategy_post_likes_after_delete
  AFTER DELETE ON strategy_post_likes FOR EACH ROW EXECUTE PROCEDURE strategy_post_likes_sync();

COMMENT ON TABLE strategy_posts IS '오늘의 전략: 차트 분석 스크린샷 + 종목/포지션/근거/목표가/손절가';
COMMENT ON TABLE strategy_post_likes IS '전략 글 좋아요 (1인 1회)';
