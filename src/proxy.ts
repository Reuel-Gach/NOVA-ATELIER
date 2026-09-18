// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/about(.*)",
  "/api/webhooks(.*)",
  "/api/uploadthing", // Whitelisted to allow Uploadthing callbacks to bypass Clerk
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// 1. Change the callback to be async
export const proxy = clerkMiddleware(async (auth, req) => {
  
  // 2. Use await auth.protect() directly
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    // 3. Await auth() to extract the session metadata
    const { sessionClaims } = await auth();
    
    const metadata = sessionClaims?.metadata as { department?: string } | undefined;
    const userDepartment = metadata?.department;

    if (!userDepartment) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin/technology") && userDepartment !== "technology" && userDepartment !== "executive") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (path.startsWith("/admin/inventory") && userDepartment !== "inventory" && userDepartment !== "executive") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (path.startsWith("/admin/finance") && userDepartment !== "finance" && userDepartment !== "executive") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};