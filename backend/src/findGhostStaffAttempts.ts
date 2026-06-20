import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/User';
import { Order } from './models/Order';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers';

// Usage:
//   List every CUSTOMER-role account with zero orders (safe, deletes nothing):
//     npx ts-node src/findGhostStaffAttempts.ts
//
//   Delete specific ones by _id, after reviewing the list above:
//     npx ts-node src/findGhostStaffAttempts.ts --delete <id1> <id2> <id3> ...
//
// A record only ever shows up here if role === CUSTOMER AND it has placed
// zero orders — a real shopper will always fail that second condition.

async function run() {
  const shouldDelete = process.argv.includes('--delete');
  const idsToDelete = shouldDelete
    ? process.argv.slice(process.argv.indexOf('--delete') + 1)
    : [];

  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  if (shouldDelete) {
    if (idsToDelete.length === 0) {
      console.log('No ids given after --delete. Nothing to do.');
      await mongoose.disconnect();
      return;
    }

    for (const id of idsToDelete) {
      const user = await User.findById(id);
      if (!user) {
        console.log(`SKIP ${id}: not found`);
        continue;
      }
      if (user.role !== 'CUSTOMER') {
        console.log(`SKIP ${id}: role is ${user.role}, not CUSTOMER — refusing to delete`);
        continue;
      }
      const orderCount = await Order.countDocuments({ userId: user._id });
      if (orderCount > 0) {
        console.log(`SKIP ${id}: has ${orderCount} real order(s) — refusing to delete`);
        continue;
      }
      await User.findByIdAndDelete(id);
      console.log(`DELETED ${id} (${user.email})`);
    }

    await mongoose.disconnect();
    return;
  }

  // --- listing mode ---
  const customerUsers = await User.find({ role: 'CUSTOMER' }).sort({ createdAt: 1 });

  const candidates: any[] = [];
  for (const user of customerUsers) {
    const orderCount = await Order.countDocuments({ userId: user._id });
    if (orderCount === 0) {
      candidates.push({ user, orderCount });
    }
  }

  if (candidates.length === 0) {
    console.log('No CUSTOMER-role accounts with zero orders found. Nothing to clean up.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${candidates.length} CUSTOMER-role account(s) with ZERO orders:\n`);
  candidates.forEach(({ user }, i) => {
    console.log(`${i + 1}. _id:        ${user._id}`);
    console.log(`   name:       ${user.name}`);
    console.log(`   email:      ${user.email}`);
    console.log(`   phone:      ${user.phone || '(none)'}`);
    console.log(`   isVerified: ${user.isVerified}`);
    console.log(`   createdAt:  ${(user as any).createdAt || '(unknown)'}`);
    console.log('');
  });

  console.log('Nothing was deleted. Review the list above.');
  console.log('Some of these may be real customers who simply haven\'t ordered yet —');
  console.log('only delete the ones you recognize as your own staff-creation test attempts.\n');
  console.log('To delete specific ones, copy their _id and run:');
  console.log(`  npx ts-node src/findGhostStaffAttempts.ts --delete <id1> <id2> ...`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
