# Provider-neutral AI architecture

The support workflow depends on the `TicketAiService`, never on a vendor SDK.

```text
Ticket workflow
    |
    v
TicketAiService
    |-- GeminiProvider  (free-tier deployed demonstration)
    |-- OllamaProvider  (local/offline development)
    `-- manual_review_required result
```

## Design rules

1. Tickets are persisted before AI analysis is attempted. AI failure must never block ticket creation.
2. Provider output is constrained with JSON Schema and independently validated with Zod.
3. AI classification and response drafts are advisory. A human administrator can override every result and must approve every public reply.
4. The default provider is `manual`, preventing accidental API usage or cost.
5. Only the knowledge-base section relevant to the ticket category is included in a response-draft call. This reduces tokens and irrelevant context.
6. Ticket text is treated as untrusted content. Prompts explicitly reject attempts to override policy or reveal instructions.
7. Provider metadata records the model, latency, request identifier, and token usage for auditability and cost monitoring.
8. Timeouts, bounded retries, rate limits, malformed output, missing credentials, and provider outages all return a typed manual-review result.

## Runtime workflow

1. The author ticket is committed first.
2. A non-blocking server task loads trusted author and book context with a server-only Supabase secret key.
3. The model returns structured category, priority, confidence, rationale and urgency signals.
4. The application validates the response, stores a complete `ai_runs` audit record and applies the advisory category/priority to the ticket.
5. A category-scoped knowledge-base prompt creates the editable response draft.
6. Every regeneration creates a new audit record. A failed regeneration never deletes the previous usable draft.
7. Provider failures store a typed fallback code while the ticket remains available for manual processing.

Audit records include provider, model, input/output token counts, combined latency, classification rationale, policy references and safe failure codes. API keys and raw provider errors are never returned to the browser.

## Configuration

Copy `.env.example` to an ignored `.env.local` and choose one provider:

- `AI_PROVIDER=manual`: no AI calls; the complete admin workflow remains available.
- `AI_PROVIDER=gemini`: uses `GEMINI_API_KEY` and `GEMINI_MODEL` on the server.
- `AI_PROVIDER=ollama`: uses a local Ollama server, `OLLAMA_BASE_URL`, and `OLLAMA_MODEL`.

No provider secret may use a `NEXT_PUBLIC_` prefix or be returned to the browser.
