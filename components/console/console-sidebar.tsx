'use client';

import { Calculator, Database, MessageSquareText, WalletCards, Workflow } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
const playgrounds: ReadonlyArray<{ title: string; icon: LucideIcon; href?: string }> = [
  { title: 'Chat Cost', icon: MessageSquareText, href: '/chat' },
  { title: 'RAG Cost Lab', icon: Workflow },
  { title: 'Text-to-SQL Cost Lab', icon: Database },
];

export function ConsoleSidebar({ isAdmin }: Readonly<{ isAdmin: boolean }>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="Cost Console">
              <Link href="/chat">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Calculator className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Cost Console</span>
                  <span className="truncate text-xs text-muted-foreground">AI cost playground</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Playgrounds</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {playgrounds.map((item) => {
                const Icon = item.icon;

                if (item.href) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton disabled tooltip={`${item.title} — coming soon`}>
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Pricing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/pricing-snapshots')}
                    tooltip="Pricing snapshots"
                  >
                    <Link href="/pricing-snapshots">
                      <WalletCards />
                      <span>Pricing snapshots</span>
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
