import { NextResponse } from 'next/server'
import { RealtimeBus } from '@/lib/socket'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
      )

      // Subscribe to real-time events
      const unsubscribe = RealtimeBus.subscribe((payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        } catch {
          unsubscribe()
        }
      })

      // Interval keepalive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`))
        } catch {
          clearInterval(interval)
          unsubscribe()
        }
      }, 15000)
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    RealtimeBus.emit({
      ...payload,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({ success: true, subscribers: RealtimeBus.listenerCount() })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Event yayınlanamadı'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
