import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers';

// Usage:
//   npx ts-node src/findDeleteUserByEmail.ts someone@example.com
//   npx ts-node src/findDeleteUserByEmail.ts someone@example.com --delete

async function run() {
  const email = process.argv[2];
  const shouldDelete = process.argv.includes('--delete');

  if (!email) {
    console.log('Usage: npx ts-node src/findDeleteUserByEmail.ts <email> [--delete]');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    console.log(`No user found with email: ${normalizedEmail}`);
    await mongoose.disconnect();
    return;
  }

  console.log('Found user:');
  console.log(`  _id:        ${user._id}`);
  console.log(`  name:       ${user.name}`);
  console.log(`  email:      ${user.email}`);
  console.log(`  phone:      ${user.phone || '(none)'}`);
  console.log(`  role:       ${user.role}`);
  console.log(`  isActive:   ${user.isActive}`);
  console.log(`  isVerified: ${user.isVerified}`);
  console.log(`  createdAt:  ${(user as any).createdAt || '(unknown)'}`);

  if (!shouldDelete) {
    console.log('\nThis was a dry run — nothing was deleted.');
    console.log('If this is the right record, re-run with --delete to remove it:');
    console.log(`  npx ts-node src/findDeleteUserByEmail.ts ${email} --delete`);
  } else {
    if (user.role === 'SUPER_ADMIN') {
      console.log('\nRefusing to delete: this account is SUPER_ADMIN. Not deleting.');
    } else {
      await User.findByIdAndDelete(user._id);
      console.log('\nDeleted.');
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
