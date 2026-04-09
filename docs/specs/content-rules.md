# Content Rules

## 1. Source Policy

- 문제 출처는 `ko.javascript.info` 전체
- 모든 문제는 반드시 특정 페이지 근거를 가져야 함
- 문서에 없는 내용으로 문제를 만들지 않음

## 2. Question Types

- `yes_no`
- `multiple_choice`
- `fill_blank`

주관식 자유 서술형은 MVP 범위 밖

## 3. Writing Rules

- 질문은 짧고 퀴즈형이어야 함
- 한 문항에는 하나의 핵심 개념만 담음
- 긴 설명형 질문 금지
- 한 페이지에서 여러 문제 생성 가능
- 페이지 내용량이 많을수록 더 많은 문제 생성 가능
- 학습 UI에서는 한 번에 문제 1개만 표시

## 4. Fill Blank Rules

- 자유 해석하지 않음
- `acceptedAnswers` 배열 비교로 판정
- 한글/영문 허용 답안 모두 저장 가능
- 비교 전 `trim`, 공백 정리, 소문자 변환 적용

## 5. Multiple Choice Rules

- 보기 수는 항상 5개
- 오답 보기는 같은 문제 타입과 비슷한 개념군 안에서 추출
- 다른 문항 정답 후보를 오답 풀로 재사용 가능

## 6. Wrong Answer Display

- 오답 시 현재 화면 하단에 표시
- 정답
- 짧은 해설
- 출처 링크

## 7. Question Authoring Flow

1. `ko.javascript.info` 페이지 1개 선택
2. 핵심 문장 추출
3. source data 작성
4. 문제 생성
5. 정답/허용답안/보기 검수
