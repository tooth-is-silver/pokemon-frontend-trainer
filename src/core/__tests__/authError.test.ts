import { describe, expect, it } from "vitest";
import { getAuthCallbackErrorMessage, getLoginErrorMessage } from "@/core/authError";

describe("getLoginErrorMessage", () => {
  it("잘못된 이메일 오류를 안내 문구로 변환한다", () => {
    expect(getLoginErrorMessage({ code: "email_address_invalid" })).toContain(
      "이메일 주소를 확인해주세요.",
    );
  });

  it("요청 제한 오류를 안내 문구로 변환한다", () => {
    expect(getLoginErrorMessage(new Error("Too many requests"))).toContain(
      "잠시 후 다시 시도해주세요.",
    );
  });

  it("알 수 있는 오류 메시지는 기본 안내에 포함한다", () => {
    expect(getLoginErrorMessage(new Error("Network failed"))).toBe(
      "로그인 메일을 보내지 못했어요. Network failed",
    );
  });
});

describe("getAuthCallbackErrorMessage", () => {
  it("오류 파라미터가 없으면 메시지를 만들지 않는다", () => {
    expect(
      getAuthCallbackErrorMessage({
        errorCode: null,
        errorDescription: null,
      }),
    ).toBeNull();
  });

  it("만료된 로그인 링크를 다시 요청하도록 안내한다", () => {
    expect(
      getAuthCallbackErrorMessage({
        errorCode: "otp_expired",
        errorDescription: "Email link is expired",
      }),
    ).toContain("새 로그인 링크를 다시 받아주세요.");
  });

  it("리다이렉트 오류의 설정 위치를 안내한다", () => {
    expect(
      getAuthCallbackErrorMessage({
        errorCode: "validation_failed",
        errorDescription: "Redirect URL is invalid",
      }),
    ).toContain("Supabase Redirect URL과 이메일 템플릿");
  });
});
