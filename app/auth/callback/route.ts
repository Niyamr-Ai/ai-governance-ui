import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect_to");
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);
    // If it's a password reset and there's an error, redirect to reset-password with error
    if (redirectTo?.includes('reset-password')) {
      return NextResponse.redirect(`${origin}/reset-password?error=${encodeURIComponent(error.message)}`);
    }
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  // Verify session was created successfully
  if (!data.session) {
    console.error("No session created after code exchange");
    return NextResponse.redirect(`${origin}/sign-in?error=Session creation failed`);
  }

  // Handle user metadata updates - preserve existing first_name/last_name when Google sign-in happens
  const user = data.session.user;
  const metadata = user.user_metadata || {};
  
  // Check if this is a Google sign-in (has Google provider)
  const isGoogleSignIn = user.app_metadata?.provider === 'google' || 
                         user.app_metadata?.providers?.includes('google') ||
                         metadata.provider === 'google';
  
  console.log('[Auth Callback] Processing user metadata:', {
    userId: user.id,
    isGoogleSignIn,
    currentMetadata: metadata,
    providers: user.app_metadata?.providers,
    hasFirstName: !!metadata.first_name,
    hasLastName: !!metadata.last_name,
    hasGivenName: !!metadata.given_name,
    hasFamilyName: !!metadata.family_name
  });
  
  // Build updated metadata - preserve existing first_name/last_name if they exist
  const updatedMetadata: any = {
    ...metadata, // Start with current metadata (includes Google data)
  };
  
  // CRITICAL: When Google sign-in happens, preserve existing first_name/last_name if they exist
  // Only use Google's name if first_name/last_name are empty
  if (isGoogleSignIn) {
    // Check if user already has first_name and last_name in current metadata
    // Google might have overwritten them, so check current metadata first
    let hasExistingFirstName = metadata.first_name && metadata.first_name.trim() !== '';
    let hasExistingLastName = metadata.last_name && metadata.last_name.trim() !== '';
    
    // If first_name/last_name are missing, try to get them from Admin API (before Google overwrote)
    // This is a fallback in case Google completely overwrote the metadata
    if ((!hasExistingFirstName || !hasExistingLastName) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        );
        
        // Get user by ID - Admin API might have the original metadata
        const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        
        if (adminUser?.user) {
          const adminMetadata = adminUser.user.user_metadata || {};
          // Check if admin metadata has first_name/last_name that Google might have overwritten
          if (adminMetadata.first_name && adminMetadata.first_name.trim() !== '') {
            hasExistingFirstName = true;
            updatedMetadata.first_name = adminMetadata.first_name;
          }
          if (adminMetadata.last_name && adminMetadata.last_name.trim() !== '') {
            hasExistingLastName = true;
            updatedMetadata.last_name = adminMetadata.last_name;
          }
        }
      } catch (error) {
        console.error('[Auth Callback] Error checking admin user:', error);
      }
    }
    
    console.log('[Auth Callback] Checking for existing first_name/last_name:', {
      hasExistingFirstName,
      hasExistingLastName,
      first_name: updatedMetadata.first_name || metadata.first_name,
      last_name: updatedMetadata.last_name || metadata.last_name,
      google_given_name: metadata.given_name,
      google_family_name: metadata.family_name
    });
    
    if (hasExistingFirstName && hasExistingLastName) {
      // User already has first_name and last_name - preserve them, don't use Google's name
      console.log('[Auth Callback] ✅ Preserving existing first_name/last_name:', {
        first_name: updatedMetadata.first_name || metadata.first_name,
        last_name: updatedMetadata.last_name || metadata.last_name
      });
      
      // Ensure name and full_name are set based on existing first_name/last_name
      // This overrides Google's name field
      const fullName = `${updatedMetadata.first_name || metadata.first_name} ${updatedMetadata.last_name || metadata.last_name}`.trim();
      updatedMetadata.name = fullName;
      updatedMetadata.full_name = fullName;
    } else {
      // User doesn't have first_name/last_name - use Google's name
      console.log('[Auth Callback] ⚠️ Using Google name (first_name/last_name missing or empty)');
      
      if (metadata.given_name && metadata.family_name) {
        // Google provided given_name/family_name - use them as first_name/last_name
        updatedMetadata.first_name = metadata.given_name;
        updatedMetadata.last_name = metadata.family_name;
        const fullName = `${metadata.given_name} ${metadata.family_name}`.trim();
        updatedMetadata.name = fullName;
        updatedMetadata.full_name = fullName;
      } else if (metadata.given_name && !metadata.family_name) {
        // Only given_name available
        updatedMetadata.first_name = metadata.given_name;
        updatedMetadata.name = metadata.given_name;
        updatedMetadata.full_name = metadata.given_name;
      } else if (metadata.name) {
        // Google provided a name but no given_name/family_name - extract them
        const nameParts = metadata.name.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          updatedMetadata.first_name = nameParts[0];
          updatedMetadata.last_name = nameParts.slice(1).join(' ');
          updatedMetadata.name = metadata.name;
          updatedMetadata.full_name = metadata.name;
        } else if (nameParts.length === 1) {
          updatedMetadata.first_name = nameParts[0];
          updatedMetadata.name = metadata.name;
          updatedMetadata.full_name = metadata.name;
        }
      }
    }
  } else {
    // Not Google sign-in - ensure name fields are consistent
    if (metadata.first_name && metadata.last_name) {
      const fullName = `${metadata.first_name} ${metadata.last_name}`.trim();
      if (!metadata.name) updatedMetadata.name = fullName;
      if (!metadata.full_name) updatedMetadata.full_name = fullName;
    } else if (metadata.first_name && metadata.last_name && !metadata.name) {
      // Has first_name/last_name but no name - create it
      const fullName = `${metadata.first_name} ${metadata.last_name}`.trim();
      updatedMetadata.name = fullName;
      updatedMetadata.full_name = fullName;
    } else if (metadata.full_name && !metadata.name) {
      // Has full_name but no name - use full_name
      updatedMetadata.name = metadata.full_name;
    } else if (metadata.name && !metadata.full_name) {
      // Has name but no full_name - use name
      updatedMetadata.full_name = metadata.name;
    }
  }
  
  // Check if we need to update
  const needsUpdate = 
    (updatedMetadata.first_name !== metadata.first_name) ||
    (updatedMetadata.last_name !== metadata.last_name) ||
    (updatedMetadata.name !== metadata.name) ||
    (updatedMetadata.full_name !== metadata.full_name);
  
  if (needsUpdate) {
    console.log('[Auth Callback] Updating user metadata:', {
      isGoogleSignIn,
      oldMetadata: metadata,
      newMetadata: updatedMetadata
    });
    
    await supabase.auth.updateUser({
      data: updatedMetadata,
    });
  }

  console.log("✅ Session created successfully, redirecting...");

  // If redirect_to is specified (e.g., for password reset or dashboard), use it
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
