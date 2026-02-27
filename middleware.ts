import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privateRoutes = [
  "/dashboard",
  "/kanban",
  "/clientes",
  "/crm/contratos",
  "/indicacoes",
  "/financeiro",
  "/produtos-servicos"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("nc_session")?.value);

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/dashboard" : "/login", request.url));
  }

  if (privateRoutes.some((route) => pathname.startsWith(route)) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/kanban/:path*", "/clientes/:path*", "/crm/:path*", "/indicacoes/:path*", "/financeiro/:path*", "/produtos-servicos/:path*"]
  matcher: ["/", "/login", "/dashboard/:path*", "/kanban/:path*", "/clientes/:path*", "/crm/:path*", "/indicacoes/:path*", "/produtos-servicos/:path*"]
};
