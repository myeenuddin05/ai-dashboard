'use client';

import { useStore } from '@/lib/store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { CommandPalette } from '@/components/shared/command-palette';
import { PomodoroTimer } from '@/components/shared/pomodoro';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, commandPaletteOpen, setCommandPaletteOpen, pomodoroOpen, setPomodoroOpen } = useStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarOpen ? 'md:ml-60' : 'md:ml-[70px]'
        )}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
      <PomodoroTimer open={pomodoroOpen} onClose={() => setPomodoroOpen(false)} />
    </div>
  );
}
