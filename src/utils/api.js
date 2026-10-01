// One place for talking to the backend. Uses the same base URL and the same
// saved login token (`ccp_token`) as AuthProvider and ComplaintsProvider.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TOKEN_KEY = 'ccp_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Every failed request becomes one of these, so screens can show `message`
// and check `status` (401 = signed out, 404 = not found, 0 = server unreachable).
export class ApiError extends Error {
  constructor(message, status = 0, errors = undefined) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Turns { search: 'fan', status: '' } into "?search=fan" (blank values are left out).
function buildQuery(params) {
  const query = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

// Backend errors look like { success: false, message, errors?: [{ field, message }] }.
// When there are field errors, their messages are more useful than "Validation failed".
function readErrorMessage(data, fallback) {
  if (Array.isArray(data?.errors)) {
    const details = data.errors.map((item) => item?.message).filter(Boolean)
    if (details.length > 0) return details.join(' ')
  }
  return data?.message || fallback
}

// apiRequest('/complaints', { params: { status: 'Pending' }, signal })
// apiRequest('/complaints/123', { method: 'PATCH', body: { status: 'Resolved' } })
// Resolves with the parsed JSON, or throws an ApiError.
export async function apiRequest(path, { method = 'GET', body, params, signal } = {}) {
  const token = getToken()
  if (!token) throw new ApiError('You are not logged in.', 401)

  let response
  try {
    response = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(
      'Unable to connect to the server. Make sure the backend is running on port 5000.',
    )
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // Not JSON (for example a proxy error page): fall through to the generic message.
  }

  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(data, 'Something went wrong. Please try again.'),
      response.status,
      data?.errors,
    )
  }

  return data
}
