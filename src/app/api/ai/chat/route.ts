import { NextResponse } from 'next/server';

// ============================================================
// Multi-Provider AI Chat Route
// Supports: Hugging Face, Ollama, OpenAI, Gemini, OpenRouter
// Configure via .env or Vercel Environment Variables
// ============================================================

type Provider = 'huggingface' | 'ollama' | 'openai' | 'gemini' | 'openrouter';

interface ProviderConfig {
  name: Provider;
  url: string;
  headers: Record<string, string>;
  buildBody: (prompt: string, model: string) => unknown;
  parseResponse: (data: unknown) => string;
}

const SYSTEM_PROMPT = `You are an AI business assistant inside the "AI Agentic Dashboard". 
You help with: content creation (newsletters, social posts, blogs, ad copy), lead analysis, 
client insights, task prioritization, event planning, weekly summaries, and business strategy.

Keep responses concise, actionable, and well-structured in Markdown.`;

function getMaxTokens(): number {
  return Number(process.env.AI_MAX_TOKENS) || 800;
}

function getTemperature(): number {
  return Number(process.env.AI_TEMPERATURE) || 0.7;
}

function getSystemPrompt(): string {
  return process.env.AI_SYSTEM_PROMPT || SYSTEM_PROMPT;
}

// ---- Provider Configs ----

function getHuggingFaceConfig(model: string): ProviderConfig {
  return {
    name: 'huggingface',
    url: `https://api-inference.huggingface.co/models/${model}`,
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    buildBody: (prompt: string) => ({
      inputs: `<|system|>\n${getSystemPrompt()}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>\n`,
      parameters: {
        max_new_tokens: getMaxTokens(),
        temperature: getTemperature(),
        top_p: 0.95,
        return_full_text: false,
      },
    }),
    parseResponse: (data: unknown) => {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d)) return (d[0] as Record<string, string>)?.generated_text || '';
      return (d.generated_text as string) || (d.summary_text as string) || '';
    },
  };
}

function getOllamaConfig(model: string): ProviderConfig {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
  return {
    name: 'ollama',
    url: `${host}/api/chat`,
    headers: { 'Content-Type': 'application/json' },
    buildBody: (prompt: string) => ({
      model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: {
        num_predict: getMaxTokens(),
        temperature: getTemperature(),
      },
    }),
    parseResponse: (data: unknown) => {
      const d = data as Record<string, { content: string }>;
      return d?.message?.content || '';
    },
  };
}

function getOpenAIConfig(model: string): ProviderConfig {
  return {
    name: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    buildBody: (prompt: string) => ({
      model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      max_tokens: getMaxTokens(),
      temperature: getTemperature(),
    }),
    parseResponse: (data: unknown) => {
      const d = data as { choices: Array<{ message: { content: string } }> };
      return d?.choices?.[0]?.message?.content || '';
    },
  };
}

function getGeminiConfig(model: string): ProviderConfig {
  return {
    name: 'gemini',
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    headers: { 'Content-Type': 'application/json' },
    buildBody: (prompt: string) => ({
      system_instruction: {
        parts: [{ text: getSystemPrompt() }],
      },
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
      ],
      generationConfig: {
        maxOutputTokens: getMaxTokens(),
        temperature: getTemperature(),
      },
    }),
    parseResponse: (data: unknown) => {
      const d = data as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
      return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  };
}

function getOpenRouterConfig(model: string): ProviderConfig {
  return {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
      'X-Title': 'AI Agentic Dashboard',
    },
    buildBody: (prompt: string) => ({
      model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      max_tokens: getMaxTokens(),
      temperature: getTemperature(),
    }),
    parseResponse: (data: unknown) => {
      const d = data as { choices: Array<{ message: { content: string } }> };
      return d?.choices?.[0]?.message?.content || '';
    },
  };
}

// ---- Resolve active provider ----

