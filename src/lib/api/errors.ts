export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
  }
}

export function notFound(resource = "Resource") {
  return new ApiError(404, "NOT_FOUND", `${resource} was not found.`);
}
