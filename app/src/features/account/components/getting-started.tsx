import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { CircleIcon } from "@phosphor-icons/react/dist/ssr/Circle";
import { Card, Eyebrow } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { onboardingSteps, type OnboardingInput } from "../domain/account";

/** First-run checklist on Today. Disappears for good once all three basics exist. */
export function GettingStarted(counts: OnboardingInput) {
  const steps = onboardingSteps(counts);
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <Card>
      <Eyebrow>Getting started · {doneCount} of {steps.length}</Eyebrow>
      <h2 className="font-serif text-2xl text-espresso mt-0.5">Set up your first process</h2>
      <p className="text-slateWarm text-sm mt-1 max-w-xl">
        Kaizen Studio starts empty on purpose: everything here is yours. Three quick steps and the charts begin to fill in.
      </p>
      <ul className="mt-4 space-y-2.5">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-3">
            {step.done ? (
              <CheckCircleIcon size={20} weight="fill" className="text-sage shrink-0 mt-0.5" />
            ) : (
              <CircleIcon size={20} className="text-slateWarm shrink-0 mt-0.5" />
            )}
            <div>
              <div className={cn("text-sm font-semibold", step.done ? "text-slateWarm line-through" : "text-espresso")}>{step.title}</div>
              {!step.done && <div className="text-xs text-slateWarm">{step.hint}</div>}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
