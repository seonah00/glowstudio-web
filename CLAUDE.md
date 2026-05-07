# CLAUDE.md — GLOWSTUDIO AI 프로젝트 헌법

## 🎯 프로젝트 개요
- **서비스**: 북미 K-뷰티 TikTok 크리에이터를 위한 AI 콘텐츠 운영 플랫폼
- **스택**: React 18 + TypeScript + Vite + react-router-dom v6
- **API**: `https://glowstudio-api.up.railway.app/api`
- **라우팅**: HashRouter (`/#/`, `/#/discover`, `/#/generate`, `/#/analyze`)

---

## 🏗️ 하네스 워크플로우 (모든 작업에 적용)

### 작업 진행 3단계 구조
```
1. 플래너  → 스펙 정의 + 스프린트 분리 → 사람 승인 대기
2. 생성자  → 스프린트 단위 구현
3. 평가자  → 완료 기준 체크 + 버그 확인
```

### 반드시 지켜야 할 절차
- **큰 작업은 반드시 스프린트로 쪼갠 뒤 승인을 받고 시작한다**
- **각 스프린트 완료 후 결과를 보고하고, 다음 스프린트 진행 여부를 묻는다**
- **절대 한 번에 모든 것을 구현하려 하지 않는다**

---

## ✅ 코딩 컨벤션 (DO)

### 컴포넌트
- 함수형 컴포넌트만 사용 (`function Foo()` 형식, 화살표 함수 지양)
- Props 타입은 반드시 `interface`로 정의
- 컴포넌트 파일 상단에 import → interface → component 순서 유지

### 스타일링
- 인라인 스타일(`style={{}}`) 사용 (외부 CSS 라이브러리 도입 금지)
- 색상 변수: `#FF6B6B` (코랄), `#FF8E53` (오렌지), `#08080C` (배경), `#fff` (텍스트)
- 그라디언트: `linear-gradient(135deg, #FF6B6B, #FF8E53)`

### API 호출
- 모든 fetch에 `AbortSignal.timeout(10000)` 적용 필수
- try/catch로 감싸고 반드시 샘플 데이터 폴백 처리
- API 연결 상태를 UI에 표시 (초록/빨강 인디케이터)

### TypeScript
- `any` 타입 사용 금지 → `unknown` 또는 명시적 타입 사용
- 모든 인터페이스는 파일 상단에 정의

---

## ❌ 절대 하면 안 되는 것 (DON'T)

- `any` 타입 사용 금지
- `console.log` 디버그 코드를 커밋에 포함하지 않기
- 외부 UI 라이브러리(MUI, Chakra 등) 무단 추가 금지
- 한 번의 작업에서 3개 이상의 파일을 동시에 수정하지 않기
- API 키나 시크릿을 코드에 하드코딩 금지
- 승인 없이 폴더 구조나 라우팅 구조 변경 금지
- 오타 수정 없이 한국어 텍스트 임의 변경 금지

---

## 📁 프로젝트 구조

```
glowstudio-web/
├── src/
│   ├── App.tsx          # 메인 앱 (Home, Discover, Generate, Analyze 페이지 포함)
│   ├── index.css        # 전역 스타일 (최소한으로 유지)
│   ├── main.tsx         # 진입점
│   └── vite-env.d.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── CLAUDE.md            # 이 파일
```

---

## 🚦 인간 승인 게이트 (Human-in-the-Loop)

아래 시점에서는 **반드시 멈추고 사람의 확인을 기다린다**:

| 시점 | 확인 내용 |
|------|-----------|
| 새 페이지 추가 전 | 라우팅 구조, 컴포넌트 설계 승인 |
| API 연동 구조 변경 전 | 엔드포인트, 데이터 구조 확인 |
| 폴더/파일 구조 변경 전 | 구조 변경 사유 설명 + 승인 |
| 의존성(패키지) 추가 전 | 추가 이유 설명 + 승인 |
| 배포 관련 작업 전 | 반드시 확인 |

---

## 🔁 세션 종료 시 루틴

작업이 끝날 때마다 아래를 수행한다:

1. 이번 세션에서 발견한 버그나 패턴을 이 CLAUDE.md에 추가
2. 해결하지 못한 이슈는 `## 📝 미해결 이슈` 섹션에 기록
3. 다음 세션 시작 시 이 파일을 먼저 읽고 컨텍스트를 복원

---

## 📝 미해결 이슈

- TikTok API(`/tiktok/search`) 실 데이터 연동 미확인 → Railway 서버 상태 점검 필요
- Generate 페이지 AI 스크립트 생성 API(`/generate/script`) 실 연동 미확인
- Analyze 페이지 URL 분석 API(`/analyze`) 실 연동 미확인

---

## 💡 작업 지시 템플릿

```
[작업명]: OOO 기능 추가

목표: ~을 구현한다
범위: App.tsx의 Discover 컴포넌트만 수정
제약: 기존 스타일 시스템 유지, API 폴백 필수
스프린트:
  1. 설계안 작성 → 승인 대기
  2. UI 구현
  3. API 연동
  4. 테스트 및 보고
```
