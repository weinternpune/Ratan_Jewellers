const mongoose = require('mongoose');

// User schema (simplified)
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  passwordHash: String,
  isActive: Boolean,
  lastLogin: Date
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ratan_jewellers');
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking admin users...');
    const users = await User.find({}).select('email name role isActive lastLogin');
    
    console.log(`\n📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Last Login: ${user.lastLogin || 'Never'}`);
    });

    // Test specific admin user
    console.log('\n🎯 Testing specific admin user...');
    const adminUser = await User.findOne({ 
      email: 'rajesh@ratanjewellers.com' 
    }).select('email name role isActive passwordHash');
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Has Password: ${adminUser.passwordHash ? 'YES' : 'NO'}`);
    } else {
      console.log('❌ Admin user NOT found!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();