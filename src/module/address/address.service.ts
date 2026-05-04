/** @format */

import db from "@config/db.config.js";

import {addresses} from "@module/address/address.schema.js";
import {customers} from "@module/customer/customer.schema.js";
import {vendors} from "@module/vendor/vendor.schema.js";
import { users } from "@module/user/user.schema.js";

import NotFoundException from "@error/not-found-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";
import BadRequestException from "@error/bad-request-exception.js";
import { and, desc, eq, sql } from "drizzle-orm";


const label: Record<string, string> = {
  home: "home",
  work: "work",
  other: "other"
} as const;

type labelType = string;

class AddressService {
  createUserAddress =
    async (
      userId: number,
      body: {
        city: string,
        state: string,
        country: string,
        postalCode: string,
        latitude: number,
        longitude: number,
        label?: labelType,
        address?: string,
        isDefault?: boolean,
      }
    ) => {
      const {city, state, country, postalCode, latitude, longitude, label, address, isDefault} = body;

      if (isDefault) {
        await db.update(addresses)
        .set({ is_default: false })
        .where(eq(addresses.user_id, userId));
      } 

      const [newAddress] = await db.insert(addresses).values({
        user_id: userId,
        address,
        label,
        city,
        state,
        country,
        postal_code: postalCode,
        latitude,
        longitude,
        is_default: isDefault
      }).onConflictDoNothing()
        .returning();

      if (!newAddress) {
        throw new NotFoundException(
          "Address not found",
          HttpStatus.NOT_FOUND,
          ErrorCode.RESOURCE_NOT_FOUND,
        );
      }

      await db.transaction(async (tx) => {
        await tx.update(customers).set({
          address_id: newAddress.id
        }).where(
          and(
            eq(customers.address_id, newAddress.id),
            eq(customers.user_id, userId)
          )
        );

        await tx.update(vendors).set({
          address_id: newAddress.id
        }).where(
          and(
            eq(vendors.address_id, newAddress.id),
            eq(vendors.user_id, userId)
          )
        );
      })

      return newAddress;
  }

  editUserAddress = 
    async (
      userId: number,
      addressId: number,
      body: {
        city: string;
        state: string;
        country: string;
        postalCode: string;
        latitude: number;
        longitude: number;
        label?: "home" | "work" | "other";
        address?: string;
        isDefault?: boolean;
      },
    ) => {
      await db.transaction(async (tx) => {
        const userAddress = await tx.select().from(addresses).where(
          and(
            eq(addresses.id, addressId), 
            eq(addresses.user_id, userId)
          )
        );
  
        if (!userAddress) {
          throw new NotFoundException(
            "Address not found",
            HttpStatus.NOT_FOUND,
            ErrorCode.RESOURCE_NOT_FOUND,
          );
        }
  
        if (typeof body.isDefault === "boolean" && body.isDefault) {
          await tx.update(addresses)
          .set({ is_default: false })
          .where(
            and(
              eq(addresses.user_id, userId),
              eq(addresses.id, addressId)
            )
          );
        }
  
        const updateData: {[k: string]: any} = {};
        body.city !== undefined && (updateData.city = body.city),
        body.state !== undefined && (updateData.state = body.state ),
        body.country !== undefined && (updateData.country = body.country),
        body.postalCode !== undefined && (
          updateData.postalCode = body.postalCode
        ),
        body.latitude !== undefined && (updateData.latitude = body.latitude),
        body.longitude !== undefined && (updateData.longitude = body.longitude),
        body.label !== undefined &&  (updateData.label = body.label),
        body.address !== undefined && (updateData.address = body.address ),
        body.isDefault !== undefined && (updateData.isDefault = body.isDefault);
  
        const [updatedAddress] = await tx.update(addresses).set({
          address: updateData.address,
          label: updateData.label,
          city: updateData.city,
          state: updateData.state,
          country: updateData.country,
          postal_code: updateData.postal_code,
          latitude: updateData.latitude,
          longitude: updateData.longitude,
          is_default: updateData.is_default
        }).where(
          and(
            eq(addresses.id, addressId), 
            eq(addresses.user_id, userId)
          )
        )
        .returning();
  
        return updatedAddress;
      })
  };

  toggleDefaultAddress =
    async (userId: number, addressId: number) => {
      return await db.transaction(async (tx) => {
        const [userAddress] = await tx.select()
          .from(addresses)
          .where(and(eq(addresses.id, addressId), eq(addresses.user_id, userId)))
          .limit(1);
    
        if (!userAddress) {
          throw new NotFoundException(
            "Address not found", 
            HttpStatus.NOT_FOUND, 
            ErrorCode.RESOURCE_NOT_FOUND
          );
        }
    
        const nextIsDefault = !userAddress.is_default;
    
        nextIsDefault &&
          (
            await tx.update(addresses)
            .set({ is_default: false })
            .where(eq(addresses.user_id, userId))
          );

    
        const [updatedAddress] = await tx.update(addresses)
          .set({ is_default: nextIsDefault })
          .where(and(eq(addresses.id, addressId), eq(addresses.user_id, userId)))
          .returning();
    
        return updatedAddress;
      });
  }

  deleteUserAddress = async (userId: number, addressId: number) => {
    return await db.select().from(addresses).where(
      and(
        eq(addresses.id, addressId),
        eq(addresses.user_id, userId)
      )
    ).limit(1);    
  }

  getUserAddresses = async (userId: number) => {
    const user_address = await db.select().from(addresses).where(eq(addresses.id, userId)).orderBy(desc(addresses.created_at));
    
    return {
      defaultAddress: user_address.filter(a => a.is_default === true)[0],
      secondaryAddresses: user_address.filter(a => a.is_default !== true)
    }
  }
}

export default new AddressService();
