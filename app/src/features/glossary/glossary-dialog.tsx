"use client";

import { useState } from "react";
import { BookOpenTextIcon } from "@phosphor-icons/react/dist/ssr/BookOpenText";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GLOSSARY, type GlossaryEntry } from "./terms";

const GROUPS: Array<{ id: GlossaryEntry["group"]; title: string; intro: string }> = [
  { id: "measure", title: "How we measure you", intro: "The scores and ideas behind your numbers." },
  { id: "tools", title: "The tools", intro: "Each one comes from factory quality control, adapted for your life." },
];

/** The "Plain-English guide" button and the dialog it opens. */
export function GlossaryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="shadow-sm">
        <BookOpenTextIcon size={16} className="text-terracotta" />
        <span className="hidden sm:inline">Plain-English guide</span>
        <span className="sm:hidden">Guide</span>
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        wide
        eyebrow="No jargon required"
        title="Quality tools, in plain English"
      >
        <p className="text-xs text-slateWarm mb-4 leading-relaxed">
          Kaizen Studio borrows the toolkit factories use to remove defects, and points it at your habits. You don&apos;t
          need to know any of it. Here&apos;s what the words mean.
        </p>
        <div className="space-y-5">
          {GROUPS.map((group) => (
            <section key={group.id}>
              <h3 className="font-semibold text-sm text-espresso">{group.title}</h3>
              <p className="text-[11px] text-slateWarm mb-2">{group.intro}</p>
              <dl className="space-y-2">
                {Object.values(GLOSSARY)
                  .filter((entry) => entry.group === group.id)
                  .map((entry) => (
                    <div key={entry.term} className="p-3.5 rounded-xl bg-paper border border-stoneDark">
                      <dt className="text-sm font-semibold text-espresso">{entry.term}</dt>
                      <dd className="text-xs text-espresso/90 mt-0.5">{entry.plain}</dd>
                      <dd className="text-xs text-slateWarm mt-1 leading-relaxed">{entry.detail}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <Button variant="dark" size="sm" onClick={() => setOpen(false)}>
            Got it, back to the studio
          </Button>
        </div>
      </Modal>
    </>
  );
}
