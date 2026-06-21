'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, User, Send, Sparkles, Loader2, Newspaper, BarChart3, Lightbulb, Target, Settings, ExternalLink, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestions = [
  { label: 'Generate newsletter draft', icon: Newspaper, prompt: 'Generate a newsletter draft about AI trends in business' },
  { label: 'Summarize my week', icon: BarChart3, prompt: 'Summarize my week - include revenue, new clients, content published, and tasks completed' },
  { label: 'Suggest content ideas', icon: Lightbulb, prompt: 'Suggest 5 content ideas for my LinkedIn and blog, based on AI and automation topics' },
  { label: 'Analyze leads', icon: Target, prompt: 'Analyze my lead pipeline and tell me which leads I should prioritize' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI agent. I can help you generate content, analyze your pipeline, summarize your week, and more.\n\n**Powered by:** Hugging Face models (or offline fallback).\n\n⚙️ Click the settings icon to add your Hugging Face API key for full AI capabilities.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [hfKey, setHfKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved key from localStorage
    const saved = localStorage.getItem('hf_api_key');
    if (saved) {
      setHfKey(saved);
      setKeySaved(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveKey = () => {
    if (hfKey.trim().length < 20) {
      toast.error('Please enter a valid Hugging Face API token');
      return;
    }
    localStorage.setItem('hf_api_key', hfKey.trim());
    setKeySaved(true);
    toast.success('API key saved! AI will now use Hugging Face models.');
  };

  const clearKey = () => {
    localStorage.removeItem('hf_api_key');
    setHfKey('');
    setKeySaved(false);
    toast.info('API key removed. Using offline fallback.');
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: prompt, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          apiKey: hfKey || undefined,
        }),
      });
      const data = await res.json();

      if (data.retry) {
        // Model is loading — show message and auto-retry after 12s
        const retryMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, retryMsg]);
        setProvider(data.provider || null);

        // Auto-retry
        setTimeout(async () => {
          setIsLoading(true);
          try {
            const retryRes = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt, apiKey: hfKey || undefined }),
            });
            const retryData = await retryRes.json();
            const aiMsg: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: retryData.response,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setProvider(retryData.provider || null);
          } catch {
            toast.error('Retry failed');
          } finally {
            setIsLoading(false);
          }
        }, 12000);
      } else {
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setProvider(data.provider || null);
      }
    } catch {
      toast.error('Failed to generate response');
    } finally {
      if (!isLoading) return; // handled by retry
      setIsLoading(false);
    }
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return `<h1 class="text-lg font-bold mt-3 mb-1">${line.slice(2)}</h1>`;
        if (line.startsWith('## ')) return `<h2 class="text-base font-semibold mt-2 mb-1">${line.slice(3)}</h2>`;
        if (line.startsWith('### ')) return `<h3 class="text-sm font-semibold mt-2 mb-1">${line.slice(4)}</h3>`;
        if (line.startsWith('---')) return '<hr class="my-2 border-border" />';
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
          if (line.includes('---')) return '';
          const isHeader = i > 0 && line.includes('---');
          const tag = isHeader ? 'th' : 'td';
          return `<tr>${cells.map(c => `<${tag} class="border px-2 py-1 text-sm">${c}</${tag}>`).join('')}</tr>`;
        }
        if (line.startsWith('- **')) {
          const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
          if (match) return `<p class="text-sm ml-3">• <span class="font-semibold">${match[1]}</span>${match[2]}</p>`;
        }
        if (line.startsWith('- ')) return `<p class="text-sm ml-3">• ${line.slice(2)}</p>`;
        if (line.match(/^\d+\.\s/)) return `<p class="text-sm ml-3">${line}</p>`;
        if (line.startsWith('> ')) return `<blockquote class="border-l-2 border-teal-400 pl-3 my-1 italic text-muted-foreground text-sm">${line.slice(2)}</blockquote>`;
        if (line.trim() === '') return '<br />';
        return `<p class="text-sm">${line}</p>`;
      })
      .join('');
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-[calc(100vh-7rem)] flex-col"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Agent Chat</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {provider && provider !== 'fallback' ? (
                <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected — {provider.toUpperCase()}
                </span>
              ) : (
                'Offline fallback — set AI_PROVIDER in .env'
              )}
            </p>
          </div>

          {/* API Key Settings Dialog */}
          <Dialog>
            <DialogTrigger>
              <Button variant="outline" size="sm" className="gap-2" type="button">
                <Settings className="h-4 w-4" />
                {keySaved ? 'HF Key Set' : 'Set API Key'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>AI Provider Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium mb-1">Configure via <code className="bg-muted px-1 rounded text-xs">.env</code> or Vercel env vars:</p>
                  <pre className="text-xs mt-2 bg-background rounded p-2 overflow-x-auto">
{`AI_PROVIDER=huggingface  # or: openai, gemini, ollama, openrouter

# Hugging Face (free)
HF_API_KEY=hf_...
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.3

# OpenAI
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini

# Gemini (free tier)
# GEMINI_API_KEY=AIza...
# GEMINI_MODEL=gemini-2.0-flash

# Ollama (local)
# OLLAMA_HOST=http://localhost:11434
# OLLAMA_MODEL=llama3.2

# OpenRouter (free models)
# OPENROUTER_API_KEY=sk-or-...`}
                  </pre>
                </div>

                <div className="border-t pt-3">
                  <p className="font-medium mb-1">Or paste a Hugging Face key for runtime use:</p>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="password"
                      value={hfKey}
                      onChange={(e) => setHfKey(e.target.value)}
                      placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button onClick={saveKey} size="sm" className="bg-teal-600 hover:bg-teal-700">
                      Save Key
                    </Button>
                    {keySaved && (
                      <Button onClick={clearKey} variant="outline" size="sm">
                        Remove Key
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground border-t pt-2">
                  <span className="font-medium">Provider links:</span>{' '}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">HuggingFace</a>
                  {' · '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">OpenAI</a>
                  {' · '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Gemini</a>
                  {' · '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">OpenRouter</a>
                  {' · '}
                  <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Ollama</a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-xl border bg-card p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : '')}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                    <Bot className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-muted'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose-sm dark:prose-invert max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_table]:text-xs [&_table]:border-collapse [&_td]:border-muted-foreground/20 [&_th]:border-muted-foreground/20 [&_th]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                    <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
                <Bot className="h-4 w-4 text-teal-700" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.prompt)}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-teal-50 hover:border-teal-300 dark:hover:bg-teal-950 transition-colors"
              >
                <s.icon className="h-3.5 w-3.5 text-teal-600" />
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask me anything..."
            rows={2}
            className="min-h-[48px] resize-none"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 shrink-0 bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
