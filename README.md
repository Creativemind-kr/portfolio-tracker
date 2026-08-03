# portfolio-tracker

포폴반(포트폴리오반) 수강생들의 작업을 WBS 단위로 관리하는 강사 전용 도구. Next.js (App Router) + Firebase Admin SDK/Firestore.

## 초기 설정

1. **Firebase 프로젝트 생성**
   - [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트 생성
   - Firestore Database 생성 (프로덕션 모드)
   - 프로젝트 설정 > 서비스 계정 > "새 비공개 키 생성"으로 JSON 키 발급
   - `firebase deploy --only firestore:rules` 또는 콘솔에서 이 저장소의 `firestore.rules` 내용을 그대로 붙여넣어 배포 (클라이언트 SDK를 쓰지 않으므로 전체 거부 규칙)

2. **환경변수 설정**
   - `.env.local.example`을 `.env.local`로 복사
   - Firebase 서비스 계정 JSON에서 `project_id`, `client_email`, `private_key` 값을 채움
   - `AUTH_PEPPER`, `SESSION_SECRET`에 임의의 긴 랜덤 문자열 설정
   - `ADMIN_ID`에 원하는 관리자 아이디 설정
   - `node scripts/hash-password.ts <비밀번호>` 실행 결과를 `ADMIN_PASSWORD_HASH`에 붙여넣기 (AUTH_PEPPER를 먼저 `.env.local`에 설정한 뒤, 같은 값을 셸 환경변수로도 export하고 실행해야 동일한 해시가 나옴)

3. **로컬 실행**

   ```bash
   npm install
   npm run dev
   ```

   http://localhost:3000 접속 → `/login`으로 리다이렉트됨.

## 배포

- GitHub 원격 저장소 생성 및 Vercel 프로젝트 연결은 별도 진행
- Vercel 환경변수에 `.env.local`과 동일한 키를 등록
