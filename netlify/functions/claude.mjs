// Proxy between the site and the Claude API. The API key stays on the server.
export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const site = process.env.URL || '';
  const origin = req.headers.get('origin') || '';
  if (site && origin && !origin.startsWith(site) && !(process.env.ALLOWED_ORIGIN && origin.startsWith(process.env.ALLOWED_ORIGIN))) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Bad request' }, { status: 400 }); }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 4000) })) : [];
  if (!messages.length) return Response.json({ error: 'No message' }, { status: 400 });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5', max_tokens: Math.min(Number(body.max_tokens) || 700, 1000), system: String(body.system || '').slice(0, 60000), messages })
  });
  const data = await r.json();
  if (!r.ok) return Response.json({ error: (data.error && data.error.message) || 'API error' }, { status: 502 });
  return Response.json({ text: (data.content || []).map(c => c.text || '').join('') });
};

export const config = { path: '/api/claude' };
