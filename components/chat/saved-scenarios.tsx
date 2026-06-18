import { Lock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

// Scaffold only. Scenario persistence is intentionally deferred until ownership
// and privacy rules exist (ADR 0007); see docs/product/saved-scenarios.md.
export async function SavedScenarios() {
  const t = await getTranslations('savedScenarios');

  return (
    <section className="grid gap-2 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="size-4" />
        <span className="font-medium">{t('title')}</span>
      </div>
      <p className="max-w-2xl text-muted-foreground">{t('body')}</p>
    </section>
  );
}
