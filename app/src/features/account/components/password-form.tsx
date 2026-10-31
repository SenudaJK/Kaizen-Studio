"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { useAction } from "@/hooks/use-action";
import { changePassword } from "../actions";
import { MIN_PASSWORD_LENGTH } from "../domain/account";

export function PasswordForm() {
  const { run, isPending } = useAction();

  return (
    <form
      className="space-y-4 max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        run(() => changePassword({ current: data.get("current") ?? "", next: data.get("next") ?? "" }), {
          successMessage: "Password changed.",
          onSuccess: () => form.reset(),
        });
      }}
    >
      <Field label="Current password">
        <TextInput name="current" type="password" required autoComplete="current-password" />
      </Field>
      <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
        <TextInput name="next" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="sm" variant="dark" disabled={isPending}>
        Change password
      </Button>
    </form>
  );
}
