"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { useAction } from "@/hooks/use-action";
import { updateProfile } from "../actions";

export function ProfileForm({ name, email }: { name: string | null; email: string }) {
  const { run, isPending } = useAction();

  return (
    <form
      className="space-y-4 max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        run(() => updateProfile({ name: data.get("name") ?? "" }), { successMessage: "Profile saved." });
      }}
    >
      <Field label="Name" hint="Used to greet you on the Today page.">
        <TextInput name="name" defaultValue={name ?? ""} maxLength={80} autoComplete="name" />
      </Field>
      <Field label="Email" hint="Your sign-in address. It can't be changed yet.">
        <TextInput value={email} readOnly disabled />
      </Field>
      <Button type="submit" size="sm" disabled={isPending}>
        Save profile
      </Button>
    </form>
  );
}
