import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || ''
const encodedKey = new TextEncoder().encode(secretKey)

export async function proxy(request: NextRequest) {
    console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`)
    const session = request.cookies.get('session')?.value
    console.log(`[Proxy] Session cookie: ${session ? 'Present' : 'Missing'}`)

    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up')

    // 1. If trying to access dashboard without session, redirect to sign-in
    if (isDashboard && !session) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // 2. If on auth page with valid session, redirect to dashboard
    if (isAuthPage && session) {
        try {
            await jwtVerify(session, encodedKey, {
                algorithms: ['HS256'],
            })
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } catch (error) {
            // Session invalid, let them stay on auth page (and maybe clear cookie?)
            // For now, just proceed, the session is invalid so they can sign in again.
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
}
