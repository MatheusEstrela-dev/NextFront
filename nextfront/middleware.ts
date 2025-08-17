import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const isAuthRoute = req.nextUrl.pathname.startsWith("/home") || 
                     req.nextUrl.pathname.startsWith("/admin");

  if (isAuthRoute && !token) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
