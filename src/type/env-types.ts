/** @format */

import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code";

import mongoose, { Document } from "mongoose";
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export type MailerCallback = (transporter: Transporter, data: MailData) => Promise<Mail>;

export type MailData = {
  user: UserDocument;
  message: string;
};

export type EnvConfig = {
  PORT: string;
  HOST_NAME: string;
  MONGODB_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  CORS_ORIGIN?: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  FROM: string;
};

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus];

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export const CategoryType = {
  LOCAL: "local",
  CONTINENTAL: "continental",
  VEGAN: "vegan",
  PASTRY: "pastry",
  OTHER: "other",
} as const;

export type CategoryValueType = (typeof CategoryType)[keyof typeof CategoryType];

export interface AddressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  label: "home" | "work" | "other";
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface CartDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  meals: {
    mealId: mongoose.Types.ObjectId;
    price: number;
    quantity: number;
    totalPrice: number;
  }[];
  totalAmount: number;
}

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CustomerDocument extends Document {
  userId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  profileImageUrl: string;
}

export interface FavouritesDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  favouriteMeals: mongoose.Types.ObjectId[];
}

export interface MealDocument extends Document {
  vendorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  categoryName: string;
  description: string;
  price: number;
  isAvailable: string;
  availableFrom: string;
  availableUntil: string;
  primaryImageUrl: string;
  additionalImages: Array<string>;
  tags: Array<string>;
  preparationTime: number;
  servingSize: string;
  additionalData: string;
  isDeleted: boolean;
}

export interface MealCategoryDocument extends Document {
  category: string;
  description: string;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  emailToken: string;
  emailTokenExpiry: Date;
  otp: string;
  otpExpiry: Date;
  refreshToken: string;
  refreshTokenExpiry: Date;
  status: string;
  userType: string;
  authType: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "passwordHash">;
}

export interface VendorDocument extends Document {
  userId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  businessName: string;
  businessDescription: string;
  businessLogoUrl: string;
  approvalStatus: string;
  approvedBy: mongoose.Types.ObjectId;
  approvedAt: Date;
  rejectionReason: string;
  additionalData: Object;
}
