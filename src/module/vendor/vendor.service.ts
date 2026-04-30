/** @format */

import {eq, and} from "drizzle-orm"
import {vendors, VendorSchema} from "@module/vendor/vendor.schema.js";
import {users} from "@module/user/user.schema.js";
import { addresses } from "@module/address/address.schema.js";

import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import NotFoundException from "@error/not-found-exception.js";
import db from "@/src/config/db.config";
import InternalServerError from "@/src/shared/error/internal-server";
import z from "zod";


const Update: Record<string, string> = {
  pending: "pending",
  approval: "approved",
  rejection: "rejected",
  suspension: "suspended"
} as const;

type UpdateType = string;

const VendorDispatcher: Record<string, any> = {
  approve: async (vendorId: number, userId: number, update: UpdateType) => {
      try {
        const newUpdate = await db.update(vendors).set({
          approval_status: update,
          approved_at: new Date(Date.now()),
          approved_by: userId
        }).where(
          and(
            eq(vendors.id, vendorId),
            eq(vendors.user_id, userId),
          )
        ).returning()
        return newUpdate[0];
      } catch (error) {
        throw error;
      }
  },
  reject: async (vendorId: number, userId: number, update: UpdateType, reason?: string) => {
    try {
      const newUpdate = await db.update(vendors).set({
        approval_status: update,
        rejection: reason
      }).where(
        and(
        eq(vendors.id, vendorId),
        eq(vendors.user_id, userId)
      )
      ).returning();
      return newUpdate[0];
    } catch (error) {
     throw error; 
    }
  },
  suspend: async (vendorId: number, userId: number, update: UpdateType) => {
    try {
      const newUpdate = await db.update(vendors).set({
        approval_status: update
      }).where(
        and(
        eq(vendors.id, vendorId),
        eq(vendors.user_id, userId)
      )
      ).returning();
      return newUpdate[0];
    } catch (error) {
      throw error;
    }
  }
}

class VendorBase<T extends VendorSchema> {
  modifyVendorStatus = async(
    vendorId: number, 
    userId: number, 
    handler: (vendorId: number, userId: number, update: UpdateType, reason?: string) => T) => {
    const [vendor] = await db.select().from(vendors).innerJoin(users, 
      eq(vendors.user_id, users.id)
    ).where(
      and(
        eq(vendors.id, vendorId),
        eq(vendors.user_id, userId)
      )
    )
    
    throwNotFoundException(vendor);

    return async (update: UpdateType, reason?: string): Promise<T> => {
      return await handler(vendorId, userId, update, reason);
    }
  }
}

class VendorService  extends VendorBase<VendorSchema>{
  getVendorProfile = async (vendorId: number, userId: number) => {
    const vendorProfile = await db.select().from(vendors).innerJoin(users, 
      eq(vendors.user_id, userId)
    ).innerJoin(addresses, 
        eq(vendors.address_id, addresses.id)
      ).where(
      and(
        eq(vendors.id, vendorId),
        eq(users.id, userId)
      )
    ).limit(1);


    return vendorProfile[0];
  };

  updateVendorProfile =
    async (
      vendorId: number,
      userId: number,
      body: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        businessName: string;
        businessDescription: string;
        businessLogoUrl: string;
      },
    ) => {
      const {
        firstName,
        lastName,
        phoneNumber,
        businessName,
        businessDescription,
        businessLogoUrl,
      } = body;

      const updateVendorData: {[k: string]: string} = {};
      const updateUserData: {[k: string]: string} = {};

      firstName && (updateUserData.first_name = firstName);
      lastName && (updateUserData.last_name = lastName);
      phoneNumber && (updateUserData.phone_number = phoneNumber);

      businessName && (updateVendorData.business_name = businessName);
      businessDescription && (updateVendorData.business_desc = businessDescription)
      businessLogoUrl && (updateVendorData.business_logo = businessLogoUrl);

      try {  
        const [userProfile, vendorProfile] = await db.transaction(async (tx) => {
          const user = await tx.update(users).set({
            first_name: updateUserData.first_name,
            last_name: updateUserData.last_name,
            phone_number: updateUserData.phone_number
          }).where(eq(users.id, userId)).returning();

          const vendor = await tx.update(vendors).set({
            business_name: updateVendorData.business_name,
            business_desc: updateVendorData.business_desc,
            business_logo: updateVendorData.business_logo
          }).where(eq(vendors.id, vendorId)).returning();

          if(!user || !vendor) {
            throw new InternalServerError(
              "Vendor profile update failed", 
              HttpStatus.INTERNAL_SERVER_ERROR, 
              ErrorCode.INTERNAL_SERVER_ERROR
            )
          }

          return [
            user[0],
            vendor[0]
          ]
        });

        if(!userProfile || !vendorProfile) {
          throw new NotFoundException(
            "Customer profile not found",
            HttpStatus.NOT_FOUND,
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }
        return [userProfile, vendorProfile]
      } catch (error) {
        throw error;
      }
    }

  approveVendor = async (vendorId: number, userId: number, userType: string) => {
    const vendor = await (
      await this.modifyVendorStatus(vendorId, userId, VendorDispatcher.approve)
    )(Update.approval)

    return vendor;
  };

  rejectVendor = async (vendorId: number, userId: number, reason?: string) => {
    const vendor = await (
      await this.modifyVendorStatus(vendorId, userId, VendorDispatcher.approve)
    )(Update.reject, reason)

    return vendor;
  };

  suspendVendor = async (vendorId: number, userId: number) => {
    const vendor = await (
      await this.modifyVendorStatus(vendorId, userId, VendorDispatcher.approve)
    )(Update.suspend)

    return vendor;
  };

  deleteVendorProfile = async (vendorId: number, userId: number) => {
    try {
      const [deletedVendorProfile] = await db.delete(vendors).where(
        and(
          eq(vendors.id, vendorId), 
          eq(vendors.user_id, userId))
        ).returning();

      if(!deletedVendorProfile) {
        throw new InternalServerError(
          "Unable to delete vendor profile", 
          HttpStatus.INTERNAL_SERVER_ERROR, 
          ErrorCode.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      throw error;
    }
  }
};


function throwNotFoundException(schema: z.infer<typeof vendors>) {
  if(!schema) {
    throw new NotFoundException(
    `${schema} not found`,
    HttpStatus.NOT_FOUND,
    ErrorCode.RESOURCE_NOT_FOUND
    )
  }
}


export default new VendorService();
