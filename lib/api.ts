interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `/api${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export function apiGet<T>(endpoint: string, options?: FetchOptions) {
  return apiCall<T>(endpoint, { ...options, method: 'GET' });
}

export function apiPost<T>(
  endpoint: string,
  data?: Record<string, any>,
  options?: FetchOptions
) {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export function apiPut<T>(
  endpoint: string,
  data?: Record<string, any>,
  options?: FetchOptions
) {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data || {}),
  });
}

export function apiPatch<T>(
  endpoint: string,
  data?: Record<string, any>,
  options?: FetchOptions
) {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data || {}),
  });
}

export function apiDelete<T>(endpoint: string, options?: FetchOptions) {
  return apiCall<T>(endpoint, { ...options, method: 'DELETE' });
}
