"use client";

import { useActionState } from "react";
import type { User } from "@platform/contracts";
import { updateProfileAction, type UpdateProfileActionState } from "@/actions/profile/updateProfile";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: UpdateProfileActionState = {};

export function UpdateProfileForm({ user }: { user: User }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-on-surface-variant">
          Name
        </label>
        <Input id="name" name="name" defaultValue={user.name} required className="w-full py-2" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-on-surface-variant">
          Email
        </label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required className="w-full py-2" />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">Profile updated.</p> : null}
      <Button type="submit" pending={isPending} className="w-fit py-2">
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
