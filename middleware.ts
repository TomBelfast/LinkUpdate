import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
  try {
    console.log(`[${new Date().toISOString()}] Request:`, {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers)
    });
    
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
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
    if (!token) {
      // Użyj nagłówka host zamiast nextUrl.hostname (który może być 0.0.0.0)
      const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host') || request.nextUrl.host;
      const hostname = hostHeader ? hostHeader.split(':')[0] : (request.nextUrl.hostname || 'localhost');
      const port = hostHeader && hostHeader.includes(':') ? hostHeader.split(':')[1] : (request.nextUrl.port || '8888');
      const protocol = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol || 'http').replace(':', '');
      
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || 
                      (hostname && (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')));
      
      let baseUrl: string;
      if (process.env.NEXTAUTH_URL && !isLocal) {
        // Użyj NEXTAUTH_URL tylko dla żądań zewnętrznych (nie lokalnych)
        baseUrl = process.env.NEXTAUTH_URL;
      } else {
        // Dla lokalnych połączeń użyj tego samego protokołu i hosta
        baseUrl = `${protocol}://${hostname}${port ? ':' + port : ''}`;
      }
      const callbackUrl = `${baseUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
      const signInUrl = new URL("/auth/signin", baseUrl);
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
    }

    // Sprawdź uprawnienia dla ścieżki /admin
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      const hostHeader = request.headers.get('host') || request.headers.get('x-forwarded-host') || request.nextUrl.host;
      const hostname = hostHeader ? hostHeader.split(':')[0] : (request.nextUrl.hostname || 'localhost');
      const port = hostHeader && hostHeader.includes(':') ? hostHeader.split(':')[1] : (request.nextUrl.port || '8888');
      const protocol = (request.headers.get('x-forwarded-proto') || request.nextUrl.protocol || 'http').replace(':', '');
      
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || 
                      (hostname && (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')));
      
      let baseUrl: string;
      if (process.env.NEXTAUTH_URL && !isLocal) {
        baseUrl = process.env.NEXTAUTH_URL;
      } else {
        baseUrl = `${protocol}://${hostname}${port ? ':' + port : ''}`;
      }
      return NextResponse.redirect(new URL("/", baseUrl));
    }

    // Kontynuuj, jeśli użytkownik jest zalogowany i ma odpowiednie uprawnienia
    return NextResponse.next();
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
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