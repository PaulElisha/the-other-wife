/** @format */

import { z } from "zod";

const RoleSchema = z.enum(["customer", "vendor", "admin"]);

export default RoleSchema;
