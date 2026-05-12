import jwt from "jsonwebtoken";
import { env } from "@repo/env/admin"

import { cookies } from "next/headers";
export async function isLoggedIn() {
  const userCookies = await cookies();

  // ASSIGNMENT 2
  // check only that "auth_token" cookie exists
  //return userCookies.has("auth_token");

  // ASSIGNMENT 3
  // check that auth_token cookie exists and is valid
  const token = userCookies.get("auth_token")?.value;

  if (!token) return false;

  try {
    jwt.verify(token, env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
