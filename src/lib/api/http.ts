import { ZodError } from "zod";

import { DatabaseOperationError } from "@/lib/database/errors";
import { ApiError } from "./errors";

type RouteHandler<TContext> = (request: Request, context: TContext, requestId: string) => Promise<Response>;

export function apiSuccess<T>(data: T, options: { status?: number; meta?: unknown; headers?: HeadersInit } = {}) {
  return Response.json(
    options.meta === undefined ? { data } : { data, meta: options.meta },
    { status: options.status ?? 200, headers: options.headers },
  );
}

export async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }
  return request.json();
}

export function apiRoute<TContext>(handler: RouteHandler<TContext>) {
  return async (request: Request, context: TContext) => {
    const requestId = request.headers.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();
    try {
      const response = await handler(request, context, requestId);
      response.headers.set("x-request-id", requestId);
      if (!response.headers.has("cache-control")) response.headers.set("cache-control", "private, no-store");
      return response;
    } catch (error) {
      const normalized = normalizeError(error);
      if (normalized.status >= 500) {
        console.error("[api] Request failed", { requestId, code: normalized.code, error: error instanceof Error ? error.message : "Unknown error" });
      }
      return Response.json(
        { error: { code: normalized.code, message: normalized.message, ...(normalized.details === undefined ? {} : { details: normalized.details }), requestId } },
        { status: normalized.status, headers: { "cache-control": "private, no-store", "x-request-id": requestId } },
      );
    }
  };
}

function normalizeError(error: unknown) {
  if (error instanceof ApiError) return error;
  if (error instanceof ZodError) {
    return new ApiError(422, "VALIDATION_FAILED", "The request contains invalid data.", error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })));
  }
  if (error instanceof SyntaxError) return new ApiError(400, "INVALID_JSON", "The request body is not valid JSON.");
  if (error instanceof DatabaseOperationError) {
    const status = error.code.includes("NOT_FOUND") ? 404 : error.code === "AUTHENTICATION_REQUIRED" ? 401 : 500;
    return new ApiError(status, error.code, status === 500 ? "The request could not be completed." : error.message);
  }
  return new ApiError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}
