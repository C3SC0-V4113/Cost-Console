import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';

export async function AccessDeniedPanel() {
  const t = await getTranslations('pricing.access');

  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="grid gap-2">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
          {t('title')}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{t('body')}</p>
      </div>

      <div className="flex">
        <Button asChild variant="outline">
          <Link href="/">{t('back')}</Link>
        </Button>
      </div>
    </section>
  );
}
