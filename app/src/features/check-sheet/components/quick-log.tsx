import { requireUserId } from "@/lib/session";
import { getTriggerOptions } from "../queries";
import { QuickLogDialog } from "./quick-log-dialog";

/** Server wrapper: loads the user's blockers, hands them to the interactive dialog. */
export async function QuickLog() {
  const triggers = await getTriggerOptions(await requireUserId());
  return <QuickLogDialog triggers={triggers} />;
}
