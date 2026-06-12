require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers')
  .then(async () => {
    const hash = await bcrypt.hash('Admin@2025', 12);
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'prabinakumardas90@gmail.com' },
      { $setOnInsert: {
        email: 'prabinakumardas90@gmail.com',
        passwordHash: hash,
        name: 'Priya',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }},
      { upsert: true }
    );

    console.log('User created:', result.upsertedCount ? 'YES' : 'ALREADY EXISTS');
    process.exit(0);
  })
  .catch(e => { console.error(e.message); process.exit(1); });
