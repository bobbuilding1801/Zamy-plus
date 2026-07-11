// ZAMY product catalog seed. Rich enough to power homepage sections, search, filters.

export const CATEGORIES = [
  { slug: 'electronics', name: 'Electronics', icon: 'Smartphone', subs: ['Smartphones','Laptops','Tablets','Smart Watches','Cameras','Audio Equipment','Gaming'] },
  { slug: 'computer-parts', name: 'Computer Parts', icon: 'Cpu', subs: ['CPUs','Motherboards','RAM','Graphics Cards','SSD','HDD','Power Supplies','Cabinets','Cooling Systems','Networking'] },
  { slug: 'automotive', name: 'Automotive', icon: 'Car', subs: ['Car Parts','Bike Parts','Batteries','Engine Oil','Tyres','Lighting','Accessories','Car Care','Tools'] },
  { slug: 'mobile-accessories', name: 'Mobile Accessories', icon: 'Headphones', subs: ['Chargers','Cables','Cases','Screen Protectors','Power Banks','Earbuds'] },
  { slug: 'electrical', name: 'Electrical', icon: 'Zap', subs: ['Wiring','Switches','Sockets','LED Lighting','Circuit Breakers'] },
  { slug: 'industrial', name: 'Industrial Equipment', icon: 'Factory', subs: ['Machinery','Safety Gear','Measuring','Fasteners','Bearings'] },
  { slug: 'home-electronics', name: 'Home Electronics', icon: 'Home', subs: ['TVs','Kitchen','Vacuums','Air Purifiers'] },
  { slug: 'office', name: 'Office Equipment', icon: 'Briefcase', subs: ['Printers','Monitors','Chairs','Shredders','UPS'] },
]

export const BRANDS = ['ASUS','Intel','AMD','NVIDIA','Samsung','Apple','Sony','LG','Dell','HP','Lenovo','Logitech','Corsair','Bosch','Makita','DeWalt','Michelin','Castrol','Philips','JBL','Xiaomi','OnePlus']

// Image pools by category (all free, hotlinked)
const IMG = {
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900',
  ],
  laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=900',
  ],
  tablets: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900','https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=900'],
  watch: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900'],
  cameras: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900'],
  audio: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900','https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900'],
  gaming: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900','https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=900'],
  cpu: ['https://images.unsplash.com/photo-1555617778-02518510b9fa?w=900','https://images.unsplash.com/photo-1518770660439-4636190af475?w=900'],
  gpu: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=900','https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=900'],
  ram: ['https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=900'],
  ssd: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=900','https://images.unsplash.com/photo-1601999642599-c40b96f6d05e?w=900'],
  mobo: ['https://images.unsplash.com/photo-1555616635-640b71bdb185?w=900','https://images.pexels.com/photos/257886/pexels-photo-257886.jpeg?w=900'],
  psu: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=900'],
  cooling: ['https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=900'],
  network: ['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900'],
  car: ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900','https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900'],
  tools: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=900','https://images.unsplash.com/photo-1599256872237-5dcc0fbe9668?w=900','https://images.pexels.com/photos/51320/drill-milling-milling-machine-drilling-51320.jpeg?w=900'],
  tyre: ['https://images.unsplash.com/photo-1600661653561-629509216228?w=900','https://images.unsplash.com/photo-1601912552080-0fb89fd08042?w=900'],
  battery: ['https://images.unsplash.com/photo-1602883018361-9f5b3a2b1b1c?w=900','https://images.pexels.com/photos/10126655/pexels-photo-10126655.jpeg?w=900'],
  oil: ['https://images.unsplash.com/photo-1613214150384-8f79b5f6d1a8?w=900','https://images.unsplash.com/photo-1610478920392-95888b8e0c7f?w=900'],
  bike: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900'],
  mobileAcc: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900','https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900','https://images.pexels.com/photos/22940565/pexels-photo-22940565.jpeg?w=900'],
  electrical: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900'],
  industrial: ['https://images.unsplash.com/photo-1581093458791-9d15482442f6?w=900','https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=900'],
  home: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=900','https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?w=900'],
  office: ['https://images.unsplash.com/photo-1547082299-de196ea013d6?w=900','https://images.unsplash.com/photo-1618060931014-99f74e0e9c6e?w=900'],
}

