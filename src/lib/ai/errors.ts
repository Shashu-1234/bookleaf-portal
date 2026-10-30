import type { ManualReviewCode, ManualReviewReason } from "./types";

export class AiProviderError extends Error {
  constructor(
    public readonly code: ManualReviewCode,
    message: string,
    public readonly retryable: boolean,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "AiProviderError";
  }
}

export function toManualReviewReason(error: unknown): ManualReviewReason {
  if (error instanceof AiProviderError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    };
  }

  return {
    code: "UNKNOWN_PROVIDER_ERROR",
    message: "AI assistance is temporarily unavailable. Continue with manual review.",
    retryable: true,
  };
}

export function mapHttpError(
  providerLabel: string,
  status: number,
  responseMessage?: string,
): AiProviderError {
  const safeMessage = responseMessage?.slice(0, 240);

  if (status === 401 || status === 403) {
    return new AiProviderError(
      "AUTHENTICATION_FAILED",
      `${providerLabel} authentication failed. Continue with manual review.`,
      false,
      status,
    );
  }

  if (status === 429) {
    return new AiProviderError(
      "RATE_LIMITED",
      `${providerLabel} rate limit reached. Retry later or continue manually.`,
      true,
      status,
    );
  }

  if (status >= 500) {
    return new AiProviderError(
      "PROVIDER_UNAVAILABLE",
      `${providerLabel} is temporarily unavailable. Continue with manual review.`,
      true,
      status,
    );
  }

  return new AiProviderError(
    "PROVIDER_UNAVAILABLE",
    safeMessage
      ? `${providerLabel} rejected the request: ${safeMessage}`
      : `${providerLabel} rejected the request. Continue with manual review.`,
    false,
    status,
  );
}

export function mapUnknownProviderError(
  providerLabel: string,
  error: unknown,
): AiProviderError {
  if (error instanceof AiProviderError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new AiProviderError(
      "TIMEOUT",
      `${providerLabel} did not respond before the timeout. Continue with manual review.`,
      true,
      undefined,
      { cause: error },
    );
  }

  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : undefined;

  if (status && Number.isFinite(status)) {
    return mapHttpError(providerLabel, status);
  }

  return new AiProviderError(
    "PROVIDER_UNAVAILABLE",
    `${providerLabel} could not complete the request. Continue with manual review.`,
    true,
    undefined,
    error instanceof Error ? { cause: error } : undefined,
  );
}
