import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ratan_jewellers"
    );

    const hash = await bcrypt.hash("Admin@2025", 12);

    const result = await mongoose.connection.collection("users").updateOne(
      { email: "prabinakumardas90@gmail.com" },
      {
        $setOnInsert: {
          email: "prabinakumardas90@gmail.com",
          passwordHash: hash,
          name: "Priya",
          role: "ADMIN",
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    console.log(
      "User created:",
      result.upsertedCount > 0 ? "YES" : "ALREADY EXISTS"
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();
