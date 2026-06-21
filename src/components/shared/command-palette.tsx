'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { mainNavItems, workNavItems, crmNavItems, insightNavItems } from '@/lib/constants';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen, open]);

  if (!open) return null;

  const allItems = [...mainNavItems, ...workNavItems, ...crmNavItems, ...insightNavItems];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center border-b px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-muted-foreground shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Type to search pages..."
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                const item = allItems.find(
                  (i) =>
                    i.title.toLowerCase().includes(val) ||
                    i.href.toLowerCase().includes(val)
                );
                if (item && val.length > 1) {
                  router.push(item.href);
                  setOpen(false);
                }
              }}
              autoFocus
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
          <div className="max-h-[300px] overflow-auto p-2">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick Navigation</div>
            {allItems.map((item) => (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setOpen(false); }}
                className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
