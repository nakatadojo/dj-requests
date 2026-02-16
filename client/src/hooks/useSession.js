import { useState, useEffect } from 'react';
import { getSessionId } from '../utils/session';

/**
 * Hook to manage user session ID
 */
export function useSession() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  return sessionId;
}
