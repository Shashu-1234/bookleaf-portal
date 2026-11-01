import { apiRoute } from "@/lib/api/http";
import { openApiDocument } from "@/lib/api/openapi";

export const GET = apiRoute(async () => Response.json(openApiDocument, { headers: { "cache-control": "public, max-age=3600" } }));
