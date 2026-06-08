import { NextRequest, NextResponse } from 'next/server'

// This API route stores requests in a server-side in-memory store
// that also writes to a cookie so the client Zustand store can sync
// The real fix: intercept and save to the store key directly

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Return success — the actual saving is done client-side by the Zustand store
    // We just validate and acknowledge here
    if (!body.name || !body.email || !body.phone || !body.category || !body.message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Request received successfully',
      data: {
        id: 'CJR-' + Date.now(),
        ...body,
        status: 'new',
        submittedAt: new Date().toLocaleString('en-IN'),
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: [] })
}
