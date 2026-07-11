import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { MongoClient } from 'mongodb'
import { PRODUCTS, CATEGORIES, BRANDS, findProduct, filterProducts, suggestProducts, similarProducts } from '@/lib/data'

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

async function handler(request, { params }) {
  const { path = [] } = await params
  const route = '/' + path.join('/')
  const method = request.method
  const url = new URL(request.url)
  const qs = Object.fromEntries(url.searchParams.entries())

  try {
    // Root
    if ((route === '/' || route === '/root') && method === 'GET') {
      return cors(NextResponse.json({ ok: true, service: 'ZAMY API', version: '1.0.0' }))
    }

    // Categories
    if (route === '/categories' && method === 'GET') {
      return cors(NextResponse.json({ items: CATEGORIES }))
    }
    // Brands
    if (route === '/brands' && method === 'GET') {
      return cors(NextResponse.json({ items: BRANDS }))
    }

    // Product listing with filters
    if (route === '/products' && method === 'GET') {
      const brand = qs.brand ? String(qs.brand).split(',') : []
      const limit = Math.min(parseInt(qs.limit||'0') || 0, 200)
      const skip = parseInt(qs.skip||'0') || 0
      const items = filterProducts({
        q: qs.q || '',
        category: qs.category || '',
        subcategory: qs.subcategory || '',
        brand,
        minPrice: parseFloat(qs.minPrice) || 0,
        maxPrice: qs.maxPrice ? parseFloat(qs.maxPrice) : Infinity,
        rating: parseFloat(qs.rating) || 0,
        inStock: qs.inStock === 'true',
        sort: qs.sort || 'popular',
        tag: qs.tag || '',
      })
      const total = items.length
      const sliced = limit ? items.slice(skip, skip + limit) : items
      return cors(NextResponse.json({ items: sliced, total }))
    }

    // Autocomplete suggestions
    if (route === '/products/suggest' && method === 'GET') {
      return cors(NextResponse.json({ items: suggestProducts(qs.q || '', 8) }))
    }

    // By ids
    if (route === '/products/by-ids' && method === 'GET') {
      const ids = (qs.ids || '').split(',').filter(Boolean)
      const map = new Map(PRODUCTS.map(p => [p.id, p]))
      const items = ids.map(id => map.get(id)).filter(Boolean)
      return cors(NextResponse.json({ items }))
    }

    // Similar
    if (route.startsWith('/products/') && route.endsWith('/similar') && method === 'GET') {
      const id = route.split('/')[2]
      return cors(NextResponse.json({ items: similarProducts(findProduct(id), 8) }))
    }

    // Frequently bought together (fake based on same category & popular)
    if (route.startsWith('/products/') && route.endsWith('/fbt') && method === 'GET') {
      const id = route.split('/')[2]
      const p = findProduct(id)
      if (!p) return cors(NextResponse.json({ items: [] }))
      const items = filterProducts({ category: p.category }).filter(x => x.id !== id).slice(0, 3)
      return cors(NextResponse.json({ items }))
    }

    // Reviews (deterministic sample by product id)
    if (route.startsWith('/products/') && route.endsWith('/reviews') && method === 'GET') {
      const id = route.split('/')[2]
      const p = findProduct(id)
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
        id: `${id}-r${i}`,
        name: names[(parseInt(id)+i)%names.length],
        title: titles[(parseInt(id)+i)%titles.length],
        rating: 4 + ((parseInt(id)+i)%2 === 0 ? 1 : 0),
        date: new Date(Date.now() - (i+1)*5*86400000).toISOString().slice(0,10),
        body: bodies[i%bodies.length],
        verified: true,
      }))
      return cors(NextResponse.json({ items }))
    }

    // Q&A sample
    if (route.startsWith('/products/') && route.endsWith('/qna') && method === 'GET') {
      const id = route.split('/')[2]
      return cors(NextResponse.json({ items: [
        { q:'Is this the latest model?', a:'Yes, this is the current 2025 model with full manufacturer warranty.', by:'ZAMY Seller' },
        { q:'Does it come with a warranty?', a:'Yes, 1 year manufacturer warranty is included.', by:'ZAMY Seller' },
        { q:'What is the return policy?', a:'7-day easy returns from the date of delivery.', by:'ZAMY Support' },
      ]}))
    }

    // Single product
    if (route.startsWith('/products/') && method === 'GET') {
      const id = route.split('/')[2]
      const p = findProduct(id)
      if (!p) return cors(NextResponse.json({ error: 'Not found' }, { status: 404 }))
      return cors(NextResponse.json(p))
    }

    // Orders (persist to Mongo optionally)
    if (route === '/orders' && method === 'POST') {
      const body = await request.json()
      const order = { id: uuidv4().slice(0,8).toUpperCase(), createdAt: Date.now(), status: 'confirmed', ...body }
      try {
        const database = await getDb()
        await database.collection('orders').insertOne({ ...order })
      } catch {}
      return cors(NextResponse.json({ ok: true, order }))
    }

    // Newsletter subscribe (best-effort)
    if (route === '/newsletter' && method === 'POST') {
      const body = await request.json()
      try { const database = await getDb(); await database.collection('newsletter').insertOne({ email: body.email, ts: Date.now() }) } catch {}
      return cors(NextResponse.json({ ok: true }))
    }

    // Contact
    if (route === '/contact' && method === 'POST') {
      const body = await request.json()
      try { const database = await getDb(); await database.collection('contacts').insertOne({ ...body, ts: Date.now() }) } catch {}
      return cors(NextResponse.json({ ok: true }))
    }

    // Status (legacy)
    if (route === '/status' && method === 'GET') return cors(NextResponse.json({ ok: true }))

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
