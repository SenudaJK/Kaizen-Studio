"use client";

import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { Term } from "@/features/glossary/term";
import { addNode } from "../actions";

export function AddNodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Arrow diagram" title="Add a milestone">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => addNode({ title: data.get("title"), durationDays: data.get("durationDays"), path: data.get("path") }), {
            successMessage: "Milestone added.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="Milestone" hint="Added after your last one, in the order you'll do them.">
          <TextInput name="title" required maxLength={80} autoFocus placeholder="e.g. Lactate threshold blocks" />
        </Field>
        <Field label="How many days will it take?">
          <TextInput name="durationDays" type="number" required min={1} max={365} step={1} inputMode="numeric" placeholder="14" />
        </Field>
        <Field
          label="Does it hold up the finish?"
          hint={<>If a delay here pushes back the goal, it&apos;s on the <Term k="critical-path">critical path</Term>. Otherwise it has slack.</>}
        >
          <Select name="path" defaultValue="CRITICAL_PATH">
            <option value="CRITICAL_PATH">Yes, critical path</option>
            <option value="PARALLEL_SLACK">No, parallel with slack</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
}
