import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDB } from './lib/db';
import { User } from './models/User';

const STAFF = [
  { name:'Rajesh Sharma', email:'rajesh@ratanjewellers.com', phone:'+919876543210', password:'SuperAdmin@2025#RJ', role:'SUPER_ADMIN'       as const },
  { name:'Priya Mehta',   email:'priya@ratanjewellers.com',  phone:'+918765432109', password:'Admin@2025#RJ',      role:'ADMIN'             as const },
  { name:'Suresh Patel',  email:'suresh@ratanjewellers.com', phone:'+917654321098', password:'Manager@2025#RJ',    role:'STORE_MANAGER'     as const },
  { name:'Anita Das',     email:'anita@ratanjewellers.com',  phone:'+916543210987', password:'Inventory@2025#RJ',  role:'INVENTORY_MANAGER' as const },
  { name:'Vikram Singh',  email:'vikram@ratanjewellers.com', phone:'+915432109876', password:'Sales@2025#RJ',      role:'SALES_STAFF'       as const },
  { name:'Kavya Reddy',   email:'kavya@ratanjewellers.com',  phone:'+914321098765', password:'Sales2@2025#RJ',     role:'SALES_STAFF'       as const },
];

async function seed() {
  await connectDB();
  console.log('\nSeeding staff accounts into MongoDB...\n');
  for (const s of STAFF) {
    const hash = await bcrypt.hash(s.password, 12);
    await User.findOneAndUpdate(
      { email: s.email },
      { name:s.name, email:s.email, phone:s.phone, passwordHash:hash, role:s.role, isActive:true, isVerified:true },
      { upsert: true, new: true }
    );
    console.log(`  ✓ ${s.role.padEnd(20)} ${s.email}`);
  }
  console.log('\nDone! All staff accounts are ready.\n');
  console.log('Credentials:');
  STAFF.forEach(s => console.log(`  ${s.email.padEnd(38)} ${s.password}`));
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
