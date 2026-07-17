import { describe, expect, it } from "vitest";
import {
  getAuthCallbackErrorMessage,
  getLoginErrorMessage,
  resolveAuthCallbackUrl,
} from "@/core/authError";

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

describe("resolveAuthCallbackUrl", () => {
  it("쿼리의 인증 오류를 읽고 다른 URL 정보는 유지한다", () => {
    const result = resolveAuthCallbackUrl(
      "https://example.com/?source=email&error_code=otp_expired&error_description=Email%20link%20expired#section",
    );

    expect(result.errorMessage).toContain("새 로그인 링크를 다시 받아주세요.");
    expect(result.sanitizedUrl).toBe("https://example.com/?source=email#section");
  });

  it("해시의 인증 오류만 제거하고 다른 해시 값은 유지한다", () => {
    const result = resolveAuthCallbackUrl(
      "https://example.com/#next=%2Flearn&error_code=otp_expired&error_description=Expired",
    );

    expect(result.errorMessage).toContain("새 로그인 링크를 다시 받아주세요.");
    expect(result.sanitizedUrl).toBe("https://example.com/#next=%2Flearn");
  });

  it("인증 오류가 없으면 URL을 변경하지 않는다", () => {
    expect(resolveAuthCallbackUrl("https://example.com/?source=email#section")).toEqual({
      errorMessage: null,
      sanitizedUrl: null,
    });
  });
});
