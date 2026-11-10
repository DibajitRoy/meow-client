import { authClient } from "./auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  let url: URL;
  try {
    url = new URL(path, API_URL);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be a valid absolute URL, such as http://localhost:5000");
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.errors?.[0]?.message ?? body?.message ?? "Request failed");
  return body as T;
}

// Login lagbe emon request
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await authClient.token();
  return request<T>(path, init, data?.token);
}

// Public request (sitter search, sitter details)
export function publicApi<T = unknown>(path: string): Promise<T> {
  return request<T>(path);
}
