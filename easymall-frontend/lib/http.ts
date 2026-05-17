import { API_BASE_URL } from "@/lib/env";
import { clearSession, getSessionSnapshot } from "@/lib/session";
import type { ErrorDetail, Result } from "@/lib/types";

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: object;
  body?: BodyInit | object | unknown[] | null;
  withAuth?: boolean;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ErrorDetail[];

  constructor(
    message: string,
    options: { status?: number; code?: string; details?: ErrorDetail[] } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 500;
    this.code = options.code;
    this.details = options.details;
  }
}

function buildUrl(
  path: string,
  params?: object,
) {
  const base = API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path;

  if (!params || Object.keys(params).length === 0) {
    return base;
  }

  const url = new URL(base, typeof window !== "undefined" ? window.location.origin : "http://localhost");

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  if (API_BASE_URL) {
    return url.toString();
  }

  return `${url.pathname}${url.search}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !(value instanceof FormData);
}

export async function request<T>(
  path: string,
  { params, body, headers, withAuth = true, ...init }: RequestOptions = {},
) {
  const session = getSessionSnapshot();
  const nextHeaders = new Headers(headers);

  if (withAuth && session.token) {
    nextHeaders.set("Authorization", `Bearer ${session.token}`);
  }

  let requestBody: BodyInit | undefined;
  if (isPlainObject(body)) {
    nextHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  } else if (body instanceof FormData) {
    requestBody = body;
  } else if (Array.isArray(body)) {
    nextHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  } else if (body != null) {
    requestBody = body as BodyInit;
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    body: requestBody,
    headers: nextHeaders,
    cache: "no-store",
  });

  let payload: Result<T> | null = null;
  try {
    payload = (await response.json()) as Result<T>;
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    clearSession();
    throw new ApiError("登录已过期，请重新登录", {
      status: 401,
      code: payload?.code,
      details: payload?.errors,
    });
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || "请求失败，请稍后重试",
      {
        status: response.status,
        code: payload?.code,
        details: payload?.errors,
      },
    );
  }

  return payload.data;
}
