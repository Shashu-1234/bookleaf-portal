import { AiProviderError, mapHttpError, mapUnknownProviderError } from "../errors";
import { withProviderRetry } from "../retry";
import type {
  AiProvider,
  ProviderGeneration,
  StructuredGenerationRequest,
} from "../types";

interface OllamaResponse {
  model?: string;
  message?: { content?: string };
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaProviderOptions {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements AiProvider {
  readonly name = "ollama" as const;
  readonly model: string;
  private readonly baseUrl: string;

  constructor(options: OllamaProviderOptions) {
    this.model = options.model;
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
  }

  async generateStructured<T>(
    request: StructuredGenerationRequest<T>,
  ): Promise<ProviderGeneration<T>> {
    return withProviderRetry(async () => {
      const startedAt = performance.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

      try {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: this.model,
            stream: false,
            messages: [
              { role: "system", content: request.systemInstruction },
              {
                role: "user",
                content: `${request.prompt}\n\nReturn JSON matching this schema:\n${JSON.stringify(request.jsonSchema)}`,
              },
            ],
            format: request.jsonSchema,
            options: { temperature: request.temperature },
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw mapHttpError("Ollama", response.status, message);
        }

        const payload = (await response.json()) as OllamaResponse;
        const content = payload.message?.content;
        if (!content) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Ollama returned no structured response. Continue with manual review.",
            true,
          );
        }

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(content);
        } catch (error) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Ollama returned malformed JSON. Continue with manual review.",
            true,
            undefined,
            { cause: error },
          );
        }

        const validated = request.schema.safeParse(parsedJson);
        if (!validated.success) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Ollama response did not satisfy the application schema. Continue with manual review.",
            true,
            undefined,
            { cause: validated.error },
          );
        }

        const inputTokens = payload.prompt_eval_count;
        const outputTokens = payload.eval_count;

        return {
          data: validated.data,
          metadata: {
            provider: this.name,
            model: payload.model ?? this.model,
            durationMs: Math.round(performance.now() - startedAt),
            usage: {
              inputTokens,
              outputTokens,
              totalTokens:
                inputTokens !== undefined && outputTokens !== undefined
                  ? inputTokens + outputTokens
                  : undefined,
            },
          },
        };
      } catch (error) {
        throw mapUnknownProviderError("Ollama", error);
      } finally {
        clearTimeout(timeout);
      }
    }, request.maxAttempts);
  }
}
