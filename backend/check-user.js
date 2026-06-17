require('dotenv').config();
const mongoose = require('mongoose');

const identifier = process.argv[2];
if (!identifier) {
  console.log('Usage: node check-user.js <email-or-phone> [--delete]');
  process.exit(1);
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ratan_jewellers';
console.log('Connecting to:', uri.replace(/:\/\/.*@/, '://****@'));

mongoose.connect(uri).then(async () => {
  const users = mongoose.connection.collection('users');
  const query = { $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }] };
  const matches = await users.find(query).toArray();
  console.log('Matches found:', matches.length);
  matches.forEach(u => console.log('-', u.email, u.phone, u._id.toString()));

  if (process.argv[3] === '--delete' && matches.length) {
    const result = await users.deleteMany(query);
    console.log('Deleted:', result.deletedCount);
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
