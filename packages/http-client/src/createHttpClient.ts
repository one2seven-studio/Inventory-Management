import { ApiError, type ApiErrorBody } from "@platform/contracts";

export interface HttpClientConfig {
  baseUrl: string;
  authToken?: string;
  extraHeaders?: Record<string, string>;
}

export interface HttpClient {
  get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path.replace(/^\//, ""), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const body = data as ApiErrorBody | undefined;
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UPSTREAM_ERROR",
      body?.error?.message ?? `Request failed with status ${response.status}`,
      body?.error?.details
    );
  }

  return data as T;
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...config.extraHeaders,
  };
  if (config.authToken) headers.authorization = `Bearer ${config.authToken}`;

  async function request<T>(method: string, path: string, options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown }): Promise<T> {
    const url = buildUrl(config.baseUrl, path, options?.query);
    // Every call here carries live, per-caller-authorized data (auth token,
    // active restaurant, ...) — Next.js's fetch Data Cache keys purely on
    // URL+method, not headers, so without `cache: "no-store"` a request made
    // under one session/restaurant can serve a cached response to a
    // *different* one that later hits the exact same URL. Node's plain
    // fetch (every backend service also uses this client) has no such cache
    // to begin with, so this is a no-op there. Typed as an intersection —
    // not inline on the fetch() call — because this package's tsconfig has
    // no "DOM" lib and Node's ambient RequestInit doesn't declare `cache`,
    // even though the runtime (both Node's fetch and Next's) accepts it.
    const requestInit: RequestInit & { cache?: "no-store" } = {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    };
    const response = await fetch(url, requestInit);
    return parseResponse<T>(response);
  }

  return {
    get: (path, query) => request("GET", path, { query }),
    post: (path, body) => request("POST", path, { body }),
    put: (path, body) => request("PUT", path, { body }),
    patch: (path, body) => request("PATCH", path, { body }),
    delete: (path) => request("DELETE", path),
  };
}
