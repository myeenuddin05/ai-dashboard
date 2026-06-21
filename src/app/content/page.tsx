'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusConfig, contentTypes, platforms } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Plus, Sparkles, Search, Pencil, Trash2, FileText, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface Content {
  id: string;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduledAt: string | null;
  body: string;
  createdAt: string;
}

export default function ContentHubPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', typeFilter, platformFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (platformFilter) params.set('platform', platformFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/content?${params}`);
      return res.json() as Promise<Content[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Content>) => {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setIsCreateOpen(false);
      toast.success('Content created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Content>) => {
      const res = await fetch(`/api/content/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      setEditingContent(null);
      toast.success('Content updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/content/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content deleted');
    },
  });

  const filtered = (content || []).filter((c) =>
    !search ? true : c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });

    if (editingContent) {
      updateMutation.mutate({ ...data, id: editingContent.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const ContentForm = ({ defaultValues }: { defaultValues?: Partial<Content> }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>
      <div>
        <Label htmlFor="body">Content</Label>
        <Textarea id="body" name="body" rows={5} defaultValue={defaultValues?.body} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={defaultValues?.type || 'social_media'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {contentTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select name="platform" defaultValue={defaultValues?.platform || 'linkedin'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status || 'draft'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="scheduledAt">Schedule Date</Label>
          <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={defaultValues?.scheduledAt ? new Date(defaultValues.scheduledAt).toISOString().slice(0, 16) : ''} />
        </div>
      </div>
      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        {defaultValues ? 'Update' : 'Create'} Content
      </Button>
    </form>
  );

  const typeColorMap: Record<string, string> = {
    newsletter: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    social_media: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    blog: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
    ad_copy: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    event_content: 'text-teal-600 bg-teal-50 dark:bg-teal-950',
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your content calendar</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              Generate with AI
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger >
                <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4" />
                  New Content
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Content</DialogTitle></DialogHeader>
                <ContentForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "")}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {contentTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v || "")}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Platforms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "")}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Grid */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="social_media">Social Media</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="ad_copy">Ad Copy</TabsTrigger>
            <TabsTrigger value="event_content">Event Content</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ContentGrid
              content={filtered}
              isLoading={isLoading}
              onEdit={setEditingContent}
              onDelete={(id) => deleteMutation.mutate(id)}
              typeColorMap={typeColorMap}
            />
          </TabsContent>
          {['newsletter', 'social_media', 'blog', 'ad_copy', 'event_content'].map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <ContentGrid
                content={filtered.filter((c) => c.type === type)}
                isLoading={isLoading}
                onEdit={setEditingContent}
                onDelete={(id) => deleteMutation.mutate(id)}
                typeColorMap={typeColorMap}
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingContent} onOpenChange={(o) => !o && setEditingContent(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Content</DialogTitle></DialogHeader>
            {editingContent && <ContentForm defaultValues={editingContent} />}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}

function ContentGrid({
  content,
  isLoading,
  onEdit,
  onDelete,
  typeColorMap,
}: {
  content: Content[];
  isLoading: boolean;
  onEdit: (c: Content) => void;
  onDelete: (id: string) => void;
  typeColorMap: Record<string, string>;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText className="h-12 w-12 mb-3" />
        <p className="text-sm">No content found</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    newsletter: 'Newsletter',
    social_media: 'Social',
    blog: 'Blog',
    ad_copy: 'Ad Copy',
    event_content: 'Event',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {content.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.title}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={typeColorMap[c.type] || 'bg-stone-100'} variant="secondary">
                      {typeLabels[c.type] || c.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{c.platform}</Badge>
                    <Badge className={statusConfig[c.status]?.className || ''} variant="secondary">
                      {statusConfig[c.status]?.label || c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {c.scheduledAt ? `Scheduled: ${formatDate(c.scheduledAt)}` : `Created: ${formatDate(c.createdAt)}`}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => onDelete(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
