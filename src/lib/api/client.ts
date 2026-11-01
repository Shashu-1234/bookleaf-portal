export class ApiClientError extends Error {
  constructor(readonly code: string, message: string, readonly status: number) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(input, { ...init, headers });
  const payload = await response.json() as { data?: T; error?: { code?: string; message?: string } };
  if (!response.ok || payload.data === undefined) {
    throw new ApiClientError(payload.error?.code ?? "REQUEST_FAILED", payload.error?.message ?? "The request could not be completed.", response.status);
  }
  return payload.data;
}
