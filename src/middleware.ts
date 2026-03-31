import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_vinext/|login|signup|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$).*)',
  ],
};
