
export class ApiError extends Error {

  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number, 
    message: string, 
    isOperational: boolean = true) {
        
    super(message); 
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, ApiError.prototype); // instanceof ApiError check 
    Error.captureStackTrace(this, this.constructor); // its used to clean Stack trace 
  }
}