# [PRD] Monthly Check (먼슬리 체크)

## 1. 프로젝트 개요
* **프로젝트 이름**: Monthly Check (먼슬리 체크)
* **한 줄 설명**: 30일간의 습관 이행률을 한눈에 파악하는 데이터 시각화 플래너
* **개발 난이도**: 보통 (Level 2)

## 2. 사용자 시나리오
* **누가**: 성취감을 중시하는 자기계발러 및 루틴 형성이 필요한 사용자
* **언제**: 매일 저녁(실행 체크), 매월 말/초(계획 및 회고)
* **왜**: 매일의 작은 반복을 시각화된 그래프로 확인하여 지속적인 동기부여를 얻기 위함
* **환경**: 
    * **Mobile**: 이동 중 혹은 침대 위에서 터치 한 번으로 빠르게 체크 (즉시성)
    * **PC**: 큰 화면에서 한 달간의 데이터를 상세 분석하고 새 달의 목표 등록 (생산성)

## 3. 핵심 기능 목록
* **습관 관리**: 한 달 단위 습관 CRUD 및 **전월 습관 복사** 기능
* **체크보드**: 1일부터 말일까지의 그리드 시스템, **동그란 버튼 형태**의 UI
* **데이터 시각화**: 월별 성취도 추이(Line Chart), 습관별 비중(Bar Chart), 열정 히트맵
* **월별 조회**: 월 단위 셀렉터를 통한 과거/현재 데이터 자유 전환
* **반응형 레이아웃**: PC/모바일 최적화 (모바일은 날짜 가로 스크롤 지원)

## 4. 기술 스택
* **Frontend**: Next.js (App Router)
* **Database**: SQLite (Local) / Turso (Production, Vercel 호환용)
* **ORM**: Prisma 또는 Drizzle ORM
* **Styling**: Tailwind CSS + Shadcn/ui
* **Charts**: Recharts
* **Deployment**: Vercel

## 5. 화면 구성
### (1) 메인 대시보드 (Monthly Board)
* **좌측 열**: 습관 이름 (모바일에서 고정/Sticky)
* **중앙 그리드**: 1일~말일 버튼 (동그란 형태, 클릭 시 색상 충전)
* **상단 바**: 월 선택 셀렉터, 전월 복사 버튼, 습관 추가 버튼

### (2) 통계 및 분석 뷰 (Analytics)
* **성취도 추이**: 월간 달성률 변화를 보여주는 꺾은선 그래프
* **습관 랭킹**: 어떤 습관을 가장 잘 지켰는지 비교하는 바 차트
* **히트맵**: 실천 강도를 색상 농도로 표현

### (3) 관리 모달
* 습관 이름 입력, 목표 설정 및 삭제 레이어

## 6. 상세 기능 명세
### (1) 데이터베이스 구조 (Schema)
```sql
CREATE TABLE habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_month CHAR(7) NOT NULL, -- 예: '2026-04'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE completions (
    habit_id INTEGER,
    check_date DATE NOT NULL, -- 예: '2026-04-17'
    is_completed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (habit_id, check_date),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);
```
### (2) 핵심 로직
* **전월 복사**: `target_month - 1`의 습관 목록을 신규 월로 데이터만 복제 (기록은 제외)
* **모바일 UX**: 날짜 그리드 영역에 `overflow-x: auto` 적용, 오늘(Today) 날짜 강조 및 자동 포커싱

## 7. 디자인 가이드 (Modern Sophisticated)
* **스타일**: Soft-UI, Glassmorphism(배경 흐림) 활용
* **컬러**: 
    * Primary: `#6366F1` (Indigo Blue - 완료 상태)
    * Success: `#10B981` (Emerald - 차트 강조)
    * Base: `#F8FAFC` (Slate - 배경)
* **컴포넌트**: 24-28px 크기의 원형 체크 버튼, 부드러운 애니메이션 효과
* **폰트**: Inter 또는 Pretendard (Tabular Figures 설정 적용)

## 8. 제약 사항
* **데이터 영속성**: Vercel 배포 시 Turso(External SQLite) 사용 필수
* **시간대 처리**: 데이터 저장 시 UTC 기준, 출력 시 로컬 타임존 변환
* **성능**: 모바일 가로 스크롤 시 렌더링 최적화(Optimistic UI 적용 권장)

