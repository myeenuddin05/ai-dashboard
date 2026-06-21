'use client';

import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const { widgets, toggleWidget, reorderWidgets, theme, setTheme } = useStore();
  const [invoiceTab, setInvoiceTab] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    clientName: string;
    clientEmail: string;
    items: Array<{ description: string; quantity: number; rate: number }>;
  }>({
    clientName: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = sortedWidgets.findIndex((w) => w.id === id);
    if (direction === 'up' && idx > 0) {
      [sortedWidgets[idx], sortedWidgets[idx - 1]] = [sortedWidgets[idx - 1], sortedWidgets[idx]];
    } else if (direction === 'down' && idx < sortedWidgets.length - 1) {
      [sortedWidgets[idx], sortedWidgets[idx + 1]] = [sortedWidgets[idx + 1], sortedWidgets[idx]];
    }
    reorderWidgets(sortedWidgets.map((w, i) => ({ ...w, order: i })));
  };

  const addInvoiceItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, rate: 0 }],
    });
  };

  const updateInvoiceItem = (idx: number, field: string, value: string | number) => {
    const items = [...invoiceData.items];
    items[idx] = { ...items[idx], [field]: value };
    setInvoiceData({ ...invoiceData, items });
  };

  const removeInvoiceItem = (idx: number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== idx),
    });
  };

  const generateInvoice = () => {
    const total = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const now = new Date();
    const preview = `
INVOICE
====================================
Date: ${now.toLocaleDateString()}
Invoice #: INV-${Date.now().toString(36).toUpperCase()}

Bill To:
${invoiceData.clientName}
${invoiceData.clientEmail}
------------------------------------
Items:
${invoiceData.items.map((item, i) =>
  `${i + 1}. ${item.description || 'Service'}
   Qty: ${item.quantity} x ${formatCurrency(item.rate)} = ${formatCurrency(item.quantity * item.rate)}`
).join('\n')}
------------------------------------
TOTAL: ${formatCurrency(total)}
====================================
Thank you for your business!
    `.trim();
    setInvoicePreview(preview);
    toast.success('Invoice generated!');
  };

  const copyInvoice = () => {
    if (invoicePreview) {
      navigator.clipboard.writeText(invoicePreview);
      toast.success('Invoice copied to clipboard');
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize your dashboard</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Widgets */}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Dashboard Widgets</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{widget.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveWidget(widget.id, 'up')}>↑</Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveWidget(widget.id, 'down')}>↓</Button>
                      <Switch checked={widget.visible} onCheckedChange={() => toggleWidget(widget.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Appearance</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts */}
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Keyboard Shortcuts</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Command Palette</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toggle Sidebar</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">⌘B</kbd>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoice Generator */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Invoice Generator</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setInvoiceTab(!invoiceTab)}>
              {invoiceTab ? 'Hide' : 'Show'}
            </Button>
          </CardHeader>
          {invoiceTab && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input value={invoiceData.clientName} onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })} />
                </div>
                <div>
                  <Label>Client Email</Label>
                  <Input value={invoiceData.clientEmail} onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })} />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                {invoiceData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Label>Description</Label>
                      <Input value={item.description} onChange={(e) => updateInvoiceItem(idx, 'description', e.target.value)} />
                    </div>
                    <div className="w-20">
                      <Label>Qty</Label>
                      <Input type="number" min="1" value={item.quantity} onChange={(e) => updateInvoiceItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="w-28">
                      <Label>Rate ($)</Label>
                      <Input type="number" min="0" value={item.rate} onChange={(e) => updateInvoiceItem(idx, 'rate', parseFloat(e.target.value) || 0)} />
                    </div>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => removeInvoiceItem(idx)}>×</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addInvoiceItem}>+ Add Item</Button>
              </div>
              <div className="flex gap-2">
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={generateInvoice}>Generate Invoice</Button>
                {invoicePreview && (
                  <Button variant="outline" onClick={copyInvoice}>Copy to Clipboard</Button>
                )}
              </div>
              {invoicePreview && (
                <div className="rounded-lg border bg-muted p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">{invoicePreview}</pre>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AppLayout>
  );
}
