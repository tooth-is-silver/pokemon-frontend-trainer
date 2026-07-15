# Screen Flow

## 1. Screen List

- 메인 화면 (랜딩)
- 스타터 선택 화면
- 지역 화면
- 학습 화면
- 진화 모달
- 졸업 모달
- 도감 화면

## 2. Main Screen (Landing)

- 비로그인 상태에서 접근하는 첫 화면
- 서비스 로고 + 간략한 소개 + 목적 설명
- 스타터 포켓몬 애니메이션: 파이리 → 꼬부기 → 이상해씨 → 파이리 순환
  - 각 포켓몬이 JS 아이콘 또는 열매를 먹는 모션
  - GIF, SVG 애니메이션, 또는 CSS 애니메이션
- 로그인 버튼 (OAuth)
- 로그인 완료 시:
  - 스타터 미선택 → `/starter`로 이동
  - 스타터 선택 완료 → `/regions`로 이동

## 3. Starter Selection

- 최초 1회 스타터 선택
- 이상해씨, 파이리, 꼬부기 중 1마리 선택
- 선택 즉시 첫 포켓몬 instance 생성
- 도감 등록

## 4. Region Screen

표시 요소:

- 일러스트형 전체 지도
- 데스크톱/모바일용 맵 이미지 반응형 전환
- 지도 위 지역 마커 6개
- 각 지역의 지형, 설명, 예상 서식지
- 조우 확률 기본값 `50%`
- 도감 등록 수 기준 해금 조건
- 선택한 지역 요약
- 탐색 중 오버레이
- 조우 실패 결과 안내
- 조우 성공 결과 안내
- 지역별 탐색 대상 랜덤 문구

지역 해금:

- `초록 평원`: 기본 해금
- `물안개 해안`: 도감 5마리
- `용암 동굴`: 도감 12마리
- `달그림자 폐허`: 도감 20마리
- `얼음 궁전`: 도감 35마리
- `현대 도시`: 도감 50마리

다음 단계:

- 선택한 지역의 `탐색하기` 버튼에서 50% 조우 판정을 실행한다.
- 조우 실패 시 다시 탐색하거나 지도 보기로 돌아갈 수 있다.
- 조우 성공 시 성공 안내 팝업을 표시한다.
- 조우 성공 시 문제 풀이와 몬스터볼 포획 플로우로 진입한다.

## 5. Learning Screen

표시 요소:

- 현재 포켓몬 이미지
- 현재 포켓몬 이름
- 현재 EXP
- 문제 1개
- 답변 UI
- 오답 시 하단 해설 영역

답변 UI:

- `yes_no`: 예/아니오 버튼
- `multiple_choice`: 5개 보기
- `fill_blank`: 짧은 입력창

정답 시:

- EXP 즉시 갱신
- 필요 시 진화/졸업 트리거 계산
- 바로 다음 문제 이동

오답 시:

- 하단에 정답, 해설, 출처 링크 표시
- 이후 다음 문제 이동

## 6. Evolution Flow

1. 진화 가능 상태 감지
2. 진화 모달 표시
3. `진화한다`
4. 진화 시 포켓몬 데이터 갱신
5. 진화체 도감 등록
6. 학습 화면 복귀

## 7. Graduation Flow

1. 졸업 트리거
   - 다단 진화 종: 최종 진화체에서 EXP 100 도달
   - 무진화 종: EXP 50 도달
2. 학습 화면 위로 졸업 모달 오픈
3. 졸업 정보 표시 (졸업한 포켓몬·진화 라인·최종 EXP)
4. 후보 카드 (이미지 + 이름) 노출 → 1마리 선택
5. 새 instance 생성 → 도감 등록 → 현재 포켓몬 교체
6. 모달 닫고 학습 재개

후보 규칙:

- 일반 wave: 미등록 일반 1세대 1차 진화체(또는 무진화 종) 중 랜덤 3마리. 전설은 항상 제외.
- 풀이 후보 수보다 작으면 풀 그대로 노출 (예: wave1 마지막 1장).
- **풀 크기 = 1이면 선택창 없이 자동 해금** (안내만 표시 후 새 인스턴스 즉시 시작).
- 풀이 비면 다음 wave로 자동 전환 (정상 진행에서 풀 바닥 = 단계 종료 시점).
- 이브이 정책
  - 분기 진화 시 쥬피썬더/샤미드/부스터 중 직접 선택.
  - 도감 등록은 진화체 단위.
  - 도감 미완성 분기가 남아 있으면 졸업 모달 후보 풀에 이브이가 다시 등장한다.

## 8. Legendary Flow

1. 일반 1세대 도감 완성 (전설 5종 제외 146마리)
2. 전설 wave 1 자동 진입: 프리저/썬더/파이어 후보 풀 (3 → 2 → 1)
   - 풀 크기 = 1이면 선택창 없이 자동 해금
3. wave 1 모두 졸업 → wave 2로 전환 (뮤츠 단독, 자동 해금)
4. 뮤츠 졸업 → wave 3으로 전환 (뮤 단독, 자동 해금)
5. 뮤 졸업 → 엔딩

## 9. Pokedex Screen

- 1세대 도감 번호 (1~151)
- 획득/미획득 표시 (미획득은 실루엣)
- 현재 보유 포켓몬 카드 (헤더): 이미지·이름·진화 단계·EXP·진화/졸업 대기 뱃지
- 전설 해금 단계 안내 배너
- 일반 도감 완성률 / 전체 도감 진행률

## 10. Recommended Navigation

- `/starter`
- `/regions`
- `/learn`
- `/pokedex`

모달:

- `evolution-modal`
- `graduation-modal`

## 11. UI Component Structure

```text
src/
  components/
    pokemon/
      PokemonCard.tsx
      PokemonExp.tsx
      EvolutionModal.tsx
      EvolutionContent.tsx
      GraduationModal.tsx
    quiz/
      QuizCard.tsx
      YesNoQuestion.tsx
      MultipleChoiceQuestion.tsx
      FillBlankQuestion.tsx
      WrongAnswerPanel.tsx
    pokedex/
      PokedexGrid.tsx
      PokedexCard.tsx
  features/
    regions/
      RegionsPage.tsx
```
