import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "zh", "ko"];
const defaultLocale = "en";

// Get the preferred locale from the request
function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return pathname.split("/")[1] || defaultLocale;
  }

  const savedLocale = request.cookies.get("preferred-language")?.value;
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale;
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    if (acceptLanguage.includes("zh")) return "zh";
    if (acceptLanguage.includes("ko")) return "ko";
  }

  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/trpc") ||
    pathname.startsWith("/mcp-proxy") ||
    pathname.startsWith("/metamcp") ||
    pathname.startsWith("/oauth") ||
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/service") ||
    pathname.startsWith("/health") ||
    pathname.startsWith("/fe-oauth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  let locale = defaultLocale;
  let pathnameWithoutLocale = pathname;

  if (pathnameHasLocale) {
    locale = pathname.split("/")[1] || defaultLocale;
    pathnameWithoutLocale = pathname.slice(locale.length + 1) || "/";
  } else {
    locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  const publicRoutes = ["/login", "/register", "/", "/cors-error"];
  if (publicRoutes.includes(pathnameWithoutLocale)) {
    return NextResponse.next();
  }

  try {
    const originalHost =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "";

    const { data: session } = await betterFetch("/api/auth/get-session", {
      baseURL: "http://localhost:12009",
      headers: {
        cookie: request.headers.get("cookie") || "",
        host: originalHost,
        "x-forwarded-host": request.headers.get("x-forwarded-host") || "",
        "x-forwarded-proto": request.headers.get("x-forwarded-proto") || "",
        "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      },
    });

    if (!session) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathnameWithoutLocale);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathnameWithoutLocale);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next|api/|trpc|mcp-proxy|metamcp|oauth|fe-oauth|\.well-known|service|health|.*\\..*).*)",
  ],
  unstable_allowDynamic: [
    "**/node_modules/better-auth/**",
    "**/node_modules/@better-fetch/fetch/**",
    "**/node_modules/lodash/**",
    "**/node_modules/.pnpm/**",
  ],
};
