import { describe, expect, it } from "vitest";
import { aiDisplay } from "./ai-display";
import type { AdminTicket } from "./types";

const ticket = (ai: Partial<AdminTicket["ai"]> = {}, extra: Partial<AdminTicket> = {}) => ({ ai: { errorCode: null, rationale: null, lastRunAt: null, ...ai }, draft: null, ...extra }) as AdminTicket;
describe("AI status messaging", () => {
  it("does not invent a provider failure for a historic disabled attempt", () => {
    expect(aiDisplay(ticket({ rationale: "AI provider is intentionally disabled; ticket remains available for human triage." })).title).toBe("AI was disabled for this attempt");
  });
  it("shows automatic processing for a new ticket", () => {
    expect(aiDisplay(ticket({}, { createdAtIso: new Date(100000).toISOString() }), 110000).processing).toBe(true);
  });
  it("does not wait forever when an attempt was never recorded", () => {
    expect(aiDisplay(ticket({}, { createdAtIso: new Date(100000).toISOString() }), 400000).title).toBe("No AI draft generated yet");
  });
  it("shows the recorded failure and preserves the previous draft", () => {
    expect(aiDisplay(ticket({ errorCode: "AI_RATE_LIMITED" }, { draft: { body: "Previous", subject: "Reply", policyReferences: [] } })).title).toContain("previous draft retained");
  });
});
