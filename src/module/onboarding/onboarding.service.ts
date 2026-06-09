/** @format */

import ErrorCode from "@/src/shared/enum/error-code";
import HttpStatus from "@/src/shared/enum/http";
import BadRequestException from "@/src/shared/error/bad-request-exception";
import InternalServerError from "@/src/shared/error/internal-server";
import { UserRole } from "@/src/shared/type/types";
import { JwtPayload, JwtSecretKey, verifyToken } from "@/src/shared/util/jwt";
import db from "@config/db.config.js";
import AuthService from "@module/auth/auth.service.js";
import {
 onboarding,
 onboarding_status,
 TOnboarding,
} from "@module/onboarding/onboarding.schema.js";
import { vendors } from "@module/vendor/vendor.schema.js";
import { and, eq } from "drizzle-orm";
import type { Response } from "express";

import { TUserSchema } from "../user/user.schema";
import Env from "@/src/config/env.config";

const Steps = {
 "0": "0",
 "1": "1",
 "2": "2",
} as const;

export type TSteps = keyof typeof Steps;

class OnboardingService<T extends TSteps, U extends TOnboarding> {
 constructor(protected auth: typeof AuthService) {
  this.auth = auth;
 }
 stepOne = async (vendorData: Partial<TUserSchema>, data: Partial<U>) => {
  const { state, city, address, instagram, facebook, twitter } = data;
  const { first_name, last_name, email, phone_number, user_type, password } =
   vendorData;

  const updateData: { [k: string]: string } = {};

  first_name && (updateData.firstName = first_name);
  last_name && (updateData.lastName = last_name);
  email && (updateData.email = email);
  phone_number && (updateData.phoneNumber = phone_number);
  password && (updateData.password = password);
  user_type && (updateData.userType = user_type);
  state && (updateData.state = state),
   city && (updateData.city = city),
   address && (updateData.address = address),
   instagram && (updateData.instagram = instagram),
   facebook && (updateData.facebook = facebook),
   twitter && (updateData.twitter = twitter);

  try {
   const [accessToken, refreshToken, vendorId, nextStep, stepOneStatus] =
    await db.transaction(async (tx) => {
     const { accessToken, refreshToken, data } = await this.auth.signup({
      first_name: updateData.firstName,
      last_name: updateData.lastName,
      email: updateData.email,
      password: updateData.password,
      user_type: updateData.userType as UserRole,
      phone_number: updateData.phoneNumber,
     });

     const payload: JwtPayload = await verifyToken(accessToken, JwtSecretKey);
     const vendorId = payload.id ?? null;
     const nextStep = "2";

     const [stepOneOnboard] = await tx
      .insert(onboarding)
      .values({
       vendor_id: vendorId,
       state: updateData.state,
       city: updateData.city,
       address: updateData.address,
       instagram: updateData.instagram,
       facebook: updateData.facebook,
       twitter: updateData.twitter,
       updated_at: new Date(Date.now()),
      })
      .onConflictDoNothing()
      .returning();

     const [stepOneStatus] = await tx
      .insert(onboarding_status)
      .values({
       onboardingId: stepOneOnboard.id,
       step1_completed: true,
       steps: nextStep,
       updated_at: new Date(Date.now()),
      })
      .onConflictDoNothing()
      .returning();

     return [accessToken, refreshToken, vendorId, nextStep, stepOneStatus];
    });

   return [accessToken, refreshToken, vendorId, nextStep, stepOneStatus];
  } catch (error) {
   throw error;
  }
 };

