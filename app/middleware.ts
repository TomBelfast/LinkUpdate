import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Ścieżki związane z autentykacją (nie przekierowujemy z nich)
const authPaths = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify-request",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Ścieżki publiczne (dostępne bez logowania)
const publicPaths = [
  "/api",
  "/_next",
  "/images",
  "/favicon.ico",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Sprawdź, czy ścieżka jest publiczna
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Sprawdź, czy ścieżka jest związana z autentykacją
  const isAuthPath = authPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Jeśli ścieżka jest publiczna lub związana z autentykacją, kontynuuj
  if (isPublicPath || isAuthPath) {
    return NextResponse.next();
  }

  // Sprawdź token sesji
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  });

  // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
  if (!token) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Sprawdź uprawnienia dla ścieżki /admin
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Kontynuuj, jeśli użytkownik jest zalogowany i ma odpowiednie uprawnienia
  return NextResponse.next();
}

// Konfiguracja, które ścieżki powinny być sprawdzane przez middleware
export const config = {
  matcher: [
    /*
     * Dopasuj wszystkie ścieżki z wyjątkiem:
     * 1. Wszystkich ścieżek zaczynających się od api, _next, static, public, favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
