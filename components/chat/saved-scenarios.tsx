import { Lock } from 'lucide-react';

// Scaffold only. Scenario persistence is intentionally deferred until ownership
// and privacy rules exist (ADR 0007); see docs/product/saved-scenarios.md.
export function SavedScenarios() {
  return (
    <section className="grid gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="size-4" />
        <span className="font-medium">Saved scenarios</span>
      </div>
      <p className="max-w-2xl text-muted-foreground">
        Saving scenarios is not available yet. Scenario persistence is reserved until ownership and
        privacy rules are defined.
      </p>
    </section>
  );
}