let ID = 1
const mk = (o) => {
  const id = String(ID++).padStart(4,'0')
  const mrp = o.mrp || Math.round(o.price * (1 + (0.1 + Math.random()*0.5)))
  const rating = o.rating ?? +(3.8 + Math.random()*1.2).toFixed(1)
  const ratingCount = o.ratingCount ?? Math.floor(50 + Math.random()*2500)
  const stock = o.stock ?? Math.floor(5 + Math.random()*80)
  return {
    id,
    sku: `ZMY-${id}`,
    ...o,
    mrp,
    rating,
    ratingCount,
    stock,
    discount: Math.round(((mrp - o.price)/mrp)*100),
    freeShip: o.price > 999,
    createdAt: Date.now() - Math.floor(Math.random()*90)*86400000,
  }
}

export const PRODUCTS = [
  // Smartphones
  mk({ name:'Apex Pro 5G Smartphone 256GB', brand:'Samsung', category:'electronics', subcategory:'Smartphones', price:59999, images:IMG.smartphones, tags:['bestseller','trending','new'], description:'Flagship 5G phone with AMOLED 120Hz display and pro-grade triple camera.', specs:{ Display:'6.7" AMOLED 120Hz', Chipset:'Snapdragon 8 Gen 3', RAM:'12GB', Storage:'256GB', Battery:'5000 mAh', Camera:'50+12+10 MP' } }),
  mk({ name:'Nova Ultra 512GB Titanium', brand:'Apple', category:'electronics', subcategory:'Smartphones', price:129900, images:IMG.smartphones, tags:['toprated','featured'], description:'Titanium design, A17 Pro chip, USB-C, and pro camera system.', specs:{ Display:'6.7" OLED', Chipset:'A17 Pro', Storage:'512GB', Weight:'221g' } }),
  mk({ name:'Volt 12 Pro 5G 128GB', brand:'OnePlus', category:'electronics', subcategory:'Smartphones', price:44999, images:IMG.smartphones, tags:['deal','trending'], description:'Fast, fluid, and made to game.', specs:{ Display:'6.7" LTPO AMOLED', Chipset:'Snapdragon 8 Gen 2', RAM:'12GB' } }),
  mk({ name:'RedNote 13 Pro+ 256GB', brand:'Xiaomi', category:'electronics', subcategory:'Smartphones', price:27999, images:IMG.smartphones, tags:['bestseller','new'], description:'200MP camera, 120W fast charge.', specs:{ Camera:'200 MP', Battery:'5100 mAh', Charging:'120W' } }),

  // Laptops
  mk({ name:'ZenBlade 14 OLED Laptop i7/16GB/1TB', brand:'ASUS', category:'electronics', subcategory:'Laptops', price:114990, images:IMG.laptops, tags:['featured','toprated'], description:'Ultralight OLED laptop with all-day battery.', specs:{ CPU:'Intel Core i7-1360P', RAM:'16GB LPDDR5', Storage:'1TB NVMe', Display:'14" 2.8K OLED', Weight:'1.2 kg' } }),
  mk({ name:'Legion Fury 16 RTX 4070 Gaming', brand:'Lenovo', category:'electronics', subcategory:'Laptops', price:154999, images:IMG.laptops, tags:['trending','bestseller'], description:'16" 240Hz esports beast.', specs:{ CPU:'Intel i9-14900HX', GPU:'RTX 4070 8GB', RAM:'32GB DDR5', Display:'16" 240Hz WQXGA' } }),
  mk({ name:'MacBook Air M3 13" 8GB/512GB', brand:'Apple', category:'electronics', subcategory:'Laptops', price:134900, images:IMG.laptops, tags:['toprated','new'], description:'Silent, fanless, all-day battery.', specs:{ Chip:'Apple M3', RAM:'8GB', Storage:'512GB', Display:'13.6" Liquid Retina' } }),
  mk({ name:'XPS 15 OLED Creator Laptop', brand:'Dell', category:'electronics', subcategory:'Laptops', price:189990, images:IMG.laptops, tags:['featured'], description:'Creator-grade OLED laptop.', specs:{ CPU:'i9-13900H', GPU:'RTX 4060', RAM:'32GB', Display:'15.6" 3.5K OLED' } }),

  // Tablets
  mk({ name:'Galaxy Tab S9 FE 128GB Wi-Fi', brand:'Samsung', category:'electronics', subcategory:'Tablets', price:37999, images:IMG.tablets, tags:['new'], description:'Premium tablet with S Pen included.', specs:{ Display:'10.9" 90Hz', Storage:'128GB', SPen:'Included' } }),
  mk({ name:'iPad Air 13" M2 256GB', brand:'Apple', category:'electronics', subcategory:'Tablets', price:99900, images:IMG.tablets, tags:['toprated'], description:'iPad Air, now with M2 chip.', specs:{ Chip:'M2', Storage:'256GB', Display:'13" Liquid Retina' } }),

  // Watches
  mk({ name:'ZAMY Pulse Smart Watch 2', brand:'ZAMY', category:'electronics', subcategory:'Smart Watches', price:6999, images:IMG.watch, tags:['deal','trending','new'], description:'AMOLED smartwatch with health tracking.', specs:{ Display:'1.85" AMOLED', Battery:'7 days', Waterproof:'5 ATM' } }),
  mk({ name:'Apex Sport Watch GPS', brand:'Xiaomi', category:'electronics', subcategory:'Smart Watches', price:9999, images:IMG.watch, tags:['bestseller'], description:'Multi-sport GPS watch.', specs:{ GPS:'Multi-band', Sports:'150+' } }),

  // Cameras
  mk({ name:'Sony Alpha A7 IV Mirrorless Body', brand:'Sony', category:'electronics', subcategory:'Cameras', price:224990, images:IMG.cameras, tags:['toprated','featured'], description:'Full-frame hybrid camera.', specs:{ Sensor:'33MP Full Frame', Video:'4K 60p' } }),
  mk({ name:'Canon EOS R50 Kit 18-45mm', brand:'Sony', category:'electronics', subcategory:'Cameras', price:74999, images:IMG.cameras, tags:['deal'], description:'Compact APS-C mirrorless.', specs:{ Sensor:'24MP APS-C' } }),

  // Audio
  mk({ name:'ZAMY Boom XL Bluetooth Speaker', brand:'ZAMY', category:'electronics', subcategory:'Audio Equipment', price:4999, images:IMG.audio, tags:['bestseller','deal','trending'], description:'40W party speaker with LED lights.', specs:{ Power:'40W', Battery:'20 hrs', Waterproof:'IPX7' } }),
  mk({ name:'Sony WH-1000XM5 Wireless Headphones', brand:'Sony', category:'electronics', subcategory:'Audio Equipment', price:29990, images:IMG.audio, tags:['toprated','featured'], description:'Industry-leading noise cancellation.', specs:{ Battery:'30 hrs', ANC:'Yes' } }),
  mk({ name:'JBL Flip 6 Portable Speaker', brand:'JBL', category:'electronics', subcategory:'Audio Equipment', price:9999, images:IMG.audio, tags:['bestseller'], description:'Bold sound, waterproof design.', specs:{ Power:'20W', Battery:'12 hrs' } }),

  // Gaming
  mk({ name:'PlayStation 5 Slim Disc Console', brand:'Sony', category:'electronics', subcategory:'Gaming', price:54990, images:IMG.gaming, tags:['toprated','bestseller','trending'], description:'Slimmer, sleeker, ultra-fast.', specs:{ Storage:'1TB SSD', Drive:'Ultra HD Blu-ray' } }),
  mk({ name:'Xbox Series X 1TB', brand:'Sony', category:'electronics', subcategory:'Gaming', price:52990, images:IMG.gaming, tags:['featured'], description:'The fastest, most powerful Xbox ever.', specs:{ Storage:'1TB SSD', GPU:'12 TFLOPs' } }),

  // CPUs
  mk({ name:'Intel Core i9-14900K Unlocked CPU', brand:'Intel', category:'computer-parts', subcategory:'CPUs', price:59990, images:IMG.cpu, tags:['toprated','featured'], description:'24 cores of enthusiast performance.', specs:{ Cores:'24 (8P+16E)', Boost:'6.0 GHz', Socket:'LGA1700' } }),
  mk({ name:'AMD Ryzen 7 7800X3D Gaming CPU', brand:'AMD', category:'computer-parts', subcategory:'CPUs', price:44990, images:IMG.cpu, tags:['bestseller','trending'], description:'3D V-Cache champion for gamers.', specs:{ Cores:'8', Threads:'16', Cache:'96MB', Socket:'AM5' } }),
  mk({ name:'Intel Core i5-13400F CPU', brand:'Intel', category:'computer-parts', subcategory:'CPUs', price:18990, images:IMG.cpu, tags:['deal'], description:'Great value 10-core CPU.', specs:{ Cores:'10', Socket:'LGA1700' } }),

  // GPUs
  mk({ name:'NVIDIA GeForce RTX 4090 24GB', brand:'NVIDIA', category:'computer-parts', subcategory:'Graphics Cards', price:189990, images:IMG.gpu, tags:['toprated','featured','trending'], description:'The ultimate GeForce.', specs:{ VRAM:'24GB GDDR6X', PowerDraw:'450W' } }),
  mk({ name:'ASUS TUF RTX 4070 SUPER OC 12GB', brand:'ASUS', category:'computer-parts', subcategory:'Graphics Cards', price:64990, images:IMG.gpu, tags:['bestseller','new'], description:'High-refresh 1440p gaming.', specs:{ VRAM:'12GB GDDR6X' } }),
  mk({ name:'AMD Radeon RX 7900 XTX 24GB', brand:'AMD', category:'computer-parts', subcategory:'Graphics Cards', price:99990, images:IMG.gpu, tags:['featured'], description:'RDNA 3 flagship.', specs:{ VRAM:'24GB GDDR6' } }),

  // RAM
  mk({ name:'Corsair Vengeance DDR5 32GB (2x16) 6000MHz', brand:'Corsair', category:'computer-parts', subcategory:'RAM', price:11990, images:IMG.ram, tags:['bestseller'], description:'Premium DDR5 for AM5/LGA1700.', specs:{ Capacity:'32GB', Speed:'6000 MT/s' } }),
  mk({ name:'ZAMY Rage RGB DDR5 64GB Kit', brand:'ZAMY', category:'computer-parts', subcategory:'RAM', price:19990, images:IMG.ram, tags:['new'], description:'64GB RGB for workstations.', specs:{ Capacity:'64GB', Speed:'6400 MT/s' } }),

  // Motherboards
  mk({ name:'ASUS ROG Strix Z790-E Gaming WiFi', brand:'ASUS', category:'computer-parts', subcategory:'Motherboards', price:38990, images:IMG.mobo, tags:['featured'], description:'Enthusiast LGA1700 board.', specs:{ Socket:'LGA1700', Chipset:'Z790', Memory:'DDR5' } }),
  mk({ name:'MSI B650 Tomahawk WiFi', brand:'ASUS', category:'computer-parts', subcategory:'Motherboards', price:22990, images:IMG.mobo, tags:['bestseller'], description:'Rock-solid AM5 board.', specs:{ Socket:'AM5', Chipset:'B650' } }),

  // SSD
  mk({ name:'Samsung 990 PRO NVMe SSD 2TB', brand:'Samsung', category:'computer-parts', subcategory:'SSD', price:16990, images:IMG.ssd, tags:['toprated','bestseller'], description:'PCIe 4.0 flagship SSD.', specs:{ Capacity:'2TB', Interface:'NVMe PCIe 4.0', Read:'7450 MB/s' } }),
  mk({ name:'WD Black SN850X 1TB Gaming SSD', brand:'Samsung', category:'computer-parts', subcategory:'SSD', price:9990, images:IMG.ssd, tags:['deal'], description:'Blazing PCIe 4 gaming SSD.', specs:{ Capacity:'1TB', Read:'7300 MB/s' } }),

  // HDD / PSU / Cooling / Networking
  mk({ name:'Seagate BarraCuda 4TB HDD', brand:'Samsung', category:'computer-parts', subcategory:'HDD', price:6990, images:IMG.ssd, tags:['bestseller'], description:'Reliable mass storage.', specs:{ Capacity:'4TB', RPM:'5400' } }),
  mk({ name:'Corsair RM850x 80+ Gold PSU', brand:'Corsair', category:'computer-parts', subcategory:'Power Supplies', price:13990, images:IMG.psu, tags:['toprated'], description:'Fully modular gold PSU.', specs:{ Wattage:'850W', Rating:'80+ Gold' } }),
  mk({ name:'ZAMY Frost 360 AIO Liquid Cooler', brand:'ZAMY', category:'computer-parts', subcategory:'Cooling Systems', price:14990, images:IMG.cooling, tags:['new','trending'], description:'360mm AIO with LCD screen.', specs:{ Radiator:'360mm', Screen:'2.1" LCD' } }),
  mk({ name:'TP-Link Archer AX73 Wi-Fi 6 Router', brand:'HP', category:'computer-parts', subcategory:'Networking', price:8990, images:IMG.network, tags:['bestseller','deal'], description:'AX5400 Wi-Fi 6 mesh-ready router.', specs:{ Standard:'Wi-Fi 6 AX5400' } }),

  // Mobile Accessories
  mk({ name:'ZAMY 65W GaN Fast Charger', brand:'ZAMY', category:'mobile-accessories', subcategory:'Chargers', price:1499, images:IMG.mobileAcc, tags:['bestseller','deal','trending'], description:'Tiny, powerful, universal.', specs:{ Power:'65W', Ports:'2x USB-C + 1x USB-A' } }),
  mk({ name:'Anker PowerCore 20K Power Bank', brand:'ZAMY', category:'mobile-accessories', subcategory:'Power Banks', price:2499, images:IMG.mobileAcc, tags:['toprated'], description:'20000mAh, 22.5W PD.', specs:{ Capacity:'20000 mAh' } }),
  mk({ name:'ZAMY AirPods Pods 3 ANC Earbuds', brand:'ZAMY', category:'mobile-accessories', subcategory:'Earbuds', price:3999, images:IMG.audio, tags:['new','bestseller'], description:'Hybrid ANC earbuds, 40h battery.', specs:{ ANC:'Yes', Battery:'40 hrs' } }),
  mk({ name:'Braided USB-C to USB-C 100W Cable 2m', brand:'ZAMY', category:'mobile-accessories', subcategory:'Cables', price:499, images:IMG.mobileAcc, tags:['deal'], description:'Durable, PD 100W.', specs:{ Length:'2m', Rating:'100W' } }),

  // Automotive
  mk({ name:'Michelin Pilot Sport 4 Tyre 205/55R16', brand:'Michelin', category:'automotive', subcategory:'Tyres', price:9990, images:IMG.tyre, tags:['toprated','featured'], description:'Sport touring tyre with premium grip.', specs:{ Size:'205/55R16', LoadIndex:'91' } }),
  mk({ name:'Bosch S6 AGM Car Battery 60Ah', brand:'Bosch', category:'automotive', subcategory:'Batteries', price:12990, images:IMG.battery, tags:['bestseller'], description:'Start-stop compatible AGM battery.', specs:{ Capacity:'60 Ah', CCA:'680A' } }),
  mk({ name:'Castrol Edge 5W-30 Full Synthetic 4L', brand:'Castrol', category:'automotive', subcategory:'Engine Oil', price:3499, images:IMG.oil, tags:['deal','bestseller'], description:'Full synthetic engine oil.', specs:{ Grade:'5W-30', Volume:'4L' } }),
  mk({ name:'ZAMY LED H4 Headlight Bulb Set', brand:'ZAMY', category:'automotive', subcategory:'Lighting', price:1799, images:IMG.car, tags:['new'], description:'6500K bright white LED conversion.', specs:{ Base:'H4', Colour:'6500K' } }),
  mk({ name:'DeWalt Cordless Impact Wrench 20V', brand:'DeWalt', category:'automotive', subcategory:'Tools', price:18990, images:IMG.tools, tags:['toprated','featured'], description:'700Nm impact wrench.', specs:{ Torque:'700 Nm', Battery:'20V' } }),
  mk({ name:'Meguiars Ultimate Car Wash & Wax', brand:'Castrol', category:'automotive', subcategory:'Car Care', price:1299, images:IMG.oil, tags:['bestseller'], description:'Wash and wax in one.', specs:{ Volume:'1.4L' } }),
  mk({ name:'ZAMY Motorcycle Chain Kit', brand:'ZAMY', category:'automotive', subcategory:'Bike Parts', price:2499, images:IMG.bike, tags:['deal'], description:'O-ring sealed chain + sprockets.', specs:{ Type:'520' } }),

  // Electrical / Industrial / Home / Office
  mk({ name:'Philips 9W B22 LED Bulb (Pack of 10)', brand:'Philips', category:'electrical', subcategory:'LED Lighting', price:899, images:IMG.electrical, tags:['bestseller'], description:'Cool daylight LED, 800 lumens.', specs:{ Wattage:'9W', Lumens:'800' } }),
  mk({ name:'Schneider 32A Circuit Breaker', brand:'Bosch', category:'electrical', subcategory:'Circuit Breakers', price:499, images:IMG.electrical, tags:[], description:'C-curve MCB.', specs:{ Amps:'32A' } }),
  mk({ name:'Bosch GBH 2-26 Rotary Hammer Drill', brand:'Bosch', category:'industrial', subcategory:'Machinery', price:11990, images:IMG.industrial, tags:['toprated','bestseller'], description:'Professional SDS-plus rotary hammer.', specs:{ Power:'830W' } }),
  mk({ name:'Industrial Digital Vernier Caliper 200mm', brand:'Makita', category:'industrial', subcategory:'Measuring', price:2499, images:IMG.industrial, tags:['deal'], description:'0.01mm precision digital caliper.', specs:{ Range:'0-200mm' } }),
  mk({ name:'Samsung 55" 4K QLED Smart TV', brand:'Samsung', category:'home-electronics', subcategory:'TVs', price:69990, images:IMG.home, tags:['featured','trending','bestseller'], description:'Quantum HDR QLED with Tizen.', specs:{ Size:'55"', Resolution:'4K UHD' } }),
  mk({ name:'Dyson V15 Detect Cordless Vacuum', brand:'Sony', category:'home-electronics', subcategory:'Vacuums', price:64990, images:IMG.home, tags:['toprated'], description:'Laser dust detection.', specs:{ Runtime:'60 min' } }),
  mk({ name:'HP LaserJet Pro M404dn Printer', brand:'HP', category:'office', subcategory:'Printers', price:24990, images:IMG.office, tags:['bestseller'], description:'Fast mono laser printer.', specs:{ Speed:'38 ppm' } }),
  mk({ name:'LG UltraGear 27" 240Hz Gaming Monitor', brand:'LG', category:'office', subcategory:'Monitors', price:34990, images:IMG.office, tags:['toprated','new'], description:'IPS 240Hz 1440p gaming display.', specs:{ Size:'27"', Refresh:'240Hz' } }),
]

