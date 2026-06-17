import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./User";

dotenv.config();

const ADMIN_EMAIL = "prabinakumardas90@gmail.com";
const ADMIN_PASSWORD = "Admin@2025";

async function createAdmin() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ratan_jewellers";
    await mongoose.connect(uri);
    console.log("Connected to host:", mongoose.connection.host, "| db:", mongoose.connection.name);

    // Wipe any existing record for this email so a stale/partial account
    // (no password, wrong role, OAuth-created, etc.) can't block login.
    const deleted = await User.deleteMany({ email: ADMIN_EMAIL.toLowerCase().trim() });
    console.log("Removed existing records:", deleted.deletedCount);

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await User.create({
      email: ADMIN_EMAIL.toLowerCase().trim(),
      passwordHash,
      name: "Priya",
      role: "SUPER_ADMIN",
      isActive: true,
      isVerified: true,
    });

    console.log("✅ Admin ready:", admin.email, admin.role, admin._id.toString());
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
