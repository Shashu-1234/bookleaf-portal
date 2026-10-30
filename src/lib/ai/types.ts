import type { z } from "zod";

import type {
  ResponseDraft,
  TicketAnalysis,
  TicketCategory,
} from "./schemas";

export type AiOperation = "ticket-analysis" | "response-draft";
export type AiProviderName = "gemini" | "ollama";

export interface BookContext {
  id: string;
  title: string;
  isbn: string | null;
  status: string;
  publicationDate: string | null;
  mrp: number | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  lastRoyaltyPayoutDate: string | null;
  availableOn: string[];
}

export interface TicketInput {
  ticketId: string;
  subject: string;
  description: string;
  createdAt: string;
  authorName: string;
  book: BookContext | null;
}

export interface DraftResponseInput extends TicketInput {
  analysis: Pick<TicketAnalysis, "category" | "priority" | "rationale">;
  publicConversation: Array<{
    sender: "author" | "admin";
    message: string;
    createdAt: string;
  }>;
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface ProviderMetadata {
  provider: AiProviderName;
  model: string;
  durationMs: number;
  requestId?: string;
  usage?: TokenUsage;
}

export interface StructuredGenerationRequest<T> {
  operation: AiOperation;
  systemInstruction: string;
  prompt: string;
  schema: z.ZodType<T>;
  jsonSchema: Record<string, unknown>;
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
  maxAttempts: number;
}

export interface ProviderGeneration<T> {
  data: T;
  metadata: ProviderMetadata;
}

export interface AiProvider {
  readonly name: AiProviderName;
  readonly model: string;
  generateStructured<T>(
    request: StructuredGenerationRequest<T>,
  ): Promise<ProviderGeneration<T>>;
}

export type ManualReviewCode =
  | "AI_DISABLED"
  | "AI_NOT_CONFIGURED"
  | "PROVIDER_UNAVAILABLE"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "INVALID_RESPONSE"
  | "AUTHENTICATION_FAILED"
  | "UNKNOWN_PROVIDER_ERROR";

export interface ManualReviewReason {
  code: ManualReviewCode;
  message: string;
  retryable: boolean;
}

export type AiOperationResult<T> =
  | {
      status: "completed";
      data: T;
      metadata: ProviderMetadata;
      humanReviewRequired: true;
    }
  | {
      status: "manual_review_required";
      reason: ManualReviewReason;
      humanReviewRequired: true;
    };

export type TicketAnalysisResult = AiOperationResult<TicketAnalysis>;
export type ResponseDraftResult = AiOperationResult<ResponseDraft>;

export interface AiServiceStatus {
  mode: "enabled" | "manual";
  provider?: AiProviderName;
  model?: string;
  reason?: ManualReviewReason;
}

export interface KnowledgeSection {
  label: string;
  content: string;
  category?: TicketCategory;
}
