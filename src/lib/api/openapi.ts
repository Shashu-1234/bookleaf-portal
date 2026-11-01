const auth = [{ bearerAuth: [] }];
const errorResponses = {
  "401": { $ref: "#/components/responses/Unauthorized" },
  "403": { $ref: "#/components/responses/Forbidden" },
  "422": { $ref: "#/components/responses/ValidationFailed" },
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "BookLeaf Author Support API",
    version: "1.0.0",
    description: "Versioned REST API for BookLeaf support tickets. Browser sessions and Supabase bearer tokens are accepted; PostgreSQL RLS remains the final authorization boundary.",
  },
  servers: [{ url: "/", description: "Current deployment" }],
  tags: [{ name: "Tickets" }, { name: "Messages" }, { name: "Operations" }],
  paths: {
    "/api/v1": {
      get: { summary: "API discovery", operationId: "getApiDiscovery", responses: { "200": { description: "Service metadata" } } },
    },
    "/api/v1/openapi.json": {
      get: { summary: "OpenAPI document", operationId: "getOpenApiDocument", responses: { "200": { description: "OpenAPI 3.1 document" } } },
    },
    "/api/v1/tickets": {
      get: {
        tags: ["Tickets"], summary: "List visible tickets", operationId: "listTickets", security: auth,
        description: "Authors receive only their own tickets through RLS. Admin and ops roles receive the full queue.",
        parameters: [
          { $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" },
          { name: "q", in: "query", schema: { type: "string", maxLength: 100 } },
          { name: "status", in: "query", schema: { $ref: "#/components/schemas/TicketStatus" } },
          { name: "category", in: "query", schema: { $ref: "#/components/schemas/TicketCategory" } },
          { name: "priority", in: "query", schema: { $ref: "#/components/schemas/TicketPriority" } },
          { name: "createdAfter", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: { "200": { description: "Paginated ticket collection", content: { "application/json": { schema: { $ref: "#/components/schemas/TicketCollection" } } } }, ...errorResponses },
      },
      post: {
        tags: ["Tickets"], summary: "Create a support ticket", operationId: "createTicket", security: auth,
        description: "Author only. AI triage runs after the ticket is safely persisted and degrades to manual review on failure.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTicket" } } } },
        responses: { "201": { description: "Ticket created" }, ...errorResponses },
      },
    },
    "/api/v1/tickets/{ticketId}": {
      parameters: [{ $ref: "#/components/parameters/TicketId" }],
      get: { tags: ["Tickets"], summary: "Get a visible ticket", operationId: "getTicket", security: auth, responses: { "200": { description: "Ticket detail" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses } },
      patch: {
        tags: ["Operations"], summary: "Update ticket workflow fields", operationId: "updateTicket", security: auth,
        description: "Admin and ops only.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTicket" } } } },
        responses: { "200": { description: "Updated ticket" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses },
      },
    },
    "/api/v1/tickets/{ticketId}/messages": {
      parameters: [{ $ref: "#/components/parameters/TicketId" }],
      get: {
        tags: ["Messages"], summary: "List conversation messages", operationId: "listMessages", security: auth,
        parameters: [{ $ref: "#/components/parameters/Page" }, { $ref: "#/components/parameters/PageSize" }],
        responses: { "200": { description: "Paginated message collection" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses },
      },
      post: {
        tags: ["Messages"], summary: "Reply to a ticket", operationId: "createMessage", security: auth,
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMessage" } } } },
        responses: { "201": { description: "Message created" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses },
      },
    },
    "/api/v1/tickets/{ticketId}/notes": {
      parameters: [{ $ref: "#/components/parameters/TicketId" }],
      post: {
        tags: ["Operations"], summary: "Add an internal note", operationId: "createInternalNote", security: auth, description: "Admin and ops only. Notes are never exposed to authors.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateMessage" } } } },
        responses: { "201": { description: "Note created" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses },
      },
    },
    "/api/v1/tickets/{ticketId}/ai-draft": {
      parameters: [{ $ref: "#/components/parameters/TicketId" }],
      post: { tags: ["Operations"], summary: "Regenerate an AI response draft", operationId: "regenerateAiDraft", security: auth, description: "Admin and ops only. Produces an editable draft; it never sends automatically.", responses: { "200": { description: "Draft or graceful manual-review response" }, "404": { $ref: "#/components/responses/NotFound" }, ...errorResponses } },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Supabase access token. Browser clients may instead use the existing secure session cookie." } },
    parameters: {
      Page: { name: "page", in: "query", schema: { type: "integer", minimum: 1, maximum: 10000, default: 1 } },
      PageSize: { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
      TicketId: { name: "ticketId", in: "path", required: true, schema: { type: "string", pattern: "^BL-[0-9]+$", example: "BL-1049" } },
    },
    responses: {
      Unauthorized: { description: "Missing or invalid authentication", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      Forbidden: { description: "Authenticated role is not permitted", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      NotFound: { description: "Resource is absent or hidden by RLS", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      ValidationFailed: { description: "Request validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
    schemas: {
      TicketStatus: { type: "string", enum: ["Open", "In Progress", "Resolved", "Closed"] },
      TicketPriority: { type: "string", enum: ["Critical", "High", "Medium", "Low"] },
      TicketCategory: { type: "string", enum: ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"] },
      CreateTicket: { type: "object", additionalProperties: false, required: ["subject", "description"], properties: { bookId: { oneOf: [{ type: "string", pattern: "^BK[0-9]{3,}$" }, { type: "null" }], default: null }, subject: { type: "string", minLength: 8, maxLength: 160 }, description: { type: "string", minLength: 20, maxLength: 4000 } } },
      UpdateTicket: { type: "object", additionalProperties: false, minProperties: 1, properties: { category: { $ref: "#/components/schemas/TicketCategory" }, priority: { $ref: "#/components/schemas/TicketPriority" }, status: { $ref: "#/components/schemas/TicketStatus" }, assignedTo: { oneOf: [{ const: "self" }, { type: "string", format: "uuid" }, { type: "null" }] } } },
      CreateMessage: { type: "object", additionalProperties: false, required: ["body"], properties: { body: { type: "string", minLength: 1, maxLength: 4000 } } },
      PageMeta: { type: "object", required: ["page", "pageSize", "totalItems", "totalPages"], properties: { page: { type: "integer" }, pageSize: { type: "integer" }, totalItems: { type: "integer" }, totalPages: { type: "integer" } } },
      TicketCollection: { type: "object", required: ["data", "meta"], properties: { data: { type: "array", items: { type: "object" } }, meta: { $ref: "#/components/schemas/PageMeta" } } },
      Error: { type: "object", required: ["error"], properties: { error: { type: "object", required: ["code", "message", "requestId"], properties: { code: { type: "string", example: "VALIDATION_FAILED" }, message: { type: "string" }, details: {}, requestId: { type: "string" } } } } },
    },
  },
} as const;
