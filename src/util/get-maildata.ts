/** @format */

import { UserDocument } from "../models/user.model.js";

export const getFormattedData = (user: UserDocument, template: string) => {
  const firstName =
    user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);

  template = template.replace("{{firstName}}", firstName);

  return { template };
};
