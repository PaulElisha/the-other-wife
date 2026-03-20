/** @format */

import { UserDocument } from "../models/user.model.ts";

export const getFormattedData = (template: string, user?: UserDocument) => {
  const firstName = user ? user?.firstName.charAt(0).toUpperCase() + user?.firstName.slice(1) : "";

  template = template.replace("{{firstName}}", firstName);

  return { template };
};
