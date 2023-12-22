export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.message = message;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        stacktrace: this.stack,
      },
    };
  }
}

export function ResponseError(response) {
  if (!response.ok) {
    return new ValidationError(response.statusText);
  }

  return response;
}
