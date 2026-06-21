import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  widgets: Widget[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleWidget: (id: string) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  pomodoroOpen: boolean;
  setPomodoroOpen: (open: boolean) => void;
}

const defaultWidgets: Widget[] = [
  { id: 'kpi-cards', name: 'KPI Cards', visible: true, order: 0 },
  { id: 'quick-actions', name: 'Quick Actions', visible: true, order: 1 },
  { id: 'activity-feed', name: 'Activity Feed', visible: true, order: 2 },
  { id: 'task-progress', name: 'Task Progress', visible: true, order: 3 },
  { id: 'lead-pipeline', name: 'Lead Pipeline', visible: true, order: 4 },
  { id: 'revenue-trend', name: 'Revenue Trend', visible: false, order: 5 },
  { id: 'content-performance', name: 'Content Performance', visible: false, order: 6 },
];

export const useStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      widgets: defaultWidgets,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleWidget: (id) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, visible: !w.visible } : w
          ),
        })),
      reorderWidgets: (widgets) => set({ widgets }),
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      pomodoroOpen: false,
      setPomodoroOpen: (open) => set({ pomodoroOpen: open }),
    }),
    { name: 'ai-dashboard-ui' }
  )
);
