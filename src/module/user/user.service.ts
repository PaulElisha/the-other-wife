/** @format */

import db from "@config/db.config.js";
import {users} from "@module/user/user.schema.js";
import { eq } from "drizzle-orm"
import NotFoundException from "@error/not-found-exception.js";
import HttpStatus from "@config/http.config.js";
import ErrorCode from "@enum/error-code.js";

class UserService {
  getCurrentUser = async (userId: number) => {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new NotFoundException(
        "User not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    return user;
  };

  getAllUsers = async () => {
    const allUsers = await db.select().from(users)
    if (!allUsers || allUsers.length <= 0) {
      throw new NotFoundException(
        "Users not found",
        HttpStatus.NOT_FOUND,
        ErrorCode.AUTH_USER_NOT_FOUND,
      );
    }

    return allUsers;
  };
}

export default new UserService();
