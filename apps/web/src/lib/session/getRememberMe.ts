import { cookies } from "next/headers";
import { REMEMBER_ME_COOKIE } from "./cookieNames";

export async function getRememberMe(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(REMEMBER_ME_COOKIE)?.value === "1";
}
