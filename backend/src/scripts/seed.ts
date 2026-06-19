/**
 * Ratan Jewellers — Database Seed Script
 * Usage:  cd backend && npm run seed
 * Creates all default admin/staff/customer accounts.
 * Safe to run multiple times — skips existing users.
 */
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers'

const SEED_USERS = [
  { name: 'Super Admin',      email: 'superadmin@ratanjewellers.com', password: 'SuperAdmin@2025#RJ',  role: 'SUPER_ADMIN',        phone: '+919000000001' },
  { name: 'Admin',            email: 'admin@ratanjewellers.com',      password: 'Admin@2025#RJ',        role: 'ADMIN',              phone: '+919000000002' },
  { name: 'Rajesh Kumar',     email: 'rajesh@ratanjewellers.com',     password: 'SuperAdmin@2025#RJ',   role: 'SUPER_ADMIN',        phone: '+919000000007' },
  { name: 'Priya Sharma',     email: 'priya@ratanjewellers.com',      password: 'Admin@2025#RJ',        role: 'ADMIN',              phone: '+919000000008' },
  { name: 'Store Manager',    email: 'manager@ratanjewellers.com',    password: 'Manager@2025#RJ',      role: 'STORE_MANAGER',      phone: '+919000000003' },
  { name: 'Sales Staff',      email: 'sales@ratanjewellers.com',      password: 'Sales@2025#RJ',        role: 'SALES_STAFF',        phone: '+919000000004' },
  { name: 'Inventory Manager',email: 'inventory@ratanjewellers.com',  password: 'Inventory@2025#RJ',    role: 'INVENTORY_MANAGER',  phone: '+919000000005' },
  { name: 'Test Customer',    email: 'customer@ratanjewellers.com',   password: 'Customer@2025#RJ',     role: 'CUSTOMER',           phone: '+919000000006' },
]

const UserSchema = new mongoose.Schema({
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:        { type: String, unique: true, sparse: true, trim: true },
  passwordHash: String,
  name:         { type: String, required: true },
  role:         { type: String, default: 'CUSTOMER' },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: true },
}, { timestamps: true })

const CustomerSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  referralCode:  { type: String, unique: true },
  loyaltyPoints: { type: Number, default: 0 },
  totalPurchases:{ type: Number, default: 0 },
  segment:       { type: String, default: 'standard' },
}, { timestamps: true })

async function seed() {
  console.log('\n🌱  Ratan Jewellers — Seed Script')
  console.log('─'.repeat(60))
  await mongoose.connect(MONGO_URI)
  console.log(`✅  MongoDB connected: ${MONGO_URI}\n`)

  const UserModel     = mongoose.models.User     || mongoose.model('User',     UserSchema)
  const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)

  let created = 0, skipped = 0, updated = 0

  for (const u of SEED_USERS) {
    const exists = await UserModel.findOne({ email: u.email })
    if (exists) {
      // Update password in case it changed
      const hash = await bcrypt.hash(u.password, 12)
      await UserModel.updateOne({ email: u.email }, { passwordHash: hash, isActive: true, isVerified: true })
      console.log(`🔄  Updated  ${u.role.padEnd(20)} ${u.email}`)
      updated++
      continue
    }
    const passwordHash = await bcrypt.hash(u.password, 12)
    const user = await UserModel.create({ ...u, passwordHash, isActive: true, isVerified: true })
    await CustomerModel.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() }).catch(() => {})
    console.log(`✅  Created  ${u.role.padEnd(20)} ${u.email}`)
    created++
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`📊  ${created} created · ${updated} updated · ${skipped} skipped`)
  console.log('\n🔑  Login Credentials:')
  console.log('─'.repeat(60))
  SEED_USERS.forEach(u => console.log(`  ${u.role.padEnd(22)} ${u.email.padEnd(40)} ${u.password}`))
  console.log('─'.repeat(60))
  console.log('\n  Admin Panel : http://localhost:3000/admin/login')
  console.log('  Store       : http://localhost:3000\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => { console.error('\n❌  Seed failed:', err.message); process.exit(1) })