export const HERO_SLIDES = [
  {
    tag: 'Mega Tech Sale',
    title: 'Up to 60% OFF on Laptops & GPUs',
    subtitle: 'Powerful machines for creators, engineers and gamers.',
    cta: 'Shop Electronics',
    href: '/category/electronics',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600',
    accent: 'from-yellow-400 via-yellow-300 to-white',
  },
  {
    tag: 'Build Your Rig',
    title: 'Computer Parts, Priced to Build',
    subtitle: 'CPUs, GPUs, RAM, SSDs and more — from trusted brands.',
    cta: 'Explore PC Parts',
    href: '/category/computer-parts',
    img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600',
    accent: 'from-yellow-500 via-yellow-300 to-black',
  },
  {
    tag: 'Garage Ready',
    title: 'Automotive & Tools You Can Trust',
    subtitle: 'Batteries, tyres, engine oils, power tools — genuine only.',
    cta: 'Shop Automotive',
    href: '/category/automotive',
    img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1600',
    accent: 'from-black via-neutral-800 to-yellow-500',
  },
]

export const PROMOS = [
  { title: 'Limited Time Flash Deals', sub: 'Ends in 24 hours. Grab them fast.', cta: 'View Deals', href: '/deals', img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400' },
  { title: 'Everyday Essentials', sub: 'Cables, chargers, accessories under ₹999', cta: 'Shop Now', href: '/category/mobile-accessories', img:'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1400' },
  { title: 'Pro Workshop', sub: 'Tools & industrial gear for professionals', cta: 'Shop Tools', href: '/category/industrial', img:'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1400' },
]

export function findProduct(id) {
  return PRODUCTS.find(p => p.id === id)
}

export function filterProducts({ q='', category='', subcategory='', brand=[], minPrice=0, maxPrice=Infinity, rating=0, inStock=false, sort='popular', tag='' } = {}) {
  let list = PRODUCTS.slice()
  if (q) {
    const query = q.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.subcategory.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
  }
  if (category) list = list.filter(p => p.category === category)
  if (subcategory) list = list.filter(p => p.subcategory.toLowerCase() === subcategory.toLowerCase())
  if (brand?.length) list = list.filter(p => brand.includes(p.brand))
  if (rating) list = list.filter(p => p.rating >= rating)
  if (inStock) list = list.filter(p => p.stock > 0)
  list = list.filter(p => p.price >= minPrice && p.price <= maxPrice)
  if (tag) list = list.filter(p => (p.tags||[]).includes(tag))
  switch (sort) {
    case 'price_asc': list.sort((a,b) => a.price - b.price); break
    case 'price_desc': list.sort((a,b) => b.price - a.price); break
    case 'rating': list.sort((a,b) => b.rating - a.rating); break
    case 'newest': list.sort((a,b) => b.createdAt - a.createdAt); break
    case 'discount': list.sort((a,b) => b.discount - a.discount); break
    default: list.sort((a,b) => b.ratingCount - a.ratingCount)
  }
  return list
}

export function suggestProducts(q, limit=8) {
  if (!q) return []
  return filterProducts({ q }).slice(0, limit)
}

export function similarProducts(product, limit=8) {
  if (!product) return []
  return PRODUCTS
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .sort((a,b) => (b.rating*b.ratingCount) - (a.rating*a.ratingCount))
    .slice(0, limit)
}
