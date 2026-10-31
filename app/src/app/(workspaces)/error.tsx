"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WorkspaceError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Card className="max-w-md mx-auto text-center space-y-3">
      <h1 className="font-serif text-2xl text-espresso">Something slipped</h1>
      <p className="text-sm text-slateWarm">We couldn&apos;t load this page. Your data is safe. Give it another try.</p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
