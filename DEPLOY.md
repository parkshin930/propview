# PropView Vercel 배포 가이드 — 공유 링크 만들기

아빠·팀원들에게 카톡으로 보낼 **공유 가능한 URL**을 만드는 방법입니다.

---

## 1. 배포 환경 점검 (이미 반영됨)

- **package.json**: `build` 스크립트 `next build` 사용, Node `>=18.17.0` 명시로 Vercel과 호환됩니다.
- **next.config.js**: Next.js 15 기준으로 설정되어 있으며, Vercel에서 별도 설정 없이 빌드됩니다.
- **환경 변수**: Supabase 사용 시 아래 두 개만 있으면 됩니다 (2단계에서 입력).

---

## 2. Vercel에 배포해서 고유 링크 만들기

### 2-1. Vercel 가입 & GitHub 연동

1. https://vercel.com 접속 → **Sign Up** → **Continue with GitHub** 선택  
2. GitHub 로그인 후 **Authorize** 로 Vercel 연동  

### 2-2. 프로젝트를 GitHub에 올리기 (아직 안 했다면)

프로젝트 폴더에서:

```bash
git init
git add .
git commit -m "Initial commit - PropView"
```

GitHub에서 새 저장소 생성(예: `coinness-community`) 후:

```bash
git remote add origin https://github.com/본인아이디/저장소이름.git
git branch -M main
git push -u origin main
```

### 2-3. Vercel에서 프로젝트 배포

1. https://vercel.com/dashboard → **Add New…** → **Project**  
2. **Import Git Repository**에서 방금 올린 저장소 선택 → **Import**  
3. 설정 확인  
   - **Framework Preset**: Next.js (자동)  
   - **Root Directory**: 비움  
   - **Build Command**: `next build`  
   - **Output Directory**: 비움  

4. **Environment Variables** 펼치기 → 아래 두 개 추가  

   | Name | Value | 적용 환경 |
   |------|--------|-----------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase 대시보드의 **Project URL** | Production, Preview |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** 키 | Production, Preview |

   (Supabase: 프로젝트 → **Settings** → **API** 에서 확인)

5. **Deploy** 클릭 → 1~3분 정도 기다리기  

### 2-4. 공유 링크 받기

- 배포가 끝나면 **Visit** 또는 상단 **Production URL**이 나옵니다.  
- 예: `https://coinness-community-xxxx.vercel.app`  
- 이 주소를 **그대로 카톡 등으로 공유**하면 됩니다.

### 2-5. `https://propview.vercel.app` 같은 주소 쓰고 싶을 때

1. Vercel 대시보드 → 해당 프로젝트 → **Settings** → **Domains**  
2. **Add** 에 `propview.vercel.app` 입력  
3. Vercel이 안내하는 대로 도메인 소유 확인(예: DNS에 CNAME 추가)  
4. 확인되면 이후 배포는 모두 `https://propview.vercel.app` 로 접속 가능  

---

## 3. Cursor에서 Vercel 연동 (선택)

- Cursor는 **Vercel GitHub 연동**만 있으면 됩니다.  
- 코드 수정 → **Git Commit** → **Push to GitHub** 하면 Vercel이 자동으로 다시 빌드·배포합니다.  
- Cursor 내에 “Vercel 배포” 전용 버튼은 없지만, **Git Push = 배포 트리거**로 쓰면 됩니다.

---

## 4. 환경 변수 정리 (배포 시 입력 위치)

| 변수명 | 어디서 쓰나요 | Vercel 입력 위치 |
|--------|----------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 로그인, API 호출 | 프로젝트 **Settings** → **Environment Variables** (Production, Preview 둘 다 권장) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 로그인, API 호출 | 위와 동일 |

- **주의**: 값 수정 후에는 **Redeploy** 한 번 해야 반영됩니다.

---

## 5. 배포된 링크에서 “오늘 수정한 내용” 확인하는 법

배포 URL 접속 후 아래만 빠르게 보면 됩니다.

| 확인 항목 | 어떻게 보나요 |
|-----------|----------------|
| **차트 비율** | 메인 화면에서 트레이딩뷰 차트가 랭킹·사이드바와 높이 맞고, 차트 가로가 넓게 보이는지 확인 |
| **모바일** | 스마트폰으로 같은 URL 접속 → 카드가 세로로 쌓이고, 상단은 햄버거 메뉴만 보이는지 확인 |
| **다크모드** | 우측 상단 다크 모드 전환 → 공지·가이드·텍스트가 잘 보이는지 확인 |
| **닉네임** | 로그인 후 사이드바에서 닉네임 변경 시도 → 성공/실패 메시지가 정상인지 확인 |

이렇게 확인하면 “차트 비율, 모바일, 다크모드, 닉네임” 수정이 배포본에 그대로 반영됐는지 알 수 있습니다.

---

## 6. 이후 수정사항 반영

1. 코드 수정 후 Cursor에서 **Commit** → **Push to GitHub**  
2. Vercel이 자동으로 새로 빌드·배포  
3. **같은 URL** 그대로 쓰면 되므로, 팀원들에게 링크 다시 보낼 필요 없음  

---

## 문제 해결

- **빌드 실패**: Vercel 대시보드 → **Deployments** → 해당 배포 → **Building** 로그 확인.  
- **로그인/API 안 됨**: 환경 변수 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값과 **Redeploy** 여부 확인.  
- **404/빈 화면**: 루트 주소(`/`)로 접속했는지 확인.  

이 순서대로 하시면 **공유 가능한 URL**을 만들고, 아빠·팀원들에게 초안 링크를 보낼 수 있습니다.
