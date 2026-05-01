import db from "@config/db.config.js";
import { vendors } from "@module/vendor/vendor.schema.js";
import { eq, and} from "drizzle-orm";
import { onboarding, onboarding_status, OnboardingSchema } from "@module/onboarding/onboarding.schema.js";
import AuthService from "@module/auth/auth.service.js";
import { JwtPayload, verifyToken } from "@/src/shared/util/jwt";
import { statusEnum } from "../user/user.schema";
import InternalServerError from "@/src/shared/error/internal-server";
import HttpStatus from "@/src/config/http.config";
import ErrorCode from "@/src/shared/enum/error-code";
import BadRequestException from "@/src/shared/error/bad-request-exception";

class OnboardingService {
 stepOne = async (vendorData: {
  firstName: string,
  lastName: string,
  email: string,
  userType: string,
  phoneNumber: string,
  password: string,
 },
 data: {
  state: string,
  city: string,
  address: string,
  instagram: string,
  facebook: string,
  twitter: string,
 }) => {
  const {state, city, address, instagram, facebook, twitter} = data;
  const {firstName, lastName, email, phoneNumber, userType, password} = vendorData;

  const updateData: {[k: string]: string} = {};

  firstName && (updateData.firstName = firstName);
  lastName && (updateData.lastName = lastName);
  email && (updateData.email = email);
  phoneNumber && (updateData.phoneNumber = phoneNumber);
  password && (updateData.password = password);
  userType && (updateData.userType = userType);
  state && (updateData.state = state),
  city && (updateData.city = city),
  address && (updateData.address = address),
  instagram && (updateData.instagram = instagram),
  facebook && (updateData.facebook = facebook),
  twitter && (updateData.twitter = twitter)

  try {
   const [vendorId, nextStep, stepOneStatus] = await db.transaction(async (tx) => {
    const {accessToken, refreshToken, data} = await AuthService.signup({
     firstName: updateData.firstName,
     lastName: updateData.lastName,
     email: updateData.email,
     password: updateData.password,
     userType: updateData.userType,
     phoneNumber: updateData.phoneNumber
    });

    const payload: JwtPayload = await verifyToken(accessToken);
    const vendorId = payload.id ?? null;
    const nextStep = 2 as unknown as "2";

    const [stepOneOnboard] = await tx.insert(onboarding).values({
     vendorId: vendorId,
     state: updateData.state,
     city: updateData.city,
     address: updateData.address,
     instagram: updateData.instagram,
     facebook: updateData.facebook,
     twitter: updateData.twitter,
     updated_at: new Date(Date.now()),
    }).onConflictDoNothing().returning()

    const [stepOneStatus] = await tx.insert(onboarding_status).values({
     onboardingId: stepOneOnboard.id,
     step1_completed: true,
     steps: nextStep,
     updated_at: new Date(Date.now()),
    }).onConflictDoNothing().returning();

    return [
     accessToken,
     refreshToken,
     vendorId,
     nextStep,
     stepOneStatus
    ]
   });

   return [
    
    vendorId,
    nextStep,
    stepOneStatus
   ]
  } catch (error) {
   throw error;
  }
 }

