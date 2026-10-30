import { describe, expect, it } from "vitest";

import { TicketAiService } from "./service";
import type { TicketAnalysis } from "./schemas";
import type { AiProvider, ProviderGeneration, StructuredGenerationRequest } from "./types";
import { runDraftRegeneration, runTicketAiWorkflow } from "./workflow";

class SequentialProvider implements AiProvider {
  readonly name = "gemini" as const;
  readonly model = "test-model";
  private index = 0;

  constructor(private readonly responses: unknown[]) {}

  async generateStructured<T>(request: StructuredGenerationRequest<T>): Promise<ProviderGeneration<T>> {
    const data = request.schema.parse(this.responses[this.index++]);
    return {
      data,
      metadata: {
        provider: this.name,
        model: this.model,
        durationMs: 25,
        usage: { inputTokens: 80, outputTokens: 20, totalTokens: 100 },
      },
    };
  }
}

const ticket = {
  ticketId: "3a610f78-3c80-4cb5-861d-a8da57daf455",
  subject: "Royalty overdue for six months",
  description: "My quarterly royalty payment has not arrived for six months.",
  createdAt: "2026-10-30T08:00:00.000Z",
  authorName: "Demo Author",
  book: null,
};

const analysis: TicketAnalysis = {
  category: "Royalty & Payments",
  priority: "High",
  confidence: 0.96,
  rationale: "The author reports a materially overdue royalty payment.",
  urgencySignals: ["six months overdue"],
  needsHumanEscalation: true,
};

const draft = {
  subject: "Re: Royalty overdue for six months",
  body: "Hello Demo Author, thank you for contacting us. We will verify the relevant quarterly payout records.",
  nextStep: "Verify the author ledger and linked bank details.",
  missingInformation: [],
  policyReferences: ["Royalty Policy"],
};

describe("ticket AI workflow", () => {
  it("persists validated triage, draft, usage and latency fields", async () => {
    const service = new TicketAiService({ provider: new SequentialProvider([analysis, draft]) });
    const result = await runTicketAiWorkflow(service, { ticket, publicConversation: [] });

    expect(result.ticketUpdate).toEqual({
      category: "Royalty & Payments",
      priority: "High",
    });
    expect(result.audit).toMatchObject({
      state: "ready",
      draft_body: draft.body,
      provider: "gemini",
      model: "test-model",
      input_tokens: 160,
      output_tokens: 40,
      latency_ms: 50,
    });
  });

  it("records manual-review mode without blocking the ticket", async () => {
    const result = await runTicketAiWorkflow(
      new TicketAiService({ provider: null }),
      { ticket, publicConversation: [] },
    );

    expect(result.ticketUpdate).toBeUndefined();
    expect(result.audit).toMatchObject({
      state: "manual_review",
      error_code: "AI_DISABLED",
    });
  });

  it("creates a separately auditable regenerated draft", async () => {
    const service = new TicketAiService({ provider: new SequentialProvider([draft]) });
    const result = await runDraftRegeneration(service, {
      ...ticket,
      analysis,
      publicConversation: [],
    });

    expect(result.audit).toMatchObject({
      state: "ready",
      suggested_category: "Royalty & Payments",
      suggested_priority: "High",
      draft_body: draft.body,
      input_tokens: 80,
      output_tokens: 20,
    });
  });
});
