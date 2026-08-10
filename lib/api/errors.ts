import { NextResponse } from "next/server";

export type ApiErrorDetails = Record<string, unknown> | unknown[] | undefined;

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ApiErrorDetails;

  constructor({
    code,
    message,
    statusCode,
    details,
  }: {
    code: string;
    message: string;
    statusCode: number;
    details?: ApiErrorDetails;
  }) {
    super(message);

    ((this.name = "ApiError"), (this.code = code));
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class UnAuthorizedError extends ApiError {
  constructor(message = "Authentication is required to access this resource.") {
    super({
      code: "UNAUTHORIZED",
      message,
      statusCode: 401,
    });
  }
}

export class ForebiddenError extends ApiError {
  constructor(message = "You do not have permission to perform this action.") {
    super({
      code: "FOREBIDDEN",
      message,
      statusCode: 403,
    });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "The requested resource was not found.") {
    super({
      code: "NOT_FOUND",
      message,
      statusCode: 404,
    });
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "The request contains invalid data.",
    details?: ApiErrorDetails,
  ) {
    super({
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      details,
    });
  }
}

export class ConflictError extends ApiError {
  constructor(code: string, message: string, details?: ApiErrorDetails) {
    super({
      code,
      message,
      statusCode: 409,
      details,
    });
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      { status: err.statusCode },
    );
  }

  console.error("Unhandled API error: ", err);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      },
    },
    {
      status: 500,
    },
  );
}
