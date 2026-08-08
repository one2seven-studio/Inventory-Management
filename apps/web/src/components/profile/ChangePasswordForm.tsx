"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordActionState } from "@/actions/profile/changePassword";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: ChangePasswordActionState = {};

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium text-on-surface-variant">
          Current password
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium text-on-surface-variant">
          New password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-on-surface-variant">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full py-2"
        />
      </div>
      <p className="text-xs text-on-surface-variant">Changing your password signs you out of every device.</p>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" pending={isPending} variant="secondary" className="w-fit py-2">
        {isPending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
