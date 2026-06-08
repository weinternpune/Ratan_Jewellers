import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '../auth/route'

// ── POST /api/admin/create-staff — Super Admin only ───────────────────────
export async function POST(req: NextRequest) {
  // Verify caller is super_admin via cookie
  const token = req.cookies.get('ratan_admin_token')?.value
  if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const session = verifyToken(token) as any
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Only Super Admin can create staff accounts' }, { status: 403 })
  }
  if (session.exp < Date.now()) {
    return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })
  }

  try {
    const { name, email, phone, password, role, avatar } = await req.json()

    // Validate
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'Name, email, password and role are required' }, { status: 400 })
    }

    // Only allowed roles (super_admin cannot be created via API)
    const allowedRoles = ['admin', 'store_manager', 'inventory_manager', 'sales_staff']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ success: false, error: `Role must be one of: ${allowedRoles.join(', ')}` }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Store new staff in localStorage-based store (returned to client to save)
    const newStaff = {
      id:     `ST${Date.now()}`,
      name:   name.trim(),
      email:  email.trim().toLowerCase(),
      phone:  phone?.trim() || '',
      password, // stored server-side in env in real deployment
      role,
      avatar: avatar || name.trim().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      status: 'active' as const,
      createdBy: session.email,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, staff: newStaff })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
