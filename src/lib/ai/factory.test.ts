import { describe, expect, it } from "vitest";

import { createTicketAiService } from "./factory";

describe("createTicketAiService", () => {
  it("defaults to manual mode and never makes an accidental paid request", () => {
    const service = createTicketAiService({});
    expect(service.status()).toMatchObject({
      mode: "manual",
      reason: { code: "AI_DISABLED" },
    });
  });

  it("reports a safe configuration failure when Gemini has no key", () => {
    const service = createTicketAiService({ AI_PROVIDER: "gemini" });
    expect(service.status()).toMatchObject({
      mode: "manual",
      reason: { code: "AI_NOT_CONFIGURED" },
    });
  });

  it("enables Ollama without requiring a cloud API key", () => {
    const service = createTicketAiService({
      AI_PROVIDER: "ollama",
      OLLAMA_MODEL: "gpt-oss",
    });
    expect(service.status()).toEqual({
      mode: "enabled",
      provider: "ollama",
      model: "gpt-oss",
    });
  });
});
