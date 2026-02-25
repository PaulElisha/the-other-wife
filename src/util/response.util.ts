/** @format */

import { Response } from "express";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  status: "ok" | "error";
  message: string;
  data?: T;
}
