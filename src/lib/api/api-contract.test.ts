import { describe, expect, it } from "vitest";

import { openApiDocument } from "./openapi";
import { createTicketSchema, messageListQuerySchema, ticketListQuerySchema, updateTicketSchema } from "./schemas";

describe("REST API contract", () => {
  it("applies bounded pagination defaults", () => {
    expect(ticketListQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 20 });
    expect(messageListQuerySchema.safeParse({ pageSize: "51" }).success).toBe(false);
  });

  it("rejects unknown input fields", () => {
    expect(createTicketSchema.safeParse({ subject: "Royalty delay", description: "My royalty payment has not arrived this month.", admin: true }).success).toBe(false);
  });

  it("requires a meaningful PATCH document", () => {
    expect(updateTicketSchema.safeParse({}).success).toBe(false);
    expect(updateTicketSchema.safeParse({ priority: "High", assignedTo: "self" }).success).toBe(true);
  });

  it("documents every implemented resource route", () => {
    expect(openApiDocument.openapi).toBe("3.1.0");
    expect(Object.keys(openApiDocument.paths)).toEqual(expect.arrayContaining([
      "/api/v1/tickets",
      "/api/v1/tickets/{ticketId}",
      "/api/v1/tickets/{ticketId}/messages",
      "/api/v1/tickets/{ticketId}/notes",
      "/api/v1/tickets/{ticketId}/ai-draft",
    ]));
  });
});
