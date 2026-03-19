-- 운영진 승인 시: 유저 is_verified + 누적 출금액 랭킹용
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS total_withdrawal_amount numeric DEFAULT 0;

COMMENT ON COLUMN profiles.is_verified IS '출금 인증 승인 시 true, 🔰 Verified Trader 배지';
COMMENT ON COLUMN profiles.total_withdrawal_amount IS '승인된 출금 인증 금액 합산 (USD), 누적 출금 랭킹용';
