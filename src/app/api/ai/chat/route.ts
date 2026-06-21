import { NextResponse } from 'next/server';

// Hugging Face Inference API — free tier, no credit card required
// Get your token at: https://huggingface.co/settings/tokens
const HF_API_URL = 'https://api-inference.huggingface.co/models/';

// Recommended chat models (pick one — Mistral is a good all-rounder):
//   mistralai/Mistral-7B-Instruct-v0.3
//   microsoft/Phi-3-mini-4k-instruct
//   google/gemma-2-2b-it
//   meta-llama/Llama-3.2-3B-Instruct
const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';

const SYSTEM_PROMPT = `You are an AI business assistant inside the "AI Agentic Dashboard". 
You help with: content creation (newsletters, social posts, blogs, ad copy), lead analysis, 
client insights, task prioritization, event planning, weekly summaries, and business strategy.

Keep responses concise, actionable, and well-structured in Markdown. Use bullet points, 
tables, and headers when helpful. Be proactive with recommendations.

Context: This dashboard manages ~12 clients, ~12 leads, 15 tasks, events, and content items.`;

// --- Fallback responses when no HF token is set ---
const FALLBACK_RESPONSES: Record<string, string> = {
  newsletter: `# 🚀 This Week in AI-Powered Growth

**The AI Agent Revolution Is Here**

## Top Stories
### 1. AI Agents Handle 40% of Customer Interactions
Personalization at scale is now the standard.

### 2. Content Teams Adopt AI Co-pilots
Teams using AI report 3x content output without quality loss.

### 3. Agentic Workflows Rising
Companies report 65% faster deal closures with agentic AI.

## Pro Tip
*"Use AI to draft, but always add your human touch."*

— The AI Dashboard Team`,
  summarize: `# 📊 Your Week in Review

- **Revenue**: $32,450 (+12%)
- **New Clients**: 3 | **New Leads**: 8
- **Tasks**: 15/23 done (65%) | **Content**: 4 pieces published

## 🎯 Wins
1. Meridian Health upsell — $67,500
2. LinkedIn post: 2,300+ impressions
3. Q3 Webinars planned

## ⚠️ Needs Attention
- Quantum Labs still on hold
- 3 overdue reminders
- Competitor report deadline approaching`,
  content: `# 💡 Content Ideas

1. **"How We Automated 70% of Outreach"** — LinkedIn Article
2. **Meridian Health Case Study** — Blog + Newsletter
3. **"5 AI Tools for 2026"** — Blog + Instagram
4. **Agentic AI Report** — Gated PDF lead magnet
5. **Weekly Series: "AI in Practice"** — LinkedIn

📊 LinkedIn posts with data get 2.4x more engagement.
🎯 Best posting: Tue/Thu 10 AM`,
  leads: `# 🔍 Lead Pipeline Analysis

| Stage | Count | Value | Avg Score |
|-------|-------|-------|-----------|
| New | 4 | $108K | 65 |
| Contacted | 3 | $92K | 72 |
| Qualified | 3 | $118.5K | 82 |
| Converted | 1 | $38K | 90 |

## 🚨 High-Value Leads
1. **Isabella Costa** ($55K, score 88) — needs outreach
2. **Felix Bauer** ($42K) — 12 days no activity
3. **Leo Chang** ($38K, score 85)

💡 LinkedIn leads convert at 25% vs 12% for website.`,
};

function getFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('newsletter')) return FALLBACK_RESPONSES.newsletter;
  if (p.includes('summar') || p.includes('week')) return FALLBACK_RESPONSES.summarize;
  if (p.includes('content') || p.includes('idea')) return FALLBACK_RESPONSES.content;
  if (p.includes('lead') || p.includes('analy')) return FALLBACK_RESPONSES.leads;

  return `# 🤖 AI Assistant

I can help with:

- **Generate newsletter draft** — Ready-to-send newsletter
- **Summarize my week** — Weekly activity summary
- **Suggest content ideas** — Tailored recommendations
- **Analyze leads** — Pipeline insights

Or ask me about: client insights, task prioritization, content strategy, event planning, performance analytics.

> 💡 Tip: Set \`HF_API_KEY\` in \`.env.local\` to unlock full AI capabilities with Hugging Face models.`;
}

async function callHuggingFace(prompt: string, token: string): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  const response = await fetch(`${HF_API_URL}${HF_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: `<|system|>\n${SYSTEM_PROMPT}</s>\n<|user|>\n${prompt}</s>\n<|assistant|>\n`,
      parameters: {
        max_new_tokens: 800,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
      },
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    // Model might be loading (503) — retry-friendly error
    if (response.status === 503) {
      throw new Error('MODEL_LOADING');
    }
    throw new Error(`HF API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();

  // HF returns different shapes depending on the model
  if (Array.isArray(data)) {
    return data[0]?.generated_text || data[0]?.summary_text || JSON.stringify(data);
  }
  return data.generated_text || data.summary_text || data[0]?.generated_text || JSON.stringify(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt || '';
    const token = process.env.HF_API_KEY || body.apiKey || '';

    // If we have a Hugging Face token, use real AI
    if (token && token.length > 20) {
      try {
        const result = await callHuggingFace(prompt, token);
        return NextResponse.json({ response: result, provider: 'huggingface' });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Model loading — tell the client to retry
        if (msg === 'MODEL_LOADING') {
          return NextResponse.json(
            {
              response: '⏳ The AI model is warming up (cold start). Please try again in 10-15 seconds.',
              provider: 'huggingface',
              retry: true,
            },
            { status: 202 }
          );
        }
        console.error('HF API error:', msg);
        // Fall through to fallback
      }
    }

    // Fallback: use predefined responses
    await new Promise((resolve) => setTimeout(resolve, 600));
    const responseText = getFallbackResponse(prompt);
    return NextResponse.json({ response: responseText, provider: 'fallback' });
  } catch {
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
