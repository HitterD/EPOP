import { NextRequest, NextResponse } from 'next/server'

let lastReindexAt: string | null = null

export async function POST(_req: NextRequest) {
  lastReindexAt = new Date().toISOString()
  return NextResponse.json({ success: true, data: { lastReindexAt } })
}

export async function GET() {
  return NextResponse.json({ success: true, data: { lastReindexAt } })
}
