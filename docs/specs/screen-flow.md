# Screen Flow

## 1. Screen List

- 스타터 선택 화면
- 학습 화면
- 진화 모달 또는 진화 페이지
- 신규 포켓몬 선택 모달 또는 페이지
- 도감 화면
- 내 포켓몬 화면

## 2. Starter Selection

- 최초 1회 스타터 선택
- 이상해씨, 파이리, 꼬부기 중 1마리 선택
- 선택 즉시 첫 포켓몬 instance 생성
- 도감 등록

## 3. Learning Screen

표시 요소:

- 현재 포켓몬 이미지
- 현재 포켓몬 이름
- 현재 스탯 4종
- 문제 1개
- 답변 UI
- 오답 시 하단 해설 영역

답변 UI:

- `yes_no`: 예/아니오 버튼
- `multiple_choice`: 5개 보기
- `fill_blank`: 짧은 입력창

정답 시:

- 스탯 즉시 갱신
- 필요 시 진화/선택 트리거 계산
- 바로 다음 문제 이동

오답 시:

- 하단에 정답, 해설, 출처 링크 표시
- 이후 다음 문제 이동

## 4. Evolution Flow

1. 진화 가능 상태 감지
2. 진화 모달 또는 전용 페이지 표시
3. `진화한다` 또는 `보류`
4. 진화 시 포켓몬 데이터 갱신
5. 진화체 도감 등록
6. 학습 화면 복귀

## 5. New Pokemon Selection Flow

1. 후보 2마리 생성
2. 선택 모달 또는 페이지 표시
3. 2마리 중 1마리 선택
4. 새 instance 생성
5. 도감 등록
6. active 포켓몬 전환
7. 학습 화면 복귀

후보 규칙:

- 미등록 일반 포켓몬 우선
- 전설 제외
- 후보 부족 시에만 중복 허용

## 6. Legendary Flow

1. 일반 도감 완성
2. 전설 선택창 오픈
3. 프리저/썬더/파이어 육성
4. 3마리 모두 100 졸업
5. 뮤츠 선택 가능
6. 뮤츠 졸업 후 뮤 선택 가능

## 7. Pokedex Screen

- 1세대 도감 번호
- 획득 여부
- 현재 형태 이미지
- 전설 해금 상태

## 8. Recommended Navigation

- `/starter`
- `/learn`
- `/pokedex`
- `/pokemon`

모달:

- `evolution-modal`
- `pokemon-selection-modal`

## 9. UI Component Structure

```text
src/
  components/
    pokemon/
      PokemonCard.tsx
      PokemonImage.tsx
      PokemonStats.tsx
      EvolutionModal.tsx
      PokemonSelectionModal.tsx
    quiz/
      QuizCard.tsx
      YesNoQuestion.tsx
      MultipleChoiceQuestion.tsx
      FillBlankQuestion.tsx
      WrongAnswerPanel.tsx
    pokedex/
      PokedexGrid.tsx
      PokedexCard.tsx
    common/
      Button.tsx
      Modal.tsx
      ProgressBar.tsx
      ScreenLayout.tsx
```
