import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function AccessDeniedPanel() {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="grid gap-2">
        <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Restricted surface
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
          Admin access required
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Pricing snapshot management is reserved for project admins. Standard users can continue
          using the playground but cannot open snapshot administration routes.
        </p>
      </div>

      <div className="flex">
        <Button asChild variant="outline">
          <Link href="/">Back to playground</Link>
        </Button>
      </div>
    </section>
  );
}
