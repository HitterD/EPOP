import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'

describe('idempotency store', () => {
  it('returns cached response for same key', () => {
    const key = 'k1'
    const body = { success: true }
    setIdempotent(key, 200, body)
    const cached = getIdempotent(key)
    expect(cached).toBeDefined()
    expect(cached?.status).toBe(200)
    expect(cached?.body).toEqual(body)
  })
})
