import { apiRoute, apiSuccess } from "@/lib/api/http";

export const GET = apiRoute(async (request) => {
  const origin = new URL(request.url).origin;
  return apiSuccess({
    name: "BookLeaf Author Support API",
    version: "v1",
    status: "ok",
    documentation: `${origin}/api/v1/openapi.json`,
    resources: { tickets: `${origin}/api/v1/tickets` },
  });
});
