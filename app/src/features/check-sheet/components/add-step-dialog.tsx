"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { addFlowStep } from "../actions";
import { STEP_KINDS, STEP_KIND_ORDER } from "../domain/step-kinds";
import { ROUTINE_LABELS } from "../starter-templates";
import type { FlowRoutineType, FlowStepKind } from "../types";

export function AddStepDialog({
  routine,
  open,
  onClose,
}: {
  routine: FlowRoutineType;
  open: boolean;
  onClose: () => void;
}) {
  const { run, isPending } = useAction();
  const [kind, setKind] = useState<FlowStepKind>("PROCESS");

  return (
    <Modal open={open} onClose={onClose} eyebrow={ROUTINE_LABELS[routine].title} title="Add a step">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => addFlowStep({ routine, name: data.get("name"), durationMin: data.get("durationMin"), kind }), {
            successMessage: "Step added to the end of your routine.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="What's the step?">
          <TextInput name="name" required maxLength={80} autoFocus placeholder="e.g. Stretch for 5 minutes" />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Field label="Minutes">
              <TextInput name="durationMin" type="number" required min={1} max={720} defaultValue={10} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="What kind of step?" hint={STEP_KINDS[kind].description}>
              <Select value={kind} onChange={(event) => setKind(event.target.value as FlowStepKind)}>
                {STEP_KIND_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {STEP_KINDS[value].label} ({STEP_KINDS[value].lssTerm})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add step
          </Button>
        </div>
      </form>
    </Modal>
  );
}
