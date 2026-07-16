interface AuthCallbackErrorParams {
  errorCode: string | null;
  errorDescription: string | null;
}

interface AuthCallbackUrlResult {
  errorMessage: string | null;
  sanitizedUrl: string | null;
}

const AUTH_ERROR_PARAM_NAMES = ["error", "error_code", "error_description"];

export function getLoginErrorMessage(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorText(error);
  const normalizedMessage = message.toLowerCase();

  if (
    code === "email_address_invalid" ||
    (normalizedMessage.includes("email address") && normalizedMessage.includes("invalid"))
  ) {
    return "이메일 주소를 확인해주세요. 실제로 메일을 받을 수 있는 주소로 다시 시도해주세요.";
  }

  if (
    code.includes("rate") ||
    normalizedMessage.includes("rate") ||
    normalizedMessage.includes("too many")
  ) {
    return "짧은 시간에 로그인 메일 요청이 많았어요. 잠시 후 다시 시도해주세요.";
  }

  if (normalizedMessage.includes("redirect")) {
    return "로그인 리다이렉트 설정이 맞지 않아요. Supabase Redirect URL에 배포 주소가 등록되어 있는지 확인해주세요.";
  }

  if (normalizedMessage.includes("provider") || normalizedMessage.includes("disabled")) {
    return "Supabase 이메일 로그인이 꺼져 있어요. Email provider 설정을 확인해주세요.";
  }

  return message
    ? `로그인 메일을 보내지 못했어요. ${message}`
    : "로그인 메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.";
}

export function getAuthCallbackErrorMessage({
  errorCode,
  errorDescription,
}: AuthCallbackErrorParams) {
  if (!errorCode && !errorDescription) return null;

  const normalizedCode = errorCode?.toLowerCase() ?? "";
  const normalizedDescription = errorDescription?.toLowerCase() ?? "";

  if (normalizedDescription.includes("redirect")) {
    return "로그인 리다이렉트 설정이 맞지 않아요. Supabase Redirect URL과 이메일 템플릿을 확인해주세요.";
  }

  if (
    normalizedCode.includes("otp") ||
    normalizedDescription.includes("expired") ||
    normalizedDescription.includes("invalid")
  ) {
    return "로그인 링크가 만료됐거나 이미 사용됐어요. 새 로그인 링크를 다시 받아주세요.";
  }

  return errorDescription
    ? `로그인을 완료하지 못했어요. ${errorDescription}`
    : "로그인을 완료하지 못했어요. 새 로그인 링크를 다시 받아주세요.";
}

export function resolveAuthCallbackUrl(urlValue: string): AuthCallbackUrlResult {
  const url = new URL(urlValue);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const errorCode = url.searchParams.get("error_code") ?? hashParams.get("error_code");
  const errorDescription =
    url.searchParams.get("error_description") ?? hashParams.get("error_description");
  const errorMessage = getAuthCallbackErrorMessage({ errorCode, errorDescription });
  const removedSearchParams = removeAuthErrorParams(url.searchParams);
  const removedHashParams = removeAuthErrorParams(hashParams);

  if (removedHashParams) {
    const nextHash = hashParams.toString();
    url.hash = nextHash ? `#${nextHash}` : "";
  }

  return {
    errorMessage,
    sanitizedUrl: removedSearchParams || removedHashParams ? url.toString() : null,
  };
}

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : "";
}

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return "";

  const code = error.code;
  return typeof code === "string" ? code.toLowerCase() : "";
}

function removeAuthErrorParams(params: URLSearchParams) {
  let removed = false;

  AUTH_ERROR_PARAM_NAMES.forEach((paramName) => {
    if (!params.has(paramName)) return;

    params.delete(paramName);
    removed = true;
  });

  return removed;
}
