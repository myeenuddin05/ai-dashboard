'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import {
  mainNavItems,
  workNavItems,
  crmNavItems,
  insightNavItems,
  settingsNavItems,
  type NavItem,
} from '@/lib/constants';
import { ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function NavSection({ items, label, collapsed }: { items: NavItem[]; label: string; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <div className="px-2">
      {!collapsed && (
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const link = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400'
                  : 'text-muted-foreground hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger >{link}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }
          return link;
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, setPomodoroOpen, pomodoroOpen } = useStore();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-[70px]'
        )}
      >
        {/* Logo */}
        <div className={cn('flex h-14 items-center border-b px-3', sidebarOpen ? 'px-4' : 'justify-center')}>
          <Bot className="h-6 w-6 text-teal-600 shrink-0" />
          {sidebarOpen && <span className="ml-2 font-semibold text-lg">AgentOS</span>}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 space-y-5">
          <NavSection items={mainNavItems} label="Main" collapsed={!sidebarOpen} />
          <NavSection items={workNavItems} label="Work" collapsed={!sidebarOpen} />
          <NavSection items={crmNavItems} label="CRM" collapsed={!sidebarOpen} />
          <NavSection items={insightNavItems} label="Insights" collapsed={!sidebarOpen} />
        </div>

        {/* Bottom */}
        <div className="border-t p-2 space-y-1">
          <NavSection items={settingsNavItems} label="" collapsed={!sidebarOpen} />
          <button
            onClick={() => setPomodoroOpen(!pomodoroOpen)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-stone-100 hover:text-foreground dark:hover:bg-stone-800 transition-colors"
          >
            <span className="text-lg shrink-0">🍅</span>
            {sidebarOpen && <span>Focus Timer</span>}
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground hover:text-foreground shadow-sm"
        >
          {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 md:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  );
}
