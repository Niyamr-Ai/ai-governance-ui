import { supabase } from "@/utils/supabase/client";

/**
 * Reusable backend fetch helper with authentication
 * Automatically handles Supabase session authentication and backend URL routing
 */
export const backendFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  console.log("🔍 [FRONTEND] backendFetch called with endpoint:", endpoint);

  // Get current session
  console.log("🔍 [FRONTEND] Getting Supabase session...");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  console.log("🔍 [FRONTEND] Session error:", sessionError);
  console.log("🔍 [FRONTEND] Session exists:", !!session);
  console.log("🔍 [FRONTEND] Access token exists:", !!session?.access_token);

  if (sessionError || !session?.access_token) {
    console.log("❌ [FRONTEND] No valid session or token");
    throw new Error('Authentication required. Please log in again.');
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log("🔍 [FRONTEND] Backend URL configured:", !!backendUrl, backendUrl);

  if (!backendUrl) {
    console.log("❌ [FRONTEND] Backend URL not configured");
    throw new Error('Backend URL not configured');
  }

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${backendUrl}${normalizedEndpoint}`;

  console.log("🔍 [FRONTEND] Making request to:", fullUrl);
  console.log("🔍 [FRONTEND] Request options:", { ...options, headers: { ...options.headers, Authorization: '[REDACTED]' } });

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log("🔍 [FRONTEND] Response status:", response.status);
  console.log("🔍 [FRONTEND] Response ok:", response.ok);

  return response;
};
