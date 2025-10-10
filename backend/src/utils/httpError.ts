export class HttpError extends Error {
  public status: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.status = statusCode;

    // Ensure proper inheritance for instanceof checks
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
