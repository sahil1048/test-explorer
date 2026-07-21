export interface CursorPage<T> { data: T[]; nextCursor: string | null; hasMore: boolean }
export interface ApiError { code: string; message: string; requestId: string; details?: Record<string, unknown> }
export interface RateLimitDecision { allowed: boolean; limit: number; remaining: number; resetAt: Date }

export interface RateLimiter {
  consume(input: { organizationId: string; keyId?: string; route: string; cost?: number }): Promise<RateLimitDecision>
}

export function apiSuccess<T>(data: T, requestId: string) { return { data, meta: { requestId } } }
export function apiFailure(error: ApiError) { return { error } }
