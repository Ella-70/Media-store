// Thin wrapper so every adapter fails the same way. A failed source should
// never crash the page — callers use Promise.allSettled and just show
// fewer results, so this only needs to throw a clean, readable error.
export async function fetchJson(url, options, retries = 1) {
  let res
  try {
    res = await fetch(url, options)
  } catch {
    throw new Error(`Network error reaching ${new URL(url).hostname}`)
  }

  // 504 = the upstream server timed out — often transient,
  // so retry once after a short pause before giving up.
  if (res.status === 504 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return fetchJson(url, options, retries - 1)
  }

  if (!res.ok) {
    throw new Error(`${new URL(url).hostname} responded ${res.status}`)
  }

  return res.json()
}