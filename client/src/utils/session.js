/**
 * Generate a unique session ID for anonymous users
 */
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Get or create session ID from localStorage
 */
export function getSessionId() {
  let sessionId = localStorage.getItem('dj_request_session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('dj_request_session_id', sessionId);
  }

  return sessionId;
}
