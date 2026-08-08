"use server";

import { redirect } from "next/navigation";
import { ApiError, type LoginResult } from "@platform/contracts";
import { getGatewayClient } from "../lib/api/gatewayClient";
import { setSessionCookies } from "../lib/session/setSessionCookies";

export interface LoginActionState {
  error?: string;
}

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let result: LoginResult;
  try {
    result = await getGatewayClient().post<LoginResult>("/identity/auth/login", { email, password, rememberMe });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Unable to reach the server. Please try again." };
  }

  await setSessionCookies(result.accessToken, result.refreshToken, result.rememberMe);

  // Unambiguous (staff, or an Owner with exactly one restaurant) -> straight
  // to the dashboard. Otherwise the caller needs to pick (2+ restaurants) or
  // create their first one (0) before there's anything to show.
  if (result.user.restaurantId) {
    redirect("/dashboard");
  } else if (result.user.restaurants.length > 1) {
    redirect("/select-restaurant");
  } else {
    redirect("/restaurants/new");
  }
}