 stepTwo = async (vendorId: number, secondStep: string, data: {
  yearsOfExperience: number,
  cuisines: string, 
  bankName: string,
  accountNumber: string,
  isVerified: boolean
 }) => {
  const {yearsOfExperience, cuisines, bankName, accountNumber, isVerified} = data;

  if(!secondStep || secondStep === "2") {
   throw new InternalServerError(
    "Invalid step",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR
   )
  }

  const updateData: {[k: string]: any} = {};

  yearsOfExperience && (updateData.yearsOfExperience = yearsOfExperience),
  cuisines && (updateData.cuisines = cuisines),
  bankName && (updateData.bankName = bankName),
  accountNumber && (updateData.accountNumber = accountNumber),
  isVerified && (updateData.isVerified = isVerified);

  try {
   await db.transaction(async (tx) => {
    const [stepTwoOnboard] = await tx.update(onboarding).set({
     years_of_experience: updateData.yearsOfExperience,
     cuisines: updateData.cuisines,
     bank_name: updateData.bankName,
     account_number: updateData.accountNumber,
     is_verified: updateData.isVerified,
     updated_at: new Date(Date.now())
    }).where(
     eq(onboarding.vendorId, vendorId)
    ).returning()

    const [currentStatus] = await tx.select().from(onboarding_status).where(
     and(
      eq(onboarding.vendorId, vendorId),
      eq(onboarding_status.onboardingId, stepTwoOnboard.id)
     )
    );

    if(!currentStatus.step1_completed) {
     throw new BadRequestException(
      "Step 1 is not completed",
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
     )
    }

     const nextStep = 3 as unknown as "3";

     const [stepTwoStatus] = await tx.update(onboarding_status).set({
      step2_completed: true,
      steps: nextStep,
      updated_at: new Date(Date.now()),
     }).where(
      eq(onboarding_status.onboardingId, stepTwoOnboard.id)
     ).returning();

    return [
     nextStep,
     stepTwoStatus
    ]
   });
  } catch (error) {
   throw error;
  }
 }

 stepThree = async (vendorId: number, lastStep: string, data: {
  governmentId: string;
  businessCertificate: Record<string, string>;
  displayImage: Record<string, string>;
  confirmedAccuracy: true;
  acceptedTerms: true;
  acceptedVerification: true;
 }) => {
  const {governmentId, 
    businessCertificate, 
    displayImage, 
    confirmedAccuracy, 
    acceptedTerms, 
    acceptedVerification} = data;

  if(!lastStep || lastStep === "3") {
   throw new InternalServerError(
    "Invalid step",
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_SERVER_ERROR
   )
  }

  const updateData: any = {};

  governmentId && (updateData.governmentId = governmentId),
  businessCertificate && (updateData.businessCertificate = businessCertificate),
  displayImage && (updateData.displayImage = displayImage),
  confirmedAccuracy && (updateData.confirmedAccuracy = confirmedAccuracy),
  acceptedTerms && (updateData.acceptedTerms = acceptedTerms),
  acceptedVerification && (updateData.acceptedVerification = acceptedVerification)

  await db.transaction(async (tx) => {
   try {
     const [stepTwoOnboard] = await tx.update(onboarding).set({
      governmentId: updateData.governmentId,
      business_certificate: updateData.businessCertificate,
      display_image: updateData.displayImage,
      confirmed_accuracy: updateData.confirmedAccuracy,
      accepted_terms: updateData.acceptedTerms,
      accepted_verification: updateData.acceptedVerification,
      completed_at: new Date(Date.now()),
      updated_at: new Date(Date.now())
     }).returning();

     const [currentStatus] = await tx.select().from(onboarding_status).where(
      and(
       eq(onboarding.vendorId, vendorId),
       eq(onboarding_status.onboardingId, stepTwoOnboard.id)
      )
     );
 
     if(!currentStatus.step2_completed) {
      throw new BadRequestException(
       "Step 1 is not completed",
       HttpStatus.BAD_REQUEST,
       ErrorCode.VALIDATION_ERROR,
      )
     }

     const [stepThreeStatus] = await tx.update(onboarding_status).set({
      step3_completed: true,
      steps: null,
      submitted_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
     })
     .where(
      eq(onboarding_status.onboardingId, stepTwoOnboard.id)
     ).returning();
     
     return [
      stepThreeStatus
     ]
   } catch (error) {
     throw error
   }
  });
 }

 getCurrentProcess = async (vendorId: number, userId: number) => {
  const currentOnboardingProcess = await db.select().from(onboarding).where(
    and(
    eq(onboarding.vendorId, vendorId),
    eq(vendors.user_id, userId)
  ));

  return currentOnboardingProcess[0];
 }
}


export default new OnboardingService()