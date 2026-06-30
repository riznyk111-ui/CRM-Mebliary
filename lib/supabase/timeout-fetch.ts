export function fetchWithTimeout(
  url: URL | RequestInfo,
  options?: RequestInit,
  timeoutMs = 3500
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(id)
  })
}
