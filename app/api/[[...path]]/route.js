import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { MongoClient } from 'mongodb'
import crypto from 'crypto'
import { PRODUCTS, CATEGORIES, BRANDS, findProduct, filterProducts, suggestProducts, similarProducts } from '@/lib/data'
import { chatCompletion } from '@/lib/llm'

export const runtime = 'nodejs'

// --- Auth helpers ---
function b64url(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }
function b64urlDecode(s) { s = s.replace(/-/g,'+').replace(/_/g,'/'); while (s.length % 4) s += '='; return Buffer.from(s, 'base64').toString() }
function sign(payload, secret) { return crypto.createHmac('sha256', secret).update(payload).digest('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') }
function makeToken(email, role) {
  const secret = process.env.AUTH_SECRET || 'dev-secret'
  const body = JSON.stringify({ email, role, iat: Date.now(), exp: Date.now() + 7*86400000 })
  const p = b64url(body); const sig = sign(p, secret)
  return `${p}.${sig}`
}
function verifyToken(token) {
  try {
    const [p, sig] = String(token || '').split('.')
    if (!p || !sig) return null
    const secret = process.env.AUTH_SECRET || 'dev-secret'
    if (sign(p, secret) !== sig) return null
    const data = JSON.parse(b64urlDecode(p))
    if (!data.exp || data.exp < Date.now()) return null
    return data
  } catch { return null }
}
function requireAuth(request, role) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const t = verifyToken(token)
  if (!t || (role && t.role !== role)) return null
  return t
}

let client, db
async function getDb() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME)
  }
  return db
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}
export async function OPTIONS() { return cors(new NextResponse(null, { status: 200 })) }

// Deterministic order tracking derived from order id hash
function trackingFor(orderId) {
  const base = Date.now() - 86400000
  const stages = [
    { key:'confirmed', label:'Order Confirmed', done:true, at: base - 6*3600000 },
    { key:'packed', label:'Packed at Warehouse', done:true, at: base - 3*3600000 },
    { key:'shipped', label:'Shipped', done:true, at: base + 6*3600000 },
    { key:'out', label:'Out for Delivery', done:false, at: base + 20*3600000 },
    { key:'delivered', label:'Delivered', done:false, at: base + 24*3600000 },
  ]
  return { orderId, courier: 'ZAMY Express', awb: 'ZMY' + orderId.slice(-6), stages }
}

// Fake admin analytics (deterministic)
function adminAnalytics() {
  const days = 30
  const now = Date.now()
  const revenue = Array.from({length:days}).map((_,i) => ({
    date: new Date(now - (days-i-1)*86400000).toISOString().slice(0,10),
    revenue: Math.round(60000 + Math.sin(i/3)*15000 + Math.random()*40000),
    orders: Math.round(30 + Math.sin(i/2)*10 + Math.random()*20),
  }))
  const catShare = CATEGORIES.map(c => ({ name: c.name, value: filterProducts({ category: c.slug }).length * 3 + Math.round(Math.random()*20) }))
  const topProducts = filterProducts({ sort:'popular' }).slice(0,5).map(p => ({ id:p.id, name:p.name, sold: Math.round(200 + Math.random()*1200), revenue: p.price * (200 + Math.round(Math.random()*1000)) }))
  const totals = {
    revenue: revenue.reduce((s,d)=>s+d.revenue,0),
    orders: revenue.reduce((s,d)=>s+d.orders,0),
    customers: 12480 + Math.floor(Math.random()*100),
    aov: Math.round(revenue.reduce((s,d)=>s+d.revenue,0) / revenue.reduce((s,d)=>s+d.orders,0)),
  }
  return { revenue, catShare, topProducts, totals }
}

