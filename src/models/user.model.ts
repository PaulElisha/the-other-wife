/** @format */

import mongoose, { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  pushToken: string;
  resetToken: string | null;
  resetTokenExpiry: number | null;
  status: string;
  userType: string;
  authType: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pushToken: {
      type: String,
      required: false,
    },
    resetToken: {
      type: String,
      required: false,
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    userType: {
      type: String,
      required: false,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    authType: {
      type: String,
      enum: ["email", "google", "phone"],
      default: "phone",
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    lastLogin: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
      next();
    } catch (error) {
      console.error("Error hashing password:", error);
      next(error as Error);
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  passwordHash: string,
): Promise<boolean> {
  return await bcrypt.compare(passwordHash, this.passwordHash);
};

UserSchema.methods.omitPassword = function (): Omit<
  UserDocument,
  "passwordHash"
> {
  const { passwordHash, ...user } = this.toObject();
  return user;
};

export default model<UserDocument>("User", UserSchema);
