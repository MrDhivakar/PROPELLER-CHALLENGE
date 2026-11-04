export class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, ApiError);
  }
  static badRequest(msg, details) { return new ApiError(400, 'BAD_REQUEST', msg, details); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, 'UNAUTHORIZED', msg); }
  static forbidden(msg = 'Forbidden') { return new ApiError(403, 'FORBIDDEN', msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, 'NOT_FOUND', msg); }
  static conflict(msg) { return new ApiError(409, 'CONFLICT', msg); }
  static tooMany(msg = 'Too many requests') { return new ApiError(429, 'RATE_LIMITED', msg); }
  static internal(msg = 'Internal server error') { return new ApiError(500, 'INTERNAL_ERROR', msg); }
}