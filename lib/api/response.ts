import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  status = 200,
  message?: string,
  meta?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status,
    },
  );
}
