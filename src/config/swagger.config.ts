/** @format */

import swaggerJSDoc from "swagger-jsdoc";
import { hostName, port, nodeEnv } from "../constants/constants.js";

const protocol = hostName.includes("localhost") ? "http" : "https";
const baseUrl =
  hostName.startsWith("http://") || hostName.startsWith("https://")
    ? hostName
    : `${protocol}://${hostName}`;

const url = nodeEnv === "production" ? baseUrl : `${baseUrl}:${port}`;

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "The Other Wife API",
    version: "1.0.0",
    description: "Backend API documentation",
  },
  servers: [
    {
      url,
      description: nodeEnv === "production" ? "Production" : "Local",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          error: { type: "string" },
          status: { type: "string", example: "error" },
        },
      },
      UserType: {
        type: "string",
        enum: ["customer", "vendor", "admin"],
      },
      AddressLabel: {
        type: "string",
        enum: ["home", "work", "other"],
      },
      VendorApprovalStatus: {
        type: "string",
        enum: ["pending", "approved", "suspended", "rejected"],
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phoneNumber: { type: "string" },
          userType: { $ref: "#/components/schemas/UserType" },
          isEmailVerified: { type: "boolean" },
          isPhoneVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          lastLogin: { type: "string", format: "date-time" },
        },
      },
      Address: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          label: { $ref: "#/components/schemas/AddressLabel" },
          address: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          postalCode: { type: "string" },
          latitude: { type: "number" },
          longitude: { type: "number" },
          isDefault: { type: "boolean" },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          mealId: { type: "string" },
          price: { type: "number" },
          quantity: { type: "number" },
          totalPrice: { type: "number" },
        },
      },
      Cart: {
        type: "object",
        properties: {
          _id: { type: "string" },
          customerId: { type: "string" },
          meals: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          totalAmount: { type: "number" },
        },
      },
      Vendor: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          addressId: { type: "string" },
          businessName: { type: "string" },
          businessDescription: { type: "string" },
          businessLogoUrl: { type: "string" },
          approvalStatus: {
            $ref: "#/components/schemas/VendorApprovalStatus",
          },
          approvedBy: { type: "string" },
          approvedAt: { type: "string", format: "date-time" },
          rejectionReason: { type: "string" },
        },
      },
      Customer: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          addressId: { type: "string" },
          profileImageUrl: { type: "string" },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "Forbidden",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/*.{ts,js}",
    "./src/controllers/*.{ts,js}",
    "./app.{ts,js}",
    "./dist/src/routes/*.{ts,js}",
    "./dist/src/controllers/*.{ts,js}",
    "./dist/app.{ts,js}",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
