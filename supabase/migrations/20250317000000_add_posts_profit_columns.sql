-- 출금 인증 전용 컬럼 추가 (1단계: 글쓰기 틀 및 pending 저장)
-- profit 카테고리만 approval_status = 'pending' → 'approved' 로 변경.
--
-- 스토리지: Supabase Dashboard → Storage에서 버킷 "verification" 생성 후
-- - 정책: 인증된 사용자 업로드 허용 (INSERT), 공개 읽기 허용 (SELECT) 설정.

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS prop_company text,
ADD COLUMN IF NOT EXISTS withdrawal_amount numeric,
ADD COLUMN IF NOT EXISTS verification_image_url text;

COMMENT ON COLUMN posts.prop_company IS '출금 인증: 프랍 업체명 (선택)';
COMMENT ON COLUMN posts.withdrawal_amount IS '출금 인증: 출금 금액 (USD)';
COMMENT ON COLUMN posts.verification_image_url IS '출금 인증: 인증 이미지 URL';