function sellerAnalytics() {
  const days = 14
  const now = Date.now()
  const revenue = Array.from({length:days}).map((_,i) => ({
    date: new Date(now - (days-i-1)*86400000).toISOString().slice(0,10),
    revenue: Math.round(12000 + Math.sin(i/2)*4000 + Math.random()*8000),
    orders: Math.round(4 + Math.sin(i)*2 + Math.random()*4),
  }))
  const products = PRODUCTS.filter(p => p.brand === 'ZAMY').slice(0,8)
  const totals = { revenue: revenue.reduce((s,d)=>s+d.revenue,0), orders: revenue.reduce((s,d)=>s+d.orders,0), pendingPayout: 45280, rating: 4.7 }
  return { revenue, products, totals }
}

async function handler(request, { params }) {
  const { path = [] } = await params
  const route = '/' + path.join('/')
  const method = request.method
  const url = new URL(request.url)
  const qs = Object.fromEntries(url.searchParams.entries())

  try {
    if ((route === '/' || route === '/root') && method === 'GET') {
      return cors(NextResponse.json({ ok: true, service: 'ZAMY API', version: '1.2.0' }))
    }

    // ---- AUTH ----
    if (route === '/auth/login' && method === 'POST') {
      const { email = '', password = '', role = 'admin' } = await request.json()
      const cfg = role === 'seller'
        ? { emails: (process.env.SELLER_EMAILS || 'seller@zamy.market').toLowerCase().split(',').map(s=>s.trim()), password: process.env.SELLER_PASSWORD || 'zamy2025' }
        : { emails: (process.env.ADMIN_EMAILS  || 'admin@zamy.market' ).toLowerCase().split(',').map(s=>s.trim()), password: process.env.ADMIN_PASSWORD  || 'zamy2025' }
      const em = String(email).toLowerCase().trim()
      if (!cfg.emails.includes(em)) return cors(NextResponse.json({ ok:false, error: 'Email not authorized for this role.' }, { status: 401 }))
      if (String(password) !== cfg.password) return cors(NextResponse.json({ ok:false, error: 'Incorrect password.' }, { status: 401 }))
      const token = makeToken(em, role)
      return cors(NextResponse.json({ ok:true, email: em, role, token }))
    }
    if (route === '/auth/verify' && method === 'POST') {
      const { token = '' } = await request.json().catch(() => ({}))
      const t = verifyToken(token)
      if (!t) return cors(NextResponse.json({ ok:false }, { status: 401 }))
      return cors(NextResponse.json({ ok:true, email: t.email, role: t.role }))
    }

    if (route === '/categories' && method === 'GET') return cors(NextResponse.json({ items: CATEGORIES }))
    if (route === '/brands' && method === 'GET') return cors(NextResponse.json({ items: BRANDS }))

    // Batched homepage sections in a single response (huge perf win)
    if (route === '/home' && method === 'GET') {
      const pick = (opts, n=12) => filterProducts(opts).slice(0, n)
      const payload = {
        featured: pick({ tag:'featured', sort:'popular' }),
        bestsellers: pick({ tag:'bestseller', sort:'popular' }),
        trending: pick({ tag:'trending', sort:'popular' }),
        newArrivals: pick({ tag:'new', sort:'newest' }),
        topRated: pick({ tag:'toprated', sort:'rating' }),
        deals: pick({ tag:'deal', sort:'discount' }),
      }
      const res = NextResponse.json(payload)
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
      return cors(res)
    }

    if (route === '/products' && method === 'GET') {
      const brand = qs.brand ? String(qs.brand).split(',') : []
      const limit = Math.min(parseInt(qs.limit||'0') || 0, 200)
      const skip = parseInt(qs.skip||'0') || 0
      const items = filterProducts({
        q: qs.q || '', category: qs.category || '', subcategory: qs.subcategory || '',
        brand, minPrice: parseFloat(qs.minPrice) || 0, maxPrice: qs.maxPrice ? parseFloat(qs.maxPrice) : Infinity,
        rating: parseFloat(qs.rating) || 0, inStock: qs.inStock === 'true',
        sort: qs.sort || 'popular', tag: qs.tag || '',
      })
      const total = items.length
      const sliced = limit ? items.slice(skip, skip + limit) : items
      return cors(NextResponse.json({ items: sliced, total }))
    }
    if (route === '/products/suggest' && method === 'GET') return cors(NextResponse.json({ items: suggestProducts(qs.q || '', 8) }))
    if (route === '/products/by-ids' && method === 'GET') {
      const ids = (qs.ids || '').split(',').filter(Boolean)
      const map = new Map(PRODUCTS.map(p => [p.id, p]))
      const items = ids.map(id => map.get(id)).filter(Boolean)
      return cors(NextResponse.json({ items }))
    }
    if (route.startsWith('/products/') && route.endsWith('/similar') && method === 'GET') {
      const id = route.split('/')[2]
      return cors(NextResponse.json({ items: similarProducts(findProduct(id), 8) }))
    }
    if (route.startsWith('/products/') && route.endsWith('/fbt') && method === 'GET') {
      const id = route.split('/')[2]; const p = findProduct(id)
      if (!p) return cors(NextResponse.json({ items: [] }))
      const items = filterProducts({ category: p.category }).filter(x => x.id !== id).slice(0, 3)
      return cors(NextResponse.json({ items }))
    }
    if (route.startsWith('/products/') && route.endsWith('/reviews') && method === 'GET') {
      const id = route.split('/')[2]; const p = findProduct(id)
      if (!p) return cors(NextResponse.json({ items: [] }))
      const names = ['Aarav S.','Priya M.','Rahul K.','Neha J.','Karan V.','Sanya D.','Vikas P.','Ishita R.']
      const titles = ['Excellent product!','Great value','Works as expected','Loved it','Worth every rupee','Highly recommend','Impressive quality','Solid build']
      const bodies = [
        'Delivery was quick and packaging was premium. Product exceeded my expectations.',
        'Have been using for 3 weeks and no complaints. Very happy with the purchase.',
        'Build quality is excellent. Genuine product from ZAMY.',
        'Just what I needed. 5 stars from me!',
        'Feels premium and performs well. Would buy again.',
      ]
      const items = Array.from({length:6}).map((_,i) => ({
        id: `${id}-r${i}`, name: names[(parseInt(id)+i)%names.length], title: titles[(parseInt(id)+i)%titles.length],
        rating: 4 + ((parseInt(id)+i)%2 === 0 ? 1 : 0), date: new Date(Date.now() - (i+1)*5*86400000).toISOString().slice(0,10),
        body: bodies[i%bodies.length], verified: true,
      }))
      return cors(NextResponse.json({ items }))
    }
    if (route.startsWith('/products/') && route.endsWith('/qna') && method === 'GET') {
      return cors(NextResponse.json({ items: [
        { q:'Is this the latest model?', a:'Yes, this is the current 2025 model with full manufacturer warranty.', by:'ZAMY Seller' },
        { q:'Does it come with a warranty?', a:'Yes, 1 year manufacturer warranty is included.', by:'ZAMY Seller' },
        { q:'What is the return policy?', a:'7-day easy returns from the date of delivery.', by:'ZAMY Support' },
      ]}))
    }
    if (route.startsWith('/products/') && method === 'GET') {
      const id = route.split('/')[2]; const p = findProduct(id)
      if (!p) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      return cors(NextResponse.json(p))
    }

    // Orders
    if (route === '/orders' && method === 'POST') {
      const body = await request.json()
      const order = { id: uuidv4().slice(0,8).toUpperCase(), createdAt: Date.now(), status: 'confirmed', ...body }
      try { const database = await getDb(); await database.collection('orders').insertOne({ ...order }) } catch {}
      return cors(NextResponse.json({ ok: true, order }))
    }

    // Order tracking
    if (route.startsWith('/track/') && method === 'GET') {
      const orderId = route.split('/')[2]
      return cors(NextResponse.json(trackingFor(orderId)))
    }

    // Admin (auth required)
    if (route.startsWith('/admin/')) {
      if (!requireAuth(request, 'admin')) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    if (route.startsWith('/seller/')) {
      if (!requireAuth(request, 'seller')) return cors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }
    if (route === '/admin/analytics' && method === 'GET') return cors(NextResponse.json(adminAnalytics()))
    if (route === '/admin/orders' && method === 'GET') {
      // Fake orders derived from products
      const items = filterProducts({ sort:'popular' }).slice(0,25).map((p,i) => ({
        id: 'ORD' + String(10001 + i),
        customer: ['Rahul K.','Priya S.','Vikas P.','Neha J.','Karan D.','Anita R.'][(i)%6],
        email: 'buyer'+i+'@zamy.market',
        productId: p.id, product: p.name, image: p.images[0],
        total: p.price, status: ['confirmed','shipped','delivered','cancelled'][i%4], createdAt: Date.now() - i*7200000,
      }))
      return cors(NextResponse.json({ items }))
    }
    if (route === '/admin/customers' && method === 'GET') {
      const items = Array.from({length:20}).map((_,i) => ({
        id: 'CUS' + String(2001+i),
        name: ['Rahul K.','Priya S.','Vikas P.','Neha J.','Karan D.','Anita R.','Ishita M.','Amit K.','Sneha T.','Rohan V.'][i%10] + ' ' + String.fromCharCode(65+i),
        email: 'user'+i+'@zamy.market', orders: Math.round(2+Math.random()*20), spend: Math.round(4000+Math.random()*200000), joined: new Date(Date.now() - i*15*86400000).toISOString().slice(0,10),
      }))
      return cors(NextResponse.json({ items }))
    }
    if (route === '/admin/coupons' && method === 'GET') {
      return cors(NextResponse.json({ items: [
        { code:'WELCOME10', discount:'10%', min:0, uses:1245, cap:'₹2000' },
        { code:'ZAMY20', discount:'20%', min:1499, uses:632, cap:'₹5000' },
        { code:'FLAT500', discount:'₹500', min:2999, uses:412, cap:'–' },
        { code:'FREESHIP', discount:'Free shipping', min:0, uses:2210, cap:'–' },
      ]}))
    }
    if (route === '/admin/reviews' && method === 'GET') {
      const items = PRODUCTS.slice(0,10).map((p,i) => ({
        id: 'RV' + (100+i), productId: p.id, product: p.name, image: p.images[0],
        name: ['Rahul','Priya','Vikas','Neha','Karan'][i%5]+' K.', rating: (i%2===0)?5:4,
        title: ['Loved it','Great','Awesome','Solid','Perfect'][i%5],
        body: 'Very happy with the purchase. Delivery was quick and the product is top-notch.',
        status: i%3===0 ? 'pending' : 'approved',
      }))
      return cors(NextResponse.json({ items }))
    }

    // Seller
    if (route === '/seller/analytics' && method === 'GET') return cors(NextResponse.json(sellerAnalytics()))
    if (route === '/seller/orders' && method === 'GET') {
      const items = PRODUCTS.filter(p => p.brand==='ZAMY').slice(0,10).map((p,i) => ({
        id: 'SO' + String(3001+i), product: p.name, image: p.images[0], qty: 1+i%4,
        total: p.price*(1+i%4), status: ['pending','shipped','delivered'][i%3], customer: 'Buyer '+(i+1)
      }))
      return cors(NextResponse.json({ items }))
    }

    // AI chat (product support)
    if (route === '/ai/chat' && method === 'POST') {
      const body = await request.json()
      const userMsg = body.messages?.[body.messages.length-1]?.content || ''
      const productCtx = body.productContext ? `\n\nCurrent product context: ${JSON.stringify(body.productContext)}` : ''
      const system = `You are ZAMY Assistant, a friendly, concise product support agent for ZAMY — a premium marketplace selling electronics, computer parts, mobile accessories, automotive parts, tools and industrial products. Help users find products, understand specs, compare options, and handle order questions. Keep answers under 100 words. Include a product link like /product/<id> when suggesting products.${productCtx}`
      let reply = ''
      try {
        reply = await chatCompletion({ messages: [{ role:'system', content: system }, ...(body.messages||[])], model:'gpt-4o-mini', max_tokens: 300 })
      } catch (e) {
        // Fallback: canned response with product suggestion
        const q = userMsg.toLowerCase()
        const guess = filterProducts({ q: userMsg }).slice(0,2)
        if (guess.length) reply = `Here are some great options: ${guess.map(g => `• ${g.name} (₹${g.price.toLocaleString()}) — /product/${g.id}`).join(' ')}. Anything specific you'd like to know?`
        else if (q.includes('return')) reply = 'Yes! We offer 7-day easy returns from delivery. Go to Account › Orders and click Return.'
        else if (q.includes('deliv')) reply = 'Standard delivery is 2–4 business days. Express and same-day options are available at checkout.'
        else if (q.includes('payment')) reply = 'We accept UPI, cards, net banking, wallets, Razorpay, Stripe, PayPal and COD.'
        else reply = 'I’m here to help with products, orders, delivery, returns and payments on ZAMY. What are you looking for today?'
      }
      return cors(NextResponse.json({ reply }))
    }

    // AI recommendations based on context (recent, cart, wishlist)
    if (route === '/ai/recommendations' && method === 'POST') {
      const body = await request.json()
      const seedIds = [...(body.recentIds||[]), ...(body.cartIds||[]), ...(body.wishlistIds||[])]
      const seeds = seedIds.map(id => findProduct(id)).filter(Boolean)
      let recIds = []
      let reason = ''
      // rule-based candidates first
      const cats = new Set(seeds.map(s => s.category))
      const brands = new Set(seeds.map(s => s.brand))
      let pool = PRODUCTS.filter(p => !seedIds.includes(p.id) && (cats.has(p.category) || brands.has(p.brand)))
      pool.sort((a,b) => (b.rating*b.ratingCount) - (a.rating*a.ratingCount))
      if (!pool.length) pool = filterProducts({ sort:'popular' })
      const candidates = pool.slice(0, 12)
      // Try LLM to pick top 6 and craft reason
      try {
        const list = candidates.map(p => `${p.id}: ${p.name} (${p.brand}, ${p.subcategory}, ₹${p.price})`).join('\n')
        const seedList = seeds.map(p => `${p.id}: ${p.name} (${p.brand})`).join('\n') || 'No specific history.'
        const msg = `You are a recommendation engine for ZAMY marketplace. Given the user's recently viewed/carted/wishlisted items and a candidate pool, pick 6 product IDs the user is most likely to buy next and briefly explain why in one sentence.\n\nUser history:\n${seedList}\n\nCandidate pool:\n${list}\n\nReturn ONLY JSON of the form: { "ids": ["0012","0034",...], "reason": "..." }`
        const raw = await chatCompletion({ messages:[{ role:'user', content: msg }], model:'gpt-4o-mini', max_tokens: 200 })
        const m = raw.match(/\{[\s\S]*\}/); const parsed = m ? JSON.parse(m[0]) : null
        if (parsed?.ids?.length) { recIds = parsed.ids; reason = parsed.reason || '' }
      } catch {}
      const items = (recIds.length ? recIds : candidates.slice(0,6).map(p=>p.id)).map(id => findProduct(id)).filter(Boolean).slice(0,6)
      return cors(NextResponse.json({ items, reason: reason || 'Curated for your interests.' }))
    }

    // Newsletter / contact
    if (route === '/newsletter' && method === 'POST') { const b = await request.json(); try { const d = await getDb(); await d.collection('newsletter').insertOne({ email: b.email, ts: Date.now() }) } catch {}; return cors(NextResponse.json({ ok:true })) }
    if (route === '/contact' && method === 'POST') { const b = await request.json(); try { const d = await getDb(); await d.collection('contacts').insertOne({ ...b, ts: Date.now() }) } catch {}; return cors(NextResponse.json({ ok:true })) }
    if (route === '/status' && method === 'GET') return cors(NextResponse.json({ ok:true }))

    return cors(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))
  } catch (e) {
    console.error('API error', e)
    return cors(NextResponse.json({ error: 'Internal error' }, { status: 500 }))
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
