import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  // Use NEXT_PUBLIC_SITE_URL in serverless (Amplify) where request.url origin can be wrong
  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  // ✅ MUST await in Next 16
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name, options) => {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
