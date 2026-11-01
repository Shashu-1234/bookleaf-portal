# BookLeaf REST API

The application exposes a versioned REST API under `/api/v1`. Browser mutations use the API with the existing secure Supabase session cookie. External clients such as Postman can send a Supabase access token as `Authorization: Bearer <token>`.

The machine-readable OpenAPI 3.1 document is available at `/api/v1/openapi.json` on every deployment.

## Security model

Authentication is centralized in a shared route wrapper. It validates the JWT with Supabase `getClaims()`, reads the role only from trusted `app_metadata`, rejects unauthorized roles before executing the handler, and passes an RLS-scoped Supabase client to the domain service. Authors can therefore access only their own rows even if an endpoint-level check regresses; admins and ops can access the full support queue.

No route uses the Supabase service-role key. All API responses include `x-request-id` for production log correlation and `Cache-Control: private, no-store` unless the resource is explicitly public.

## Response contract

Successful single-resource response:

```json
{ "data": { "id": "BL-1049" } }
```

Successful collection response:

```json
{
  "data": [],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 0, "totalPages": 1 }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request contains invalid data.",
    "details": [{ "path": "subject", "message": "Too small" }],
    "requestId": "b5b6c3b6-7ceb-42c5-b927-7eedde0b4892"
  }
}
```

Expected status codes are `200`, `201`, `400`, `401`, `403`, `404`, `415`, `422`, and `500`.

## Endpoints

| Method | Endpoint | Roles | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1` | Public | API discovery and documentation link |
| `GET` | `/api/v1/openapi.json` | Public | OpenAPI 3.1 specification |
| `GET` | `/api/v1/tickets` | Author, Admin, Ops | Paginated visible tickets with search and filters |
| `POST` | `/api/v1/tickets` | Author | Create a ticket; AI processing runs safely after persistence |
| `GET` | `/api/v1/tickets/{ticketId}` | Author, Admin, Ops | Retrieve one RLS-visible ticket |
| `PATCH` | `/api/v1/tickets/{ticketId}` | Admin, Ops | Override category/priority, change status, or assign |
| `GET` | `/api/v1/tickets/{ticketId}/messages` | Author, Admin, Ops | Paginated public conversation |
| `POST` | `/api/v1/tickets/{ticketId}/messages` | Author, Admin, Ops | Reply as the authenticated role |
| `POST` | `/api/v1/tickets/{ticketId}/notes` | Admin, Ops | Add an internal note invisible to authors |
| `POST` | `/api/v1/tickets/{ticketId}/ai-draft` | Admin, Ops | Regenerate an editable AI draft; never sends automatically |

Ticket collection query parameters are `page`, `pageSize` (maximum 50), `q`, `status`, `category`, `priority`, and ISO-8601 `createdAfter`. Message collections accept `page` and `pageSize`.

## Example

```bash
curl "https://bookleaf-portal-wine.vercel.app/api/v1/tickets?page=1&pageSize=10&status=Open" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN"
```

```bash
curl -X PATCH "https://bookleaf-portal-wine.vercel.app/api/v1/tickets/BL-1049" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority":"High","assignedTo":"self"}'
```

Server Components use the same domain and repository boundaries in-process for reads, avoiding a slower HTTP call back into the same deployment. Browser-originated ticket creation, replies, admin updates, notes, and AI-draft regeneration all use the REST endpoints above.
