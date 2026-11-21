export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    // memperbaiki prototype chain untuk custom error.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
