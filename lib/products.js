// Products store: MongoDB-backed with in-memory cache and seed from lib/data.js.
// Provides async CRUD + filtering.
import { MongoClient } from 'mongodb'
import { PRODUCTS as SEED, CATEGORIES, BRANDS } from '@/lib/data'

let _client = null
let _dbP = null
async function db() {
  if (_dbP) return _dbP
  _dbP = (async () => {
    _client = new MongoClient(process.env.MONGO_URL)
    await _client.connect()
    const database = _client.db(process.env.DB_NAME)
    // Seed if empty
    const col = database.collection('products')
    const count = await col.countDocuments({})
    if (count === 0 && SEED.length) {
      await col.insertMany(SEED.map(p => ({ ...p })))
    }
    // Ensure indexes for search
    await col.createIndex({ id: 1 }, { unique: true }).catch(()=>{})
    await col.createIndex({ name: 'text', brand: 'text', subcategory: 'text' }).catch(()=>{})
    return database
  })()
  return _dbP
}

// Strip Mongo _id before returning to clients
function sanitize(p) {
  if (!p) return p
  const { _id, ...rest } = p
  return rest
}

export async function listAllProducts() {
  const d = await db()
  const arr = await d.collection('products').find({}).toArray()
  return arr.map(sanitize)
}

export async function findProductAsync(id) {
  const d = await db()
  const p = await d.collection('products').findOne({ id })
  return sanitize(p)
}

export async function suggestProductsAsync(q, limit=8) {
  if (!q) return []
  const list = await filterProductsAsync({ q })
  return list.slice(0, limit)
}

export async function similarProductsAsync(product, limit=8) {
  if (!product) return []
  const d = await db()
  const arr = await d.collection('products').find({
    id: { $ne: product.id },
    $or: [ { category: product.category }, { brand: product.brand } ],
  }).toArray()
  return arr.map(sanitize)
    .sort((a,b) => (b.rating*b.ratingCount) - (a.rating*a.ratingCount))
    .slice(0, limit)
}

export async function filterProductsAsync({ q='', category='', subcategory='', brand=[], minPrice=0, maxPrice=Infinity, rating=0, inStock=false, sort='popular', tag='' } = {}) {
  const d = await db()
  const filter = {}
  if (category) filter.category = category
  if (subcategory) filter.subcategory = new RegExp('^'+subcategory+'$', 'i')
  if (brand?.length) filter.brand = { $in: brand }
  if (rating) filter.rating = { $gte: rating }
  if (inStock) filter.stock = { $gt: 0 }
  filter.price = { $gte: minPrice, ...(isFinite(maxPrice) ? { $lte: maxPrice } : {}) }
  if (tag) filter.tags = tag
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'i')
    filter.$or = [ { name: rx }, { brand: rx }, { subcategory: rx }, { category: rx } ]
  }
  let arr = await d.collection('products').find(filter).toArray()
  arr = arr.map(sanitize)
  switch (sort) {
    case 'price_asc': arr.sort((a,b) => a.price - b.price); break
    case 'price_desc': arr.sort((a,b) => b.price - a.price); break
    case 'rating': arr.sort((a,b) => b.rating - a.rating); break
    case 'newest': arr.sort((a,b) => (b.createdAt||0) - (a.createdAt||0)); break
    case 'discount': arr.sort((a,b) => (b.discount||0) - (a.discount||0)); break
    default: arr.sort((a,b) => (b.ratingCount||0) - (a.ratingCount||0))
  }
  return arr
}

export async function createProduct(input) {
  const d = await db()
  const col = d.collection('products')
  // next id
  const all = await col.find({}).project({ id: 1 }).toArray()
  const maxN = all.map(x => parseInt(x.id||'0')).filter(n => !isNaN(n)).reduce((a,b)=>Math.max(a,b), 0)
  const id = String(maxN + 1).padStart(4, '0')
  const mrp = input.mrp || Math.round((input.price||0) * 1.25)
  const discount = mrp > 0 ? Math.round(((mrp - input.price) / mrp) * 100) : 0
  const doc = {
    id,
    sku: 'ZMY-' + id,
    name: input.name || 'Untitled Product',
    brand: input.brand || 'ZAMY',
    category: input.category || 'electronics',
    subcategory: input.subcategory || 'Smartphones',
    price: Number(input.price) || 0,
    mrp,
    discount,
    stock: Number(input.stock) || 0,
    rating: Number(input.rating) || 4.5,
    ratingCount: Number(input.ratingCount) || 0,
    images: Array.isArray(input.images) && input.images.length ? input.images : ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=900'],
    tags: Array.isArray(input.tags) ? input.tags : (input.tags ? String(input.tags).split(',').map(s=>s.trim()).filter(Boolean) : []),
    description: input.description || '',
    specs: input.specs && typeof input.specs === 'object' ? input.specs : {},
    freeShip: (Number(input.price) || 0) > 999,
    createdAt: Date.now(),
  }
  await col.insertOne(doc)
  return sanitize(doc)
}

export async function updateProduct(id, patch) {
  const d = await db()
  const col = d.collection('products')
  const existing = await col.findOne({ id })
  if (!existing) return null
  const next = { ...existing, ...patch }
  if (patch.price !== undefined || patch.mrp !== undefined) {
    const mrp = Number(next.mrp || next.price)
    const price = Number(next.price)
    next.mrp = mrp
    next.price = price
    next.discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0
    next.freeShip = price > 999
  }
  if (patch.images) next.images = Array.isArray(patch.images) ? patch.images : String(patch.images).split(',').map(s=>s.trim()).filter(Boolean)
  if (patch.tags) next.tags = Array.isArray(patch.tags) ? patch.tags : String(patch.tags).split(',').map(s=>s.trim()).filter(Boolean)
  next.updatedAt = Date.now()
  await col.updateOne({ id }, { $set: next })
  return sanitize(next)
}

export async function deleteProduct(id) {
  const d = await db()
  const r = await d.collection('products').deleteOne({ id })
  return r.deletedCount > 0
}

export async function decrementStock(items) {
  // items: [{ id, qty }]
  const d = await db()
  const col = d.collection('products')
  const results = []
  for (const it of items) {
    const r = await col.findOneAndUpdate(
      { id: it.id, stock: { $gte: it.qty || 1 } },
      { $inc: { stock: -(it.qty || 1) } },
      { returnDocument: 'after' }
    )
    results.push(sanitize(r?.value || r))
  }
  return results
}

export { CATEGORIES, BRANDS }
