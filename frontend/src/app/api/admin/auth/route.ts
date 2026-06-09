import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

interface StaffRecord {
  id: string; name: string; email: string; phone: string
  password: string; role: AdminRole; avatar: string; status: 'active' | 'inactive'
}

// Default accounts — work without .env.local (safe for team pull)
// Override any of these via .env.local for production
const DEFAULT_ACCOUNTS: StaffRecord[] = [
  { id:'SA001', name:'Rajesh Sharma',   email:'rajesh@ratanjewellers.com', phone:'+919876543210', password:'SuperAdmin@2025#RJ', role:'super_admin',       avatar:'RS', status:'active' },
  { id:'AD001', name:'Priya Mehta',     email:'priya@ratanjewellers.com',  phone:'+918765432109', password:'Admin@2025#RJ',      role:'admin',             avatar:'PM', status:'active' },
  { id:'SM001', name:'Suresh Patel',    email:'suresh@ratanjewellers.com', phone:'+917654321098', password:'Manager@2025#RJ',    role:'store_manager',     avatar:'SP', status:'active' },
  { id:'IM001', name:'Anita Das',       email:'anita@ratanjewellers.com',  phone:'+916543210987', password:'Inventory@2025#RJ',  role:'inventory_manager', avatar:'AD', status:'active' },
  { id:'SS001', name:'Vikram Singh',    email:'vikram@ratanjewellers.com', phone:'+915432109876', password:'Sales@2025#RJ',      role:'sales_staff',       avatar:'VS', status:'active' },
  { id:'SS002', name:'Kavya Reddy',     email:'kavya@ratanjewellers.com',  phone:'+914321098765', password:'Sales2@2025#RJ',     role:'sales_staff',       avatar:'KR', status:'active' },
]

function getAccounts(): StaffRecord[] {
  // Merge: env vars override defaults where provided
  const accounts = DEFAULT_ACCOUNTS.map(def => ({
    ...def,
    email:    process.env[`${def.id.replace(/\d/g,'')}_EMAIL`]    || def.email,
    password: process.env[`${def.id.replace(/\d/g,'')}_PASSWORD`] || def.password,
    name:     process.env[`${def.id.replace(/\d/g,'')}_NAME`]     || def.name,
  }))

  // Also load dynamically created staff
  try {
    const extra = process.env.EXTRA_STAFF
    if (extra) accounts.push(...JSON.parse(extra))
  } catch {}

  return accounts
}

function signToken(payload: object): string {
  const secret = process.env.JWT_SECRET || 'ratan-jewellers-jwt-secret-2025'
  const data = JSON.stringify(payload)
  const sig = crypto.createHmac('sha256', secret).update(data).digest('hex')
  return Buffer.from(data).toString('base64') + '.' + sig
}

export function verifyToken(token: string): any | null {
  try {
    const secret = process.env.JWT_SECRET || 'ratan-jewellers-jwt-secret-2025'
    const [dataB64, sig] = token.split('.')
    const data = Buffer.from(dataB64, 'base64').toString()
    const expected = crypto.createHmac('sha256', secret).update(data).digest('hex')
    if (sig !== expected) return null
    return JSON.parse(data)
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json()
    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 })
    }
    const id = identifier.trim().toLowerCase().replace(/\s/g, '')
    const accounts = getAccounts()
    const account = accounts.find(a =>
      (a.email.toLowerCase() === id || a.phone.replace(/\D/g,'') === id.replace(/\D/g,'')) &&
      a.password === password.trim()
    )
    if (!account) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    if (account.status === 'inactive') return NextResponse.json({ success: false, error: 'Account deactivated' }, { status: 403 })

    const session = { id:account.id, name:account.name, email:account.email, phone:account.phone, role:account.role, avatar:account.avatar, status:account.status, exp: Date.now() + 8*60*60*1000 }
    const token = signToken(session)
    const res = NextResponse.json({ success: true, user: session, token })
    res.cookies.set('ratan_admin_token', token, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', maxAge:8*60*60, path:'/' })
    return res
  } catch { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('ratan_admin_token')
  return res
}
