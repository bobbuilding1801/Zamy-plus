// LLM helper for ZAMY using Emergent Universal LLM Key.
// Uses OpenAI-compatible endpoint at integrations.emergentagent.com/llm.
// Falls back gracefully when the LLM is unreachable.

const ENDPOINT = 'https://integrations.emergentagent.com/llm/v1/chat/completions'

export async function chatCompletion({ messages, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 400 }) {
  const key = process.env.EMERGENT_LLM_KEY
  if (!key) throw new Error('LLM not configured')
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens }),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
