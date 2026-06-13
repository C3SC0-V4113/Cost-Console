import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { UserMenu } from '@/components/auth/user-menu';
import { getCurrentUser, getProjectAccess } from '@/lib/auth';
import { activePricingSnapshot } from '@/lib/pricing-snapshot-fixtures';
import { cn } from '@/lib/utils';

export async function ProtectedShell({
  children,
  requireAdmin = false,
}: Readonly<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}>) {
  let user = null;
  let access = null;

  try {
    [user, access] = await Promise.all([getCurrentUser(), getProjectAccess()]);
  } catch {
    user = null;
    access = null;
  }

  if (!user || !access) {
    redirect('/login');
  }

  const isAdmin = access.access.isAdmin;
  const roleLabel = isAdmin ? 'admin' : 'user';

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Cost Console
              </p>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                Authenticated AI cost playground
              </h1>
            </div>
            <nav className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className={cn(
                  'inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'
                )}
              >
                Playground
              </Link>
              {isAdmin ? (
                <Link
                  href="/pricing-snapshots"
                  className={cn(
                    'inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted'
                  )}
                >
                  Pricing snapshots
                </Link>
              ) : null}
            </nav>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <div className="grid gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
              <p className="font-medium text-card-foreground">
                Active snapshot: {activePricingSnapshot.name}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                <span>{activePricingSnapshot.currency}</span>
                <span>{activePricingSnapshot.freshnessState}</span>
                <span>{activePricingSnapshot.capturedAtLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col text-sm">
                <span className="font-medium text-foreground">{user.user.email}</span>
                <span className="text-muted-foreground">Role: {roleLabel}</span>
              </div>
              <UserMenu email={user.user.email} displayName={user.user.displayName} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8">
        {requireAdmin && !isAdmin ? <AccessDeniedPanel /> : children}
      </main>
    </div>
  );
}
