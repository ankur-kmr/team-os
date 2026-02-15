import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Middleware for TeamOS
 * 
 * Handles:
 * 1. Authentication checks
 * 2. Organization context validation
 * 3. Route protection
 */

// Force Node.js runtime (required for Prisma with Neon adapter)
export const runtime = "nodejs"

export async function middleware(request: NextRequest) {
  if (request.headers.get("x-action")) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Get session
  const session = await auth()

  // Public routes (no auth required)
  const publicRoutes = ["/login", "/register"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If public route, allow access
  if (isPublicRoute) {
    // If already logged in, redirect to onboarding
    if (session?.user) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
    return NextResponse.next()
  }

  console.log("🔐 Session:", session)

  // Skip auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }
  
  // Protected routes require authentication
  if (!session?.user) {
    // await(() => new Promise(resolve => setTimeout(resolve, 5000)))
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Check if accessing dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard")
  
  if (isDashboardRoute) {
    // Check if user has selected an organization
    const orgId = request.cookies.get("orgId")?.value

    if (!orgId) {
      // No organization selected - redirect to onboarding
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    // TODO: Verify user has access to this organization
    // This is where you'd check Member table to ensure user belongs to orgId
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
