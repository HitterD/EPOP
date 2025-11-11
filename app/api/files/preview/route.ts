import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPreviewSource } from '@/server/files/preview'

const QuerySchema = z.object({
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  size: z.coerce.number().int().min(1024).max(16 * 1024 * 1024).optional(), // allow override up to 16MB
})

export async function GET(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  }

  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    sha256: url.searchParams.get('sha256') || '',
    size: url.searchParams.get('size') || undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid query parameters' } }, { status: 400 })
  }

  const { sha256, size } = parsed.data
  const src = getPreviewSource(sha256, size)

  const range = req.headers.get('range')
  const total = src.size

  const headers = new Headers()
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Content-Type', 'application/octet-stream')
  headers.set('Cache-Control', 'no-store')

  if (range) {
    // Parse Range: bytes=start-end
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (!match) {
      return new NextResponse(null, { status: 416 })
    }
    const startStr = match[1]
    const endStr = match[2]

    const start = startStr === '' ? 0 : Math.min(parseInt(startStr, 10), total - 1)
    const end = endStr === '' ? total - 1 : Math.min(parseInt(endStr, 10), total - 1)

    if (start > end || isNaN(start) || isNaN(end)) {
      return new NextResponse(null, { status: 416 })
    }

    const chunk = src.getRange(start, end)
    headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
    headers.set('Content-Length', String(chunk.byteLength))

    return new NextResponse(chunk, { status: 206, headers })
  }

  // Full content
  const chunk = src.getRange(0, total - 1)
  headers.set('Content-Length', String(chunk.byteLength))
  return new NextResponse(chunk, { status: 200, headers })
}
