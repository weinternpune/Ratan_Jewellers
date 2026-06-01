import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDB } from './lib/db';
import { User } from './models/User';
import { Customer } from './models/Customer';
import { GoldRate, Category } from './models/index';

async function seed() {
  await connectDB();
  console.log('🌱 Seeding MongoDB...');
  const existing = await User.findOne({ email: 'admin@ratanjewellers.com' });
  if (!existing) {
    const hash = await bcrypt.hash('Admin@1234!', 12);
    const user = await User.create({ email: 'admin@ratanjewellers.com', name: 'Super Admin', role: 'SUPER_ADMIN', isVerified: true, passwordHash: hash });
    await Customer.create({ userId: user._id, referralCode: 'ADMIN001' });
    console.log('✅ Admin created: admin@ratanjewellers.com / Admin@1234!');
  } else { console.log('ℹ️  Admin already exists'); }

  const purities: Record<string,number> = { '24K':1, '22K':0.916, '18K':0.75, '14K':0.585 };
  for (const [purity, mult] of Object.entries(purities)) {
    await GoldRate.findOneAndUpdate({ purity }, { purity, ratePerGram: Math.round(6500*mult), date: new Date(), source: 'SEED' }, { upsert: true });
  }
  console.log('✅ Gold rates seeded');

  const cats = ['Necklaces','Rings','Bangles','Earrings','Chains','Pendants','Bracelets','Mangalsutras','Anklets','Bridal Sets'];
  for (const name of cats) {
    await Category.findOneAndUpdate({ slug: name.toLowerCase().replace(/ /g,'-') }, { name, slug: name.toLowerCase().replace(/ /g,'-'), isActive: true }, { upsert: true });
  }
  console.log('✅ Categories seeded\n🎉 Done!');
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
