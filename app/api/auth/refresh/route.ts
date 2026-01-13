import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const responseCookies: Array<{ name: string; value: string; options: CookieOptions }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            responseCookies.push({ name, value, options });
          },
          remove(name: string, options: CookieOptions) {
            responseCookies.push({ name, value: '', options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Failed to refresh session' },
        { status: 401 }
      );
    }

    const { session } = data;
    const response = NextResponse.json({
      success: true,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      },
    });

    // Apply any cookie updates Supabase SSR client requests
    responseCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
