import { createClient } from './supabase/client';

/**
 * Reusable backend fetch helper with authentication
 * Automatically handles Supabase session authentication and backend URL routing
 */
export const backendFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  // Get current session
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required. Please log in again.');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error('Backend URL not configured');
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return fetch(`${backendUrl}${normalizedEndpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
