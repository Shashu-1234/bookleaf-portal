import { describe, expect, it } from "vitest";

import { AiProviderError } from "./errors";
import { TicketAiService } from "./service";
import type {
  AiProvider,
  ProviderGeneration,
  StructuredGenerationRequest,
  TicketInput,
} from "./types";

const ticket: TicketInput = {
  ticketId: "TKT-001",
  subject: "Royalty not received",
  description: "My payment has been pending for six months.",
  createdAt: "2026-10-29T08:00:00.000Z",
  authorName: "Demo Author",
  book: null,
};

class FakeProvider implements AiProvider {
  readonly name = "gemini" as const;
  readonly model = "fake-model";

  constructor(
    private readonly response: unknown,
    private readonly failure?: AiProviderError,
  ) {}

  async generateStructured<T>(
    request: StructuredGenerationRequest<T>,
  ): Promise<ProviderGeneration<T>> {
    if (this.failure) throw this.failure;

    return {
      data: request.schema.parse(this.response),
      metadata: {
        provider: this.name,
        model: this.model,
        durationMs: 12,
        usage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 },
      },
    };
  }
}

describe("TicketAiService", () => {
  it("returns a validated analysis and always requires human review", async () => {
    const service = new TicketAiService({
      provider: new FakeProvider({
        category: "Royalty & Payments",
        priority: "High",
        confidence: 0.94,
        rationale: "The author reports a materially overdue royalty payment.",
        urgencySignals: ["six months pending"],
        needsHumanEscalation: true,
      }),
    });

    const result = await service.analyzeTicket(ticket);

    expect(result.status).toBe("completed");
    expect(result.humanReviewRequired).toBe(true);
    if (result.status === "completed") {
      expect(result.data.category).toBe("Royalty & Payments");
      expect(result.metadata.usage?.totalTokens).toBe(120);
    }
  });

  it("keeps the workflow manual when AI is disabled", async () => {
    const service = new TicketAiService({ provider: null });

    const result = await service.analyzeTicket(ticket);

    expect(result).toMatchObject({
      status: "manual_review_required",
      humanReviewRequired: true,
      reason: { code: "AI_DISABLED", retryable: false },
    });
  });

  it("degrades gracefully when a provider is rate limited", async () => {
    const service = new TicketAiService({
      provider: new FakeProvider(
        null,
        new AiProviderError("RATE_LIMITED", "Rate limit reached.", true, 429),
      ),
    });

    const result = await service.analyzeTicket(ticket);

    expect(result).toMatchObject({
      status: "manual_review_required",
      humanReviewRequired: true,
      reason: { code: "RATE_LIMITED", retryable: true },
    });
  });
});
