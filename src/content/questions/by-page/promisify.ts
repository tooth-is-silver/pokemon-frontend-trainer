import type { QuestionPage } from "@/content/questions/types";

export const promisify: QuestionPage = {
  sourceId: "promisify",
  title: "프라미스화",
  url: "https://ko.javascript.info/promisify",
  questions: [
    {
      questionId: "promisify-yn-001",
      type: "yes_no",
      prompt: "프라미스화는 콜백을 받는 함수를 Promise를 반환하는 함수로 바꾸는 것이다.",
      answer: true,
      acceptedAnswers: ["예", "true"],
      conceptGroup: "js-promisify",
      explanation:
        "프라미스화는 콜백 기반 API를 Promise 기반 API처럼 사용할 수 있게 감싸는 방식이다.",
      sourceExcerptId: "promisify-001",
    },
    {
      questionId: "promisify-yn-003",
      type: "yes_no",
      prompt: "프라미스화는 여러 번 호출되는 콜백에도 모든 결과를 순서대로 계속 전달한다.",
      answer: false,
      acceptedAnswers: ["아니오", "false"],
      conceptGroup: "js-promisify",
      explanation:
        "Promise는 하나의 결과만 가지므로, 프라미스화는 콜백을 한 번만 호출하는 함수에 적합하다.",
      sourceExcerptId: "promisify-006",
    },
    {
      questionId: "promisify-mc-001",
      type: "multiple_choice",
      prompt: "콜백 기반 함수를 Promise 기반 함수처럼 감싸는 작업을 무엇이라고 부르는가?",
      answer: "프라미스화",
      choices: ["프라미스화", "직렬화", "구조 분해", "메모이제이션", "이터레이션"],
      conceptGroup: "js-promisify",
      explanation: "콜백을 받는 함수를 Promise를 반환하는 함수로 바꾸는 것을 프라미스화라고 한다.",
      sourceExcerptId: "promisify-001",
    },
    {
      questionId: "promisify-mc-002",
      type: "multiple_choice",
      prompt: "Node.js에서 프라미스화를 돕는 내장 함수로 언급되는 것은?",
      answer: "util.promisify",
      choices: ["util.promisify", "Promise.all", "JSON.stringify", "Object.assign", "Array.from"],
      conceptGroup: "js-promisify",
      explanation:
        "Node.js에서는 콜백 기반 함수를 Promise 기반으로 감싸기 위해 util.promisify를 사용할 수 있다.",
      sourceExcerptId: "promisify-005",
    },
    {
      questionId: "promisify-mc-003",
      type: "multiple_choice",
      prompt:
        "프라미스화한 함수에서 콜백의 성공 결과가 여러 개라면 결과를 배열로 받게 할 수 있는 옵션 예시는?",
      answer: "manyArgs",
      choices: ["manyArgs", "thisArg", "spreadOnly", "errorFirst", "asyncOnly"],
      conceptGroup: "js-promisify",
      explanation:
        "예시의 promisify(f, true)는 여러 성공 결과를 배열로 resolve하도록 manyArgs 옵션을 둔다.",
      sourceExcerptId: "promisify-004",
    },
    {
      questionId: "promisify-fb-001",
      type: "fill_blank",
      prompt: "콜백 기반 함수를 Promise 기반 함수로 바꾸는 작업을 ____ 라고 한다.",
      answer: "프라미스화",
      acceptedAnswers: ["프라미스화", "promisification", "promisify"],
      conceptGroup: "js-promisify",
      explanation: "프라미스화는 콜백을 받는 함수를 Promise를 반환하는 함수로 바꾸는 작업이다.",
      sourceExcerptId: "promisify-001",
    },
    {
      questionId: "promisify-fb-002",
      type: "fill_blank",
      prompt: "error-first 콜백에서 에러가 있으면 Promise는 ____ 되어야 한다.",
      answer: "reject",
      acceptedAnswers: ["reject", "rejected", "거부"],
      conceptGroup: "js-promisify",
      explanation:
        "커스텀 콜백은 err가 있으면 reject(err)를 호출하고, 성공하면 resolve(result)를 호출한다.",
      sourceExcerptId: "promisify-003",
    },
    {
      questionId: "promisify-fb-003",
      type: "fill_blank",
      prompt: "Node.js에서 제공하는 프라미스화 도우미는 util.____ 이다.",
      answer: "promisify",
      acceptedAnswers: ["promisify", "util.promisify"],
      conceptGroup: "js-promisify",
      explanation: "Node.js에서는 util.promisify로 콜백 기반 함수를 Promise 기반으로 감쌀 수 있다.",
      sourceExcerptId: "promisify-005",
    },
  ],
};
