import { redirect } from 'next/navigation';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { UserMenu } from '@/components/auth/user-menu';
import { ConsoleSidebar } from '@/components/console/console-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCurrentUser, getProjectAccess } from '@/lib/auth';
import { getActiveSnapshot } from '@/lib/data/pricing-repository';
import { formatDate } from '@/lib/format';

export async function ProtectedShell({
  children,
  requireAdmin = false,
}: Readonly<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}>) {
  let user = null;
  let access = null;
  let snapshot = null;

  try {
    [user, access, snapshot] = await Promise.all([
      getCurrentUser(),
      getProjectAccess(),
      getActiveSnapshot().catch(() => null),
    ]);
  } catch {
    user = null;
    access = null;
    snapshot = null;
  }

  if (!user || !access) {
    redirect('/login');
  }

  const isAdmin = access.access.isAdmin;
  const roleLabel = isAdmin ? 'admin' : 'user';

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ConsoleSidebar isAdmin={isAdmin} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold tracking-tight text-foreground">
              Authenticated AI cost playground
            </h1>

            <div className="flex shrink-0 items-center gap-3">
              {snapshot ? (
                <div className="hidden flex-col text-right text-xs leading-tight lg:flex">
                  <span className="font-medium text-foreground">
                    Active snapshot: {snapshot.name}
                  </span>
                  <span className="text-muted-foreground">
                    {snapshot.currency} · {snapshot.freshnessState} · Captured{' '}
                    {formatDate(snapshot.capturedAt)}
                  </span>
                </div>
              ) : (
                <span className="hidden text-xs text-muted-foreground lg:inline">
                  No active pricing snapshot
                </span>
              )}

              <div className="hidden flex-col text-right text-xs leading-tight md:flex">
                <span className="font-medium text-foreground">{user.user.email}</span>
                <span className="text-muted-foreground">Role: {roleLabel}</span>
              </div>

              <UserMenu email={user.user.email} displayName={user.user.displayName} />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-6 p-6">
            {requireAdmin && !isAdmin ? <AccessDeniedPanel /> : children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
