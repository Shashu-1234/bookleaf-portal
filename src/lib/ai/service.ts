import { toManualReviewReason } from "./errors";
import { buildResponseDraftPrompt, buildTicketAnalysisPrompt } from "./prompts";
import {
  responseDraftSchema,
  ticketAnalysisSchema,
  toProviderJsonSchema,
} from "./schemas";
import type {
  AiProvider,
  AiServiceStatus,
  DraftResponseInput,
  ManualReviewReason,
  ResponseDraftResult,
  TicketAnalysisResult,
  TicketInput,
} from "./types";

export interface TicketAiServiceOptions {
  provider: AiProvider | null;
  unavailableReason?: ManualReviewReason;
  timeoutMs?: number;
  maxAttempts?: number;
}

export class TicketAiService {
  private readonly provider: AiProvider | null;
  private readonly unavailableReason: ManualReviewReason;
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;

  constructor(options: TicketAiServiceOptions) {
    this.provider = options.provider;
    this.unavailableReason = options.unavailableReason ?? {
      code: "AI_DISABLED",
      message: "AI assistance is disabled. Continue with manual review.",
      retryable: false,
    };
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.maxAttempts = options.maxAttempts ?? 2;
  }

  status(): AiServiceStatus {
    if (!this.provider) {
      return { mode: "manual", reason: this.unavailableReason };
    }

    return {
      mode: "enabled",
      provider: this.provider.name,
      model: this.provider.model,
    };
  }

  async analyzeTicket(input: TicketInput): Promise<TicketAnalysisResult> {
    if (!this.provider) {
      return this.manualReview(this.unavailableReason);
    }

    const prompt = buildTicketAnalysisPrompt(input);

    try {
      const result = await this.provider.generateStructured({
        operation: "ticket-analysis",
        ...prompt,
        schema: ticketAnalysisSchema,
        jsonSchema: toProviderJsonSchema(ticketAnalysisSchema),
        temperature: 0,
        maxOutputTokens: 700,
        timeoutMs: this.timeoutMs,
        maxAttempts: this.maxAttempts,
      });

      return {
        status: "completed",
        data: result.data,
        metadata: result.metadata,
        humanReviewRequired: true,
      };
    } catch (error) {
      return this.manualReview(toManualReviewReason(error));
    }
  }

  async draftResponse(input: DraftResponseInput): Promise<ResponseDraftResult> {
    if (!this.provider) {
      return this.manualReview(this.unavailableReason);
    }

    const prompt = buildResponseDraftPrompt(input);

    try {
      const result = await this.provider.generateStructured({
        operation: "response-draft",
        ...prompt,
        schema: responseDraftSchema,
        jsonSchema: toProviderJsonSchema(responseDraftSchema),
        temperature: 0.2,
        maxOutputTokens: 1_200,
        timeoutMs: this.timeoutMs,
        maxAttempts: this.maxAttempts,
      });

      return {
        status: "completed",
        data: result.data,
        metadata: result.metadata,
        humanReviewRequired: true,
      };
    } catch (error) {
      return this.manualReview(toManualReviewReason(error));
    }
  }

  private manualReview(reason: ManualReviewReason) {
    return {
      status: "manual_review_required" as const,
      reason,
      humanReviewRequired: true as const,
    };
  }
}
