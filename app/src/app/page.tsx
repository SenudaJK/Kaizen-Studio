import { redirect } from "next/navigation";

// The Daily Check Sheet is the app's home. Auth is enforced upstream by proxy.ts.
export default function Home() {
  redirect("/today");
}
