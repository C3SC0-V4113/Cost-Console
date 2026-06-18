'use client';

import { Calculator, Database, MessageSquareText, WalletCards, Workflow } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import type { LucideIcon } from 'lucide-react';

// Playgrounds with an href are live; the rest are disabled placeholders that
// convey the product shape without linking to routes that do not exist yet.
const playgrounds: ReadonlyArray<{ key: string; icon: LucideIcon; href?: string }> = [
  { key: 'chatCost', icon: MessageSquareText, href: '/chat' },
  { key: 'ragCostLab', icon: Workflow },
  { key: 'textToSqlCostLab', icon: Database },
];

export function ConsoleSidebar({ isAdmin }: Readonly<{ isAdmin: boolean }>) {
  const t = useTranslations('shell');
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip={t('brand')}>
              <Link href="/chat">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Calculator className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{t('brand')}</span>
                  <span className="truncate text-xs text-muted-foreground">{t('tagline')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('groupPlaygrounds')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playgrounds.map((item) => {
                const Icon = item.icon;
                const label = t(item.key);

                if (item.href) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={label}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton disabled tooltip={t('comingSoon', { name: label })}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>{t('groupPricing')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/pricing-snapshots')}
                    tooltip={t('pricingSnapshots')}
                  >
                    <Link href="/pricing-snapshots">
                      <WalletCards />
                      <span>{t('pricingSnapshots')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