 stepTwo = async (vendorId: number, secondStep: T, data: Partial<U>) => {
  const {
   years_of_experience,
   cuisines,
   bank_name,
   account_number,
   is_verified,
  } = data;

  if (!secondStep || secondStep === "2") {
   throw new InternalServerError(
    "Invalid step",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR,
   );
  }

  const updateData: { [k: string]: any } = {};

  years_of_experience && (updateData.yearsOfExperience = years_of_experience),
   cuisines && (updateData.cuisines = cuisines),
   bank_name && (updateData.bankName = bank_name),
   account_number && (updateData.accountNumber = account_number),
   is_verified && (updateData.isVerified = is_verified);

  try {
   const { currentStep, nextStep, status } = await db.transaction(
    async (tx) => {
     const [stepTwoOnboard] = await tx
      .update(onboarding)
      .set({
       years_of_experience: updateData.yearsOfExperience,
       cuisines: updateData.cuisines,
       bank_name: updateData.bankName,
       account_number: updateData.accountNumber,
       is_verified: updateData.isVerified,
       updated_at: new Date(Date.now()),
      })
      .where(eq(onboarding.vendor_id, vendorId))
      .returning();

     const [currentStatus] = await tx
      .select()
      .from(onboarding_status)
      .where(
       and(
        eq(onboarding.vendor_id, vendorId),
        eq(onboarding_status.onboardingId, stepTwoOnboard.id),
       ),
      );

     if (
      !currentStatus.step1_completed ||
      typeof currentStatus.step1_completed === "undefined"
     ) {
      throw new BadRequestException(
       "Step 1 is not completed",
       HttpStatus.BAD_REQUEST,
       ErrorCode.VALIDATION_ERROR,
      );
     }

     const nextStep = "3";

     const [stepTwoStatus] = await tx
      .update(onboarding_status)
      .set({
       step2_completed: true,
       steps: nextStep,
       updated_at: new Date(Date.now()),
      })
      .where(eq(onboarding_status.onboardingId, stepTwoOnboard.id))
      .returning();

     return {
      currentStep: currentStatus.steps,
      nextStep: stepTwoStatus.steps,
      status: stepTwoStatus.step2_completed,
     };
    },
   );

   return [currentStep, nextStep, status];
  } catch (error) {
   throw error;
  }
 };

 stepThree = async (vendorId: number, lastStep: string, data: Partial<U>) => {
  const {
   government_id,
   business_certificate,
   display_image,
   confirmed_accuracy,
   accepted_terms,
   accepted_verification,
  } = data;

  if (!lastStep || lastStep === "3") {
   throw new InternalServerError(
    "Invalid step",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR,
   );
  }

  const updateData: any = {};

  government_id && (updateData.governmentId = government_id),
   business_certificate &&
    (updateData.businessCertificate = business_certificate),
   display_image && (updateData.displayImage = display_image),
   confirmed_accuracy && (updateData.confirmedAccuracy = confirmed_accuracy),
   accepted_terms && (updateData.acceptedTerms = accepted_terms),
   accepted_verification &&
    (updateData.acceptedVerification = accepted_verification);

  const { currentStep, nextStep, status } = await db.transaction(async (tx) => {
   try {
    const [stepTwoOnboard] = await tx
     .update(onboarding)
     .set({
      government_id: updateData.governmentId,
      business_certificate: updateData.businessCertificate,
      display_image: updateData.displayImage,
      confirmed_accuracy: updateData.confirmedAccuracy,
      accepted_terms: updateData.acceptedTerms,
      accepted_verification: updateData.acceptedVerification,
      completed_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
     })
     .where(eq(onboarding.vendor_id, vendorId))
     .returning();

    const [currentStatus] = await tx
     .select()
     .from(onboarding_status)
     .where(
      and(
       eq(onboarding.vendor_id, vendorId),
       eq(onboarding_status.onboardingId, stepTwoOnboard.id),
      ),
     );

    if (
     !currentStatus.step2_completed ||
     typeof currentStatus.step2_completed === "undefined"
    ) {
     throw new BadRequestException(
      "Step 2 is not completed",
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
     );
    }

    const [stepThreeStatus] = await tx
     .update(onboarding_status)
     .set({
      step3_completed: true,
      steps: null,
      submitted_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
     })
     .where(eq(onboarding_status.onboardingId, stepTwoOnboard.id))
     .returning();

    return {
     currentStep: currentStatus.steps,
     nextStep: stepThreeStatus.steps,
     status: stepThreeStatus.step3_completed,
    };
   } catch (error) {
    throw error;
   }
  });
 };

 getCurrentProcess = async (vendorId: number, userId: number) => {
  const [currentOnboardingProcess] = await db
   .select()
   .from(onboarding)
   .innerJoin(vendors, eq(onboarding.vendor_id, vendors.id))
   .innerJoin(
    onboarding_status,
    eq(onboarding_status.onboardingId, onboarding.id),
   )
   .where(and(eq(onboarding.vendor_id, vendorId), eq(vendors.user_id, userId)));

  if (currentOnboardingProcess)
   return [
    currentOnboardingProcess?.onboarding,
    currentOnboardingProcess?.onboarding_status,
   ];
 };
}

export default new OnboardingService<TSteps, TOnboarding>(AuthService);
