"use client";

import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { createMetric } from "../actions";

/** Track any number you can read off once a day: hours slept, minutes of focus, cups of coffee. */
export function AddMetricDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Stability" title="Track a new number">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(
            () =>
              createMetric({
                name: data.get("name"),
                unit: data.get("unit"),
                specDirection: data.get("specDirection"),
                specLimit: data.get("specLimit"),
              }),
            { successMessage: "Metric added. Log a reading to start your chart.", onSuccess: onClose },
          );
        }}
      >
        <Field label="What do you want to measure?">
          <TextInput name="name" required maxLength={40} autoFocus placeholder="e.g. Sleep" />
        </Field>
        <Field label="Unit (optional)">
          <TextInput name="unit" maxLength={12} placeholder="e.g. hrs, mins, cups" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Your target is">
            <Select name="specDirection" defaultValue="MIN">
              <option value="MIN">At least</option>
              <option value="MAX">At most</option>
            </Select>
          </Field>
          <Field label="Target value">
            <TextInput name="specLimit" type="number" step="any" required placeholder="e.g. 7" />
          </Field>
        </div>
        <p className="text-[11px] text-slateWarm">You can move your target later. It never changes the chart&apos;s normal range, which comes from your readings.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add metric
          </Button>
        </div>
      </form>
    </Modal>
  );
}
