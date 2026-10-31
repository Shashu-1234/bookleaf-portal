import { GeminiProvider } from "./providers/gemini";
import { OllamaProvider } from "./providers/ollama";
import { TicketAiService } from "./service";
import type { ManualReviewReason } from "./types";

type AiEnvironment = Partial<
  Record<
    | "AI_PROVIDER"
    | "AI_TIMEOUT_MS"
    | "AI_MAX_ATTEMPTS"
    | "GEMINI_API_KEY"
    | "GEMINI_MODEL"
    | "OLLAMA_BASE_URL"
    | "OLLAMA_MODEL",
    string | undefined
  >
>;

function parseBoundedInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
}

function notConfigured(message: string): ManualReviewReason {
  return { code: "AI_NOT_CONFIGURED", message, retryable: false };
}

export function createTicketAiService(
  environment: AiEnvironment = process.env as AiEnvironment,
): TicketAiService {
  const providerName = environment.AI_PROVIDER?.trim().toLowerCase() ?? "manual";
  const timeoutMs = parseBoundedInteger(environment.AI_TIMEOUT_MS, 15_000, 1_000, 60_000);
  const maxAttempts = parseBoundedInteger(environment.AI_MAX_ATTEMPTS, 2, 1, 3);

  if (providerName === "gemini") {
    if (!environment.GEMINI_API_KEY) {
      return new TicketAiService({
        provider: null,
        timeoutMs,
        maxAttempts,
        unavailableReason: notConfigured(
          "Gemini is selected but GEMINI_API_KEY is missing. Continue with manual review.",
        ),
      });
    }

    return new TicketAiService({
      provider: new GeminiProvider({
        apiKey: environment.GEMINI_API_KEY,
        model: environment.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
      }),
      timeoutMs,
      maxAttempts,
    });
  }

  if (providerName === "ollama") {
    return new TicketAiService({
      provider: new OllamaProvider({
        baseUrl: environment.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
        model: environment.OLLAMA_MODEL ?? "gpt-oss",
      }),
      timeoutMs,
      maxAttempts,
    });
  }

  return new TicketAiService({
    provider: null,
    timeoutMs,
    maxAttempts,
    unavailableReason: {
      code: "AI_DISABLED",
      message: "AI assistance is disabled. Continue with manual review.",
      retryable: false,
    },
  });
}
