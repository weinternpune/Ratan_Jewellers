import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

interface StaffRecord {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: AdminRole
  avatar: string
  status: 'active' | 'inactive'
}

// ── Load accounts from env — passwords NEVER leave server ─────────────────
function getEnvAccounts(): StaffRecord[] {
  const base: StaffRecord[] = [
    {
      id:       process.env.SA_ID       || 'SA001',
      name:     process.env.SA_NAME     || 'Super Admin',
      email:    process.env.SA_EMAIL    || '',
      phone:    process.env.SA_PHONE    || '',
      password: process.env.SA_PASSWORD || '',
      role:     'super_admin',
      avatar:   process.env.SA_AVATAR   || 'SA',
      status:   'active',
    },
    {
      id:       process.env.AD_ID       || 'AD001',
      name:     process.env.AD_NAME     || 'Admin',
      email:    process.env.AD_EMAIL    || '',
      phone:    process.env.AD_PHONE    || '',
      password: process.env.AD_PASSWORD || '',
      role:     'admin',
      avatar:   process.env.AD_AVATAR   || 'AD',
      status:   'active',
    },
    {
      id:       process.env.SM_ID       || 'SM001',
      name:     process.env.SM_NAME     || 'Store Manager',
      email:    process.env.SM_EMAIL    || '',
      phone:    process.env.SM_PHONE    || '',
      password: process.env.SM_PASSWORD || '',
      role:     'store_manager',
      avatar:   process.env.SM_AVATAR   || 'SM',
      status:   'active',
    },
    {
      id:       process.env.IM_ID       || 'IM001',
      name:     process.env.IM_NAME     || 'Inventory Manager',
      email:    process.env.IM_EMAIL    || '',
      phone:    process.env.IM_PHONE    || '',
      password: process.env.IM_PASSWORD || '',
      role:     'inventory_manager',
      avatar:   process.env.IM_AVATAR   || 'IM',
      status:   'active',
    },
    {
      id:       process.env.SS1_ID       || 'SS001',
      name:     process.env.SS1_NAME     || 'Sales Staff 1',
      email:    process.env.SS1_EMAIL    || '',
      phone:    process.env.SS1_PHONE    || '',
      password: process.env.SS1_PASSWORD || '',
      role:     'sales_staff',
      avatar:   process.env.SS1_AVATAR   || 'S1',
      status:   'active',
    },
    {
      id:       process.env.SS2_ID       || 'SS002',
      name:     process.env.SS2_NAME     || 'Sales Staff 2',
      email:    process.env.SS2_EMAIL    || '',
      phone:    process.env.SS2_PHONE    || '',
      password: process.env.SS2_PASSWORD || '',
      role:     'sales_staff',
      avatar:   process.env.SS2_AVATAR   || 'S2',
      status:   'active',
    },
  ].filter(a => a.email && a.password) // skip any unconfigured accounts

  // Also load dynamically created staff from env-like storage
  // (super admin created accounts stored server-side in a JSON env var)
  try {
    const extra = process.env.EXTRA_STAFF
    if (extra) {
      const parsed: StaffRecord[] = JSON.parse(extra)
      base.push(...parsed)
    }
  } catch {}

  return base
}

// ── Simple HMAC token (no external JWT lib needed) ────────────────────────
function signToken(payload: object): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret-change-me'
  const data = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return Buffer.from(data).toString('base64') + '.' + sig
}

export function verifyToken(token: string): object | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-me'
    const [dataB64, sig] = token.split('.')
    const data = Buffer.from(dataB64, 'base64').toString()
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex')
    if (sig !== expected) return null
    return JSON.parse(data)
  } catch {
    return null
  }
}

// ── POST /api/admin/auth — login ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()
    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }

    const accounts = getEnvAccounts()
    const id = identifier.trim().toLowerCase().replace(/\s/g, '')

    const account = accounts.find(a =>
      (a.email.toLowerCase() === id || a.phone.replace(/\s/g, '') === id) &&
      a.password === password.trim()
    )

    if (!account) {
      // Generic error — don't reveal whether email or password is wrong
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (account.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'This account has been deactivated' }, { status: 403 })
    }

    // Build session — NEVER include password in token
    const sessionPayload = {
      id:     account.id,
      name:   account.name,
      email:  account.email,
      phone:  account.phone,
      role:   account.role,
      avatar: account.avatar,
      status: account.status,
      exp:    Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    }

    const token = signToken(sessionPayload)

    const res = NextResponse.json({
      success: true,
      user: sessionPayload,
      token,
    })

    // Set httpOnly cookie so JS cannot read it
    res.cookies.set('ratan_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    })

    return res
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// ── DELETE /api/admin/auth — logout ──────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('ratan_admin_token')
  return res
}
