import { ShieldCheck, SlidersHorizontal, WalletCards } from 'lucide-react';

import { getActiveSnapshot } from '@/lib/data/pricing-repository';
import { formatDate } from '@/lib/format';

import type { PricingSnapshotDTO } from '@/lib/data/dto';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Authenticated playground shell for Cost Console.',
};

const overviewCards = [
  {
    title: 'Login required',
    description:
      'Every route in Cost Console now depends on a valid session issued for the cost-console project.',
    icon: ShieldCheck,
  },
  {
    title: 'Playground first',
    description:
      'Authenticated users can model chat, RAG, and Text-to-SQL costs without gaining persistence privileges.',
    icon: SlidersHorizontal,
  },
  {
    title: 'Admin-only snapshots',
    description:
      'Pricing snapshot navigation and APIs are reserved for project admins while the persistence backend lands.',
    icon: WalletCards,
  },
];

function HomeContent({ snapshot }: Readonly<{ snapshot: PricingSnapshotDTO | null }>) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-2">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            Project access
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-card-foreground">
            Cost Console now opens behind project-scoped login
          </h2>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            The playground is available only after authenticating through Identity-Service for the
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-sm">cost-console</code>
            project. Regular users can explore calculations; admins also get access to pricing
            snapshot surfaces.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {overviewCards.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="grid gap-2">
              <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              Snapshot traceability
            </p>
            <h3 className="text-xl font-semibold text-card-foreground">
              Visible to every authenticated user
            </h3>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Snapshot</dt>
              <dd className="mt-1 font-medium text-foreground">{snapshot?.name ?? '—'}</dd>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="mt-1 font-medium text-foreground">{snapshot?.status ?? '—'}</dd>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Freshness</dt>
              <dd className="mt-1 font-medium text-foreground">
                {snapshot?.freshnessState ?? '—'}
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <dt className="text-sm text-muted-foreground">Captured</dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDate(snapshot?.capturedAt ?? null)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              Implementation status
            </p>
            <h3 className="text-xl font-semibold text-card-foreground">What is wired today</h3>
          </div>
          <ul className="grid gap-3 text-sm leading-6 text-muted-foreground">
            <li>Protected application shell with login redirect.</li>
            <li>Identity-Service login/logout BFF endpoints with same-origin cookie relay.</li>
            <li>Admin-only pricing snapshot navigation and read APIs.</li>
            <li>Snapshot writes still await the future pricing catalog persistence backend.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default async function HomePage() {
  const snapshot = await getActiveSnapshot().catch(() => null);

  return <HomeContent snapshot={snapshot} />;
}
