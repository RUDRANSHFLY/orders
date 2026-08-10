import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status,
    },
  );
}
