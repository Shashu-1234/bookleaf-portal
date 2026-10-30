import { AiProviderError } from "./errors";

const MAX_RETRY_DELAY_MS = 1_000;

export async function withProviderRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
): Promise<T> {
  const attempts = Math.max(1, Math.min(maxAttempts, 3));
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable = error instanceof AiProviderError && error.retryable;

      if (!retryable || attempt === attempts) {
        throw error;
      }

      const delayMs = Math.min(250 * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
