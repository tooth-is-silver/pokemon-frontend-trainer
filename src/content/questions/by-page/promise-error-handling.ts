import type { QuestionPage } from "../types";

export const promiseErrorHandling: QuestionPage = {
  sourceId: "promise-error-handling",
  title: "프라미스와 에러 핸들링",
  url: "https://ko.javascript.info/promise-error-handling",
  questions: [
    {
      questionId: "promise-error-handling-yn-001",
      type: "yes_no",
      prompt: ".catch는 프라미스 체인에서 자신보다 위쪽에 있는 rejection을 처리할 수 있다.",
      answer: true,
      acceptedAnswers: ["예", "true"],
      conceptGroup: "js-promise-errors",
      explanation: "프라미스가 거부되면 제어 흐름은 가장 가까운 rejection 핸들러로 이동한다.",
      sourceExcerptId: "promise-error-handling-001",
    },
    {
      questionId: "promise-error-handling-yn-002",
      type: "yes_no",
      prompt:
        "Promise executor와 then 핸들러 안에서 던진 동기 에러는 rejected Promise처럼 처리될 수 있다.",
      answer: true,
      acceptedAnswers: ["예", "true"],
      conceptGroup: "js-promise-errors",
      explanation:
        "executor와 핸들러 주변에는 암시적 try...catch가 있어 동기 예외를 rejection으로 바꾼다.",
      sourceExcerptId: "promise-error-handling-002",
    },
    {
      questionId: "promise-error-handling-yn-003",
      type: "yes_no",
      prompt:
        "setTimeout 안에서 나중에 던진 에러도 Promise executor의 암시적 try...catch가 항상 잡는다.",
      answer: false,
      acceptedAnswers: ["아니오", "false"],
      conceptGroup: "js-promise-errors",
      explanation:
        "executor 실행이 끝난 뒤 비동기로 발생한 에러는 executor의 암시적 try...catch 범위 밖이다.",
      sourceExcerptId: "promise-error-handling-006",
    },
    {
      questionId: "promise-error-handling-mc-001",
      type: "multiple_choice",
      prompt: "프라미스 체인 끝에서 위쪽 에러를 한 번에 처리할 때 주로 쓰는 메서드는?",
      answer: "catch",
      choices: ["catch", "finally", "then", "resolve", "all"],
      conceptGroup: "js-promise-errors",
      explanation:
        "체인 끝의 catch는 위쪽 then 핸들러나 rejection에서 발생한 에러를 처리할 수 있다.",
      sourceExcerptId: "promise-error-handling-001",
    },
    {
      questionId: "promise-error-handling-mc-002",
      type: "multiple_choice",
      prompt: "catch에서 처리할 수 없는 에러를 다음 에러 핸들러로 넘길 때 사용하는 문법은?",
      answer: "throw error",
      choices: ["throw error", "return null", "finally error", "resolve error", "break error"],
      conceptGroup: "js-promise-errors",
      explanation:
        "catch 안에서 에러를 다시 던지면 가장 가까운 다음 에러 핸들러로 제어 흐름이 이동한다.",
      sourceExcerptId: "promise-error-handling-003",
    },
    {
      questionId: "promise-error-handling-mc-003",
      type: "multiple_choice",
      prompt: "브라우저에서 처리되지 않은 Promise rejection을 추적할 수 있는 이벤트는?",
      answer: "unhandledrejection",
      choices: [
        "unhandledrejection",
        "errorhandled",
        "promiseerror",
        "rejectioncatch",
        "asyncerror",
      ],
      conceptGroup: "js-promise-errors",
      explanation:
        "브라우저 환경에서는 unhandledrejection 이벤트로 처리되지 않은 거부를 감지할 수 있다.",
      sourceExcerptId: "promise-error-handling-005",
    },
    {
      questionId: "promise-error-handling-fb-001",
      type: "fill_blank",
      prompt: "Promise 체인에서 에러를 처리하는 대표 메서드는 ____ 이다.",
      answer: "catch",
      acceptedAnswers: ["catch", ".catch"],
      conceptGroup: "js-promise-errors",
      explanation: ".catch는 reject나 throw로 발생한 프라미스 에러를 처리한다.",
      sourceExcerptId: "promise-error-handling-001",
    },
    {
      questionId: "promise-error-handling-fb-002",
      type: "fill_blank",
      prompt: "catch 안에서 처리하지 못한 에러를 다시 넘기려면 ____ 문을 사용할 수 있다.",
      answer: "throw",
      acceptedAnswers: ["throw"],
      conceptGroup: "js-promise-errors",
      explanation: "throw를 사용해 에러를 다시 던지면 다음 rejection 핸들러로 전달된다.",
      sourceExcerptId: "promise-error-handling-003",
    },
    {
      questionId: "promise-error-handling-fb-003",
      type: "fill_blank",
      prompt: "브라우저에서 처리되지 않은 Promise rejection 이벤트 이름은 ____ 이다.",
      answer: "unhandledrejection",
      acceptedAnswers: ["unhandledrejection"],
      conceptGroup: "js-promise-errors",
      explanation:
        "catch가 없는 rejected Promise는 브라우저에서 unhandledrejection 이벤트로 추적할 수 있다.",
      sourceExcerptId: "promise-error-handling-005",
    },
  ],
};
