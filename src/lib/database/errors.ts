export class DatabaseOperationError extends Error {
  constructor(
    message: string,
    readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DatabaseOperationError";
  }
}

export class AuthenticationRequiredError extends DatabaseOperationError {
  constructor() {
    super("You must be signed in to perform this action.", "AUTHENTICATION_REQUIRED");
    this.name = "AuthenticationRequiredError";
  }
}
