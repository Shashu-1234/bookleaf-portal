import { GoogleGenAI } from "@google/genai";

import { AiProviderError, mapUnknownProviderError } from "../errors";
import { withProviderRetry } from "../retry";
import type {
  AiProvider,
  ProviderGeneration,
  StructuredGenerationRequest,
} from "../types";

export interface GeminiProviderOptions {
  apiKey: string;
  model: string;
}

export class GeminiProvider implements AiProvider {
  readonly name = "gemini" as const;
  readonly model: string;
  private readonly client: GoogleGenAI;

  constructor(options: GeminiProviderOptions) {
    this.model = options.model;
    this.client = new GoogleGenAI({ apiKey: options.apiKey });
  }

  async generateStructured<T>(
    request: StructuredGenerationRequest<T>,
  ): Promise<ProviderGeneration<T>> {
    return withProviderRetry(async () => {
      const startedAt = performance.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

      try {
        const response = await this.client.models.generateContent({
          model: this.model,
          contents: request.prompt,
          config: {
            systemInstruction: request.systemInstruction,
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            responseMimeType: "application/json",
            responseJsonSchema: request.jsonSchema,
            abortSignal: controller.signal,
          },
        });

        if (!response.text) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Gemini returned no structured response. Continue with manual review.",
            true,
          );
        }

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(response.text);
        } catch (error) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Gemini returned malformed JSON. Continue with manual review.",
            true,
            undefined,
            { cause: error },
          );
        }

        const validated = request.schema.safeParse(parsedJson);
        if (!validated.success) {
          throw new AiProviderError(
            "INVALID_RESPONSE",
            "Gemini response did not satisfy the application schema. Continue with manual review.",
            true,
            undefined,
            { cause: validated.error },
          );
        }

        return {
          data: validated.data,
          metadata: {
            provider: this.name,
            model: response.modelVersion ?? this.model,
            durationMs: Math.round(performance.now() - startedAt),
            requestId: response.responseId,
            usage: {
              inputTokens: response.usageMetadata?.promptTokenCount,
              outputTokens: response.usageMetadata?.candidatesTokenCount,
              totalTokens: response.usageMetadata?.totalTokenCount,
            },
          },
        };
      } catch (error) {
        throw mapUnknownProviderError("Gemini", error);
      } finally {
        clearTimeout(timeout);
      }
    }, request.maxAttempts);
  }
}
