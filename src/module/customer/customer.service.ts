/** @format */

import { eq, and } from "drizzle-orm"
import db from "@config/db.config";

import { customers } from "@module/customer/customer.schema.js";
import { addresses } from "../address/address.schema";
import { users } from "@module/user/user.schema.js";

import NotFoundException from "@error/not-found-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import InternalServerError from "@/src/shared/error/internal-server";

class CustomerService {
  getCustomerProfile = async (customerId: number, userId: number) => {
    const [customerProfile] = await db.select().from(customers)
    .innerJoin(users, eq(customers.user_id, users.id))
    .innerJoin(addresses, 
      eq(customers.address_id, addresses.id))
      .where(
      and(
        eq(customers.id, customerId),
        eq(users.id, userId)
      )
    ).limit(1);

    if (!customerProfile) {
      throw new NotFoundException(
        "Customer not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
      );
    }

    return customerProfile;
  };

  updateCustomerProfile = 
    async (
      customerId: number,
      userId: number,
      body: {
        profileImageUrl?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
      },
    ) => {
      const { profileImageUrl, firstName, lastName, email, phoneNumber } = body;

      let updateData: {[k: string]: string} = {};

      firstName && (updateData.first_name =  firstName);
      lastName && (updateData.last_name = lastName);
      email && (updateData.email = email);
      phoneNumber && (updateData.phone_number = phoneNumber);
      profileImageUrl && (updateData.profile_image = profileImageUrl);

      try {
        const [customerProfile, userProfile] = await db.transaction(async (tx) => {
            const user = await tx.update(users).set({
              first_name: updateData.firstName,
              last_name: updateData.lastName,
              email: updateData.email,
              phone_number: updateData.phoneNumber
            }).where(eq(users.id, userId)).returning()

          const customer = await tx.update(customers).set({
            profile_image: updateData.profileImageUrl
          }).where(eq(customers.id, customerId)).returning()

          return [
            user[0], 
            customer[0]
          ];
        });

        if(!customerProfile || !userProfile) {
          throw new NotFoundException(
            "Customer profile not found",
            HttpStatus.NOT_FOUND,
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }
        return [customerProfile, userProfile]
      } catch (error) {
        throw error;
      }
    }

  deleteCustomerProfile =
    async (customerId: number, userId: number) => {
      try {

        const [deletedCustomerProfile] = await db.delete(customers)
        .where(
          and(
          eq(customers.id, customerId), 
          eq(customers.user_id, userId)
        )
      ).returning();

        if(!deletedCustomerProfile) {
          throw new InternalServerError(
            "Unable to delete customer profile", 
            HttpStatus.INTERNAL_SERVER_ERROR, 
            ErrorCode.INTERNAL_SERVER_ERROR
          );
        }
      } catch (error) {
        throw error;
      }
    }
  
}

export default new CustomerService();