function resolveProvider(): { config: ProviderConfig | null; model: string; providerName: string } {
  const provider = process.env.AI_PROVIDER || 'huggingface';

  switch (provider) {
    case 'huggingface':
      return {
        config: process.env.HF_API_KEY
          ? getHuggingFaceConfig(process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3')
          : null,
        model: process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3',
        providerName: 'huggingface',
      };

    case 'ollama':
      return {
        config: getOllamaConfig(process.env.OLLAMA_MODEL || 'llama3.2'),
        model: process.env.OLLAMA_MODEL || 'llama3.2',
        providerName: 'ollama',
      };

    case 'openai':
      return {
        config: process.env.OPENAI_API_KEY
          ? getOpenAIConfig(process.env.OPENAI_MODEL || 'gpt-4o-mini')
          : null,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        providerName: 'openai',
      };

    case 'gemini':
      return {
        config: process.env.GEMINI_API_KEY
          ? getGeminiConfig(process.env.GEMINI_MODEL || 'gemini-2.0-flash')
          : null,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        providerName: 'gemini',
      };

    case 'openrouter':
      return {
        config: process.env.OPENROUTER_API_KEY
          ? getOpenRouterConfig(process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free')
          : null,
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
        providerName: 'openrouter',
      };

    default:
      return { config: null, model: 'unknown', providerName: 'unknown' };
  }
}

// ---- Call AI ----

async function callAI(config: ProviderConfig, prompt: string): Promise<string> {
  const body = config.buildBody(prompt, '');

  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    if (response.status === 503) throw new Error('MODEL_LOADING');
    throw new Error(`${config.name} API ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  return config.parseResponse(data);
}

// ---- Fallback ----

const FALLBACK: Record<string, string> = {
  newsletter: `# 🚀 AI Trends Newsletter\n\n## Top Stories\n- AI agents now handle 40% of customer interactions\n- Content teams report 3x output with AI co-pilots\n- Agentic workflows see 65% faster deal closures\n\n## Pro Tip\n*"Use AI to draft, add your human touch."*`,
  summarize: `# 📊 Week in Review\n\n- **Revenue**: $32,450 (+12%)\n- **New Clients**: 3\n- **New Leads**: 8\n- **Tasks**: 15/23 done (65%)\n\n## ⚠️ Needs Attention\n- Quantum Labs still on hold\n- 3 overdue reminders\n- Competitor report deadline`,
  content: `# 💡 Content Ideas\n\n1. "How We Automated 70% of Outreach" — LinkedIn\n2. Case Study — Blog + Newsletter\n3. "5 AI Tools for 2026" — Blog\n4. Industry Report — Lead magnet\n5. Weekly "AI in Practice" — LinkedIn series`,
  leads: `# 🔍 Lead Pipeline\n\n| Stage | Count | Value |\n|-------|-------|-------|\n| New | 4 | $108K |\n| Contacted | 3 | $92K |\n| Qualified | 3 | $118.5K |\n\n## 🚨 Prioritize\n1. Isabella Costa ($55K, score 88)\n2. Felix Bauer ($42K, no activity)\n3. Leo Chang ($38K, score 85)`,
};

function getFallback(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('newsletter')) return FALLBACK.newsletter;
  if (p.includes('summar') || p.includes('week')) return FALLBACK.summarize;
  if (p.includes('content') || p.includes('idea')) return FALLBACK.content;
  if (p.includes('lead') || p.includes('analyz')) return FALLBACK.leads;
  return `# 🤖 AI Assistant\n\nI can help with:\n- **Generate newsletter draft**\n- **Summarize my week**\n- **Suggest content ideas**\n- **Analyze leads**\n\nOr ask me anything about your business.\n\n> 💡 Configure \`AI_PROVIDER\` + API key in \`.env\` to unlock full AI.`;
}

// ---- Route Handler ----

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt || '';

    // Allow runtime key override from chat UI
    const runtimeKey = body.apiKey || '';
    const runtimeProvider = body.provider || '';

    const { config, model, providerName } = resolveProvider();

    // Try configured provider first
    if (config) {
      try {
        const result = await callAI(config, prompt);
        return NextResponse.json({ response: result, provider: providerName, model });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === 'MODEL_LOADING') {
          return NextResponse.json(
            { response: '⏳ Model warming up — please try again in 10 seconds.', provider: providerName, retry: true },
            { status: 202 }
          );
        }
        console.error(`${providerName} error:`, msg);
      }
    }

    // Try runtime HuggingFace key from chat settings
    if (runtimeKey && runtimeKey.length > 20) {
      try {
        const runtimeConfig = getHuggingFaceConfig(process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3');
        // Override headers with runtime key
        runtimeConfig.headers.Authorization = `Bearer ${runtimeKey}`;
        const result = await callAI(runtimeConfig, prompt);
        return NextResponse.json({ response: result, provider: 'huggingface', model: 'runtime' });
      } catch (err: unknown) {
        console.error('Runtime HF error:', err instanceof Error ? err.message : err);
      }
    }

    // Fallback
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({
      response: getFallback(prompt),
      provider: 'fallback',
      hint: `No AI provider configured. Set AI_PROVIDER + API key in .env to enable: huggingface, openai, gemini, ollama, openrouter`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
