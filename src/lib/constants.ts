import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  CheckSquare,
  Bell,
  Users,
  Target,
  Calendar,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// Color palette - Warm neutrals with emerald/teal accent
export const colors = {
  primary: {
    light: '#0d9488', // teal-600
    DEFAULT: '#0f766e', // teal-700
    dark: '#115e59', // teal-800
  },
  accent: {
    light: '#059669', // emerald-600
    DEFAULT: '#047857', // emerald-700
    dark: '#065f46', // emerald-800
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
};

// Status configurations
export const statusConfig: Record<string, { label: string; color: string; className: string }> = {
  active: { label: 'Active', color: '#059669', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactive: { label: 'Inactive', color: '#78716c', className: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400' },
  lead: { label: 'Lead', color: '#d97706', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  todo: { label: 'To Do', color: '#78716c', className: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400' },
  in_progress: { label: 'In Progress', color: '#d97706', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  review: { label: 'Review', color: '#7c3aed', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  done: { label: 'Done', color: '#059669', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  draft: { label: 'Draft', color: '#78716c', className: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400' },
  scheduled: { label: 'Scheduled', color: '#2563eb', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  published: { label: 'Published', color: '#059669', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  new: { label: 'New', color: '#d97706', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  contacted: { label: 'Contacted', color: '#2563eb', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  qualified: { label: 'Qualified', color: '#7c3aed', className: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  converted: { label: 'Converted', color: '#059669', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  lost: { label: 'Lost', color: '#dc2626', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  completed: { label: 'Completed', color: '#059669', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: '#dc2626', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  urgent: { label: 'Urgent', color: '#dc2626', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  high: { label: 'High', color: '#ea580c', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  medium: { label: 'Medium', color: '#d97706', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: 'Low', color: '#65a30d', className: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400' },
};

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'AI Chat', href: '/chat', icon: MessageSquare },
  { title: 'Content Hub', href: '/content', icon: FileText },
];

export const workNavItems: NavItem[] = [
  { title: 'Tasks', href: '/tasks', icon: CheckSquare },
  { title: 'Reminders', href: '/reminders', icon: Bell },
];

export const crmNavItems: NavItem[] = [
  { title: 'Clients', href: '/clients', icon: Users },
  { title: 'Leads', href: '/leads', icon: Target },
  { title: 'Events', href: '/events', icon: Calendar },
];

export const insightNavItems: NavItem[] = [
  { title: 'Reports', href: '/reports', icon: BarChart3 },
];

export const settingsNavItems: NavItem[] = [
  { title: 'Settings', href: '/settings', icon: Settings },
];

// Charts color palette
export const chartColors = {
  emerald: '#059669',
  teal: '#0d9488',
  amber: '#d97706',
  violet: '#7c3aed',
  red: '#dc2626',
  stone: '#78716c',
  blue: '#2563eb',
  orange: '#ea580c',
  lime: '#65a30d',
  sky: '#0284c7',
};

// Content type config
export const contentTypes = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'blog', label: 'Blog' },
  { value: 'ad_copy', label: 'Ad Copy' },
  { value: 'event_content', label: 'Event Content' },
];

export const platforms = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
  { value: 'blog', label: 'Blog' },
];

export const leadSources = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'conference', label: 'Conference' },
  { value: 'email', label: 'Email' },
];

export const eventTypes = [
  { value: 'meeting', label: 'Meeting' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'conference', label: 'Conference' },
  { value: 'campaign', label: 'Campaign' },
];

export const taskCategories = [
  { value: 'content', label: 'Content' },
  { value: 'sales', label: 'Sales' },
  { value: 'event', label: 'Event' },
  { value: 'general', label: 'General' },
];

export const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
