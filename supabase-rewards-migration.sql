-- 보상 시스템용 profiles 컬럼 추가 (Supabase SQL 에디터에서 실행)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank_override text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_nickname_change_date timestamptz;

-- 기존 행에 기본값 적용
UPDATE profiles SET points = COALESCE(points, 0), credits = COALESCE(credits, 0) WHERE points IS NULL OR credits IS NULL;

-- 매매일지 저장용 테이블 (선택)
CREATE TABLE IF NOT EXISTS trading_diary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  symbol text,
  position text CHECK (position IN ('long', 'short')),
  entry numeric,
  tp numeric,
  sl numeric,
  profit numeric,
  mistake text,
  principle text,
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trading_diary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own diary"
  ON trading_diary FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own diary"
  ON trading_diary FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own diary"
  ON trading_diary FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diary"
  ON trading_diary FOR DELETE USING (auth.uid() = user_id);

-- 프로필 points/credits 업데이트 정책 (본인만)
-- RLS가 이미 있다면 profiles UPDATE는 보통 id = auth.uid() 허용됨. 필요 시 추가.

-- 테스트: 마스터 등급 👑 표시 확인용 (본인 user_id로 변경 후 실행)
-- UPDATE profiles SET rank_override = '마스터' WHERE id = 'YOUR_USER_UUID';

-- 출금 인증(profit) 게시글 승인 상태 (승인 시에만 랭킹 노출·포인트 지급)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS approval_status text CHECK (approval_status IN ('pending', 'approved'));
-- 기존 profit 글은 승인된 것으로 간주 (선택)
-- UPDATE posts SET approval_status = 'approved' WHERE category = 'profit' AND approval_status IS NULL;
