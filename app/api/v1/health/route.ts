import { NextResponse } from 'next/server'
import { apiSuccess } from '@/lib/platform/api'

export async function GET(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  return NextResponse.json(apiSuccess({ status: 'available', version: 'v1' }, requestId), {
    headers: { 'x-request-id': requestId, 'cache-control': 'no-store' },
  })
}
