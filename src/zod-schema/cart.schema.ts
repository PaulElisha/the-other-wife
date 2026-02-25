/** @format */

import z from "zod";

export const addToCartSchema = z.object({
  quantity: z.number().min(1),
  action: z.enum(["increment", "decrement"]).optional(),
});