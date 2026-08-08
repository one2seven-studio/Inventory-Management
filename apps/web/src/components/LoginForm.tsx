"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/actions/login";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-on-surface-variant">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="w-full py-2" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-on-surface-variant">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full py-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-on-surface-variant">
        <input type="checkbox" name="rememberMe" className="accent-primary" />
        Remember me
      </label>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" pending={isPending} className="w-full py-2">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
