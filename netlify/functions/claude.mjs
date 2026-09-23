// Proxy between the site and the Claude API.
// The system prompt, model and token limit are fixed HERE, on the server: the browser only sends the conversation.
import { SYSTEM } from './prompt.mjs';

const MAX_TOKENS = 700;
const MAX_MESSAGES = 12;
const MAX_CHARS = 1200;          // per student message
const PER_IP_PER_HOUR = 40;      // best-effort limit per visitor
const hits = new Map();

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const site = process.env.URL || '';
  const origin = req.headers.get('origin') || '';
  const allowed = [site, process.env.ALLOWED_ORIGIN, 'https://emiliennizon.com', 'https://www.emiliennizon.com'].filter(Boolean);
  if (!origin || !allowed.some(o => origin.startsWith(o))) return Response.json({ error: 'Forbidden' }, { status: 403 });

  const ip = (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown';
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  if (list.length >= PER_IP_PER_HOUR) return Response.json({ error: 'Too many questions, try again later.' }, { status: 429 });
  list.push(now); hits.set(ip, list);

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad request' }, { status: 400 }); }
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, m.role === 'assistant' ? 3000 : MAX_CHARS) }))
    .filter(m => m.content);
  if (!messages.length || messages[messages.length - 1].role !== 'user') return Response.json({ error: 'No question' }, { status: 400 });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5', max_tokens: MAX_TOKENS, system: SYSTEM, messages })
  });
  const data = await r.json();
  if (!r.ok) return Response.json({ error: (data.error && data.error.message) || 'API error' }, { status: 502 });
  return Response.json({ text: (data.content || []).map(c => c.text || '').join('') });
};

export const config = { path: '/api/claude' };
