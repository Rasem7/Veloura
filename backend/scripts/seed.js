const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Coupon = require('../src/models/Coupon');

dotenv.config();

const products = [
  {
    name: 'Astra Sculpt Blazer',
    description: 'Sharp tailored blazer with a soft stretch lining and a structured shoulder for day-to-night polish.',
    category: 'Women',
    price: 149,
    compareAtPrice: 189,
    colors: ['Amethyst', 'Black'],
    sizes: [{ label: 'XS', stock: 5 }, { label: 'S', stock: 12 }, { label: 'M', stock: 9 }, { label: 'L', stock: 3 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=80', alt: 'Woman wearing a tailored blazer' },
      { url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80', alt: 'Editorial blazer look' }
    ],
    benefits: ['Stretch lining', 'Tailored fit', 'Low-wrinkle finish'],
    tags: ['blazer', 'tailoring', 'workwear'],
    material: 'Wool blend'
  },
  {
    name: 'Nocturne Cargo Trousers',
    description: 'Relaxed utility trousers cut with a tapered leg, premium twill, and secure hidden pockets.',
    category: 'Men',
    price: 98,
    compareAtPrice: 128,
    colors: ['Black', 'Graphite'],
    sizes: [{ label: 'S', stock: 10 }, { label: 'M', stock: 14 }, { label: 'L', stock: 8 }, { label: 'XL', stock: 4 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', alt: 'Fashion model in black trousers' },
      { url: 'https://images.unsplash.com/photo-1506629905607-d9d297d7a685?auto=format&fit=crop&w=1200&q=80', alt: 'Streetwear trousers detail' }
    ],
    benefits: ['Secure pockets', 'Tapered leg', 'Durable twill'],
    tags: ['cargo', 'streetwear', 'trousers'],
    material: 'Cotton twill'
  },
  {
    name: 'Pulse Knit Runner',
    description: 'Lightweight knit sneaker with responsive cushioning and sculpted support for all-day movement.',
    category: 'Accessories',
    price: 132,
    colors: ['White', 'Violet', 'Black'],
    sizes: [{ label: '7', stock: 4 }, { label: '8', stock: 11 }, { label: '9', stock: 13 }, { label: '10', stock: 7 }, { label: '11', stock: 3 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80', alt: 'Premium running sneaker' },
      { url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80', alt: 'Sneaker side profile' }
    ],
    benefits: ['Responsive foam', 'Breathable knit', 'Grippy outsole'],
    tags: ['sneakers', 'runner', 'athletic'],
    material: 'Knit textile'
  },
  {
    name: 'Violet Studio Dress',
    description: 'Minimal midi dress with an elegant column silhouette, side slit, and a smooth premium hand feel.',
    category: 'Women',
    price: 118,
    colors: ['Imperial Purple', 'Ivory'],
    sizes: [{ label: 'XS', stock: 2 }, { label: 'S', stock: 7 }, { label: 'M', stock: 6 }, { label: 'L', stock: 2 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=80', alt: 'Woman wearing a premium dress' },
      { url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80', alt: 'Elegant dress editorial' }
    ],
    benefits: ['Elegant drape', 'Side slit', 'Event-ready'],
    tags: ['dress', 'occasion', 'minimal'],
    material: 'Viscose blend'
  },
  {
    name: 'Monarch Tech Hoodie',
    description: 'Heavyweight hoodie with a brushed interior, structured hood, and hidden zip pocket for essentials.',
    category: 'Men',
    price: 89,
    colors: ['Plum', 'Black'],
    sizes: [{ label: 'S', stock: 8 }, { label: 'M', stock: 18 }, { label: 'L', stock: 12 }, { label: 'XL', stock: 5 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80', alt: 'Man wearing premium hoodie' },
      { url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80', alt: 'Hoodie detail' }
    ],
    benefits: ['Brushed fleece', 'Hidden pocket', 'Structured hood'],
    tags: ['hoodie', 'athleisure', 'fleece'],
    material: 'Organic cotton fleece'
  },
  {
    name: 'Orbit Crossbody Bag',
    description: 'Compact crossbody bag in satin-finish vegan leather with an adjustable strap and polished hardware.',
    category: 'Accessories',
    price: 76,
    compareAtPrice: 96,
    colors: ['Black', 'Purple'],
    sizes: [{ label: 'OS', stock: 16 }],
    images: [
      { url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200&q=80', alt: 'Black crossbody bag' },
      { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80', alt: 'Luxury handbag detail' }
    ],
    benefits: ['Adjustable strap', 'Vegan leather', 'Interior organizer'],
    tags: ['bag', 'crossbody', 'accessory'],
    material: 'Vegan leather'
  }
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Coupon.deleteMany({});

  await Product.insertMany(products);
  await Coupon.create([
    { code: 'FIRST15', type: 'percentage', value: 15, minSubtotal: 75, usageLimit: 500 },
    { code: 'VIP25', type: 'fixed', value: 25, minSubtotal: 150, usageLimit: 200 }
  ]);

  const adminEmail = 'admin@veloura.local';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Veloura Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('AdminPass123!', 12),
      role: 'admin'
    });
  }

  console.log('Seed complete');
  console.log('Admin login: admin@veloura.local / AdminPass123!');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

