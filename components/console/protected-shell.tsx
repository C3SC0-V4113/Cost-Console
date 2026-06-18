import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { AccessDeniedPanel } from '@/components/auth/access-denied-panel';
import { UserMenu } from '@/components/auth/user-menu';
import { ConsoleSidebar } from '@/components/console/console-sidebar';
import { SnapshotInfo } from '@/components/console/snapshot-info';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getCurrentUser, getProjectAccess } from '@/lib/auth';
import { getActiveSnapshot } from '@/lib/data/pricing-repository';

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
  const t = await getTranslations('shell');

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ConsoleSidebar isAdmin={isAdmin} />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <h1 className="min-w-0 flex-1 truncate font-heading text-base font-semibold tracking-tight text-foreground">
              {t('title')}
            </h1>

            <div className="flex shrink-0 items-center gap-3">
              <SnapshotInfo snapshot={snapshot} />

              <div className="hidden flex-col text-right text-xs leading-tight md:flex">
                <span className="font-medium text-foreground">{user.user.email}</span>
                <span className="text-muted-foreground">{t('role', { role: roleLabel })}</span>
              </div>

              <UserMenu email={user.user.email} displayName={user.user.displayName} />
            </div>
          </header>

          <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
            {requireAdmin && !isAdmin ? <AccessDeniedPanel /> : children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
