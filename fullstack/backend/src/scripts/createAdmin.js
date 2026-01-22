import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("MONGO_URI =", process.env.MONGODB_URI);

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is undefined");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@example.com";
    const plainPassword = "Admin@123";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const exists = await Admin.findOne({ email });
    if (exists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    await Admin.create({ email, password: hashedPassword });
    console.log("✅ Admin created successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
};

createAdmin();
