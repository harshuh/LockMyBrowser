import { ApiError } from "./ApiError";

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400,message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401,message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404,message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict occurred") {
    super(409,message);
  }
}