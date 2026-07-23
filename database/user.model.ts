// database/user.model.ts
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
);

// ✅ Explicitly define indexes (visible in code review)
UserSchema.index({ email: 1 }, { unique: true }); // 👈 Email index
UserSchema.index({ createdAt: -1 }); // 👈 For sorting by newest first

export default mongoose.models.User || mongoose.model("User", UserSchema);
