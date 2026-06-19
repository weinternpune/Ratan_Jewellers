const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login Process...');
    await mongoose.connect('mongodb://localhost:27017/ratan_jewellers');
    console.log('✅ Connected to MongoDB');

    const identifier = 'rajesh@ratanjewellers.com';
    const password = 'SuperAdmin@2025#RJ';

    console.log(`\n🔍 Looking for user: ${identifier}`);
    
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Has Password Hash: ${user.passwordHash ? 'YES' : 'NO'}`);

    // Check role
    const ADMIN_ROLES = ['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER'];
    if (!ADMIN_ROLES.includes(user.role)) {
      console.log('❌ User is not an admin!');
      return;
    }
    console.log('✅ User has admin role');

    // Check if active
    if (!user.isActive) {
      console.log('❌ User account is deactivated!');
      return;
    }
    console.log('✅ User account is active');

    // Check password
    console.log('\n🔒 Testing password...');
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      console.log('❌ Password does not match!');
      return;
    }
    console.log('✅ Password matches!');

    // Generate tokens
    console.log('\n🎫 Generating tokens...');
    const jwtSecret = process.env.JWT_SECRET || '8kX92@mnP#qL7zV$Rt!2BxPq2026';
    const jwtRefresh = process.env.JWT_REFRESH_SECRET || '9uY#72Lm@vQx!P4sKd2026Refresh';
    
    const accessToken = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '8h' });
    const refreshToken = jwt.sign({ userId: user._id }, jwtRefresh, { expiresIn: '7d' });

    console.log('✅ Tokens generated successfully!');
    console.log(`   Access Token: ${accessToken.substring(0, 30)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 30)}...`);

    console.log('\n🎉 Login test SUCCESSFUL! All steps passed.');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Login test failed:', error);
  }
}

testAdminLogin();