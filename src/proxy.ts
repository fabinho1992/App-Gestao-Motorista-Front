import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/registrar']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ← adiciona isso — ignora arquivos estáticos com extensão
  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (isPublic) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}