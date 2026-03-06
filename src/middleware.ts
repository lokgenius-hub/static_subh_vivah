import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/partner-register", "/partner/register"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  const protectedPaths = ["/partner", "/admin"];
  const isProtected =
    !isPublicPath && protectedPaths.some((p) => pathname.startsWith(p));

  // Never intercept the pending-approval page itself (prevents redirect loop)
  if (pathname === "/pending-approval") {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // ── Approval gate: block unapproved users from /partner/* ──
    // Admins are always allowed through; only vendor/customer accounts need approval.
    if (user && pathname.startsWith("/partner") && !isPublicPath) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, approved_status")
        .eq("id", user.id)
        .single();

      if (
        profile &&
        profile.role !== "admin" &&
        profile.role !== "rm" &&
        profile.approved_status !== "approved"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/pending-approval";
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // Gracefully handle AbortError / lock steal — let the request continue
    if (isProtected) {
      const hasSession = request.cookies.getAll().some(
        (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
      );
      if (!hasSession) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/setup-admin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
