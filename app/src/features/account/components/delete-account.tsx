"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { deleteAccount } from "../actions";
import { confirmsDeletion } from "../domain/account";

export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const { run, isPending } = useAction();

  const close = () => {
    setOpen(false);
    setTyped("");
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="border-terracotta text-terracotta">
        Delete my account
      </Button>
      <Modal open={open} onClose={close} eyebrow="Danger zone" title="Delete your account?">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            run(() => deleteAccount({ email: typed }));
          }}
        >
          <p className="text-sm text-slateWarm">
            This permanently erases your routines, habits, slips, causes, trends and plans. It can&apos;t be undone.
          </p>
          <Field label={`Type ${email} to confirm`}>
            <TextInput value={typed} onChange={(event) => setTyped(event.target.value)} autoFocus autoComplete="off" />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending || !confirmsDeletion(typed, email)}>
              Delete forever
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
