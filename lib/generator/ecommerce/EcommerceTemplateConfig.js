// Enhanced Generator Configuration - Update for your ProjectTemplateGeneratorWithEcommerce
// File: lib/generator/base/EcommerceTemplateConfig.js

export const ECOMMERCE_TEMPLATES = {
  // Firebase Service Template
  'lib/firebase-service.js': (config) => generateFirebaseServiceTemplate(config),
  
  // Cart Hook Template
  'hooks/useCart.js': () => generateCartHookTemplate(),
  
  // Updated Pages with Firebase Integration
  'app/ecommerce/shop/page.js': (config) => generateShopPageTemplate(config),
  'app/ecommerce/cart/page.js': (config) => generateCartPageTemplate(config),
  'app/ecommerce/checkout/page.js': (config) => generateCheckoutPageTemplate(config),
  'app/ecommerce/product/[id]/page.js': (config) => generateProductPageTemplate(config),
  
  // Enhanced Components
  'components/ecommerce/ProductCard.jsx': (config) => generateProductCardTemplate(config),
  'components/ecommerce/AddToCartButton.jsx': (config) => generateAddToCartButtonTemplate(config),

  // Environment Configuration
  '.env.local.example': (config) => generateEnvTemplate(config),
  
  // Package.json with Firebase dependencies
  'package.json': (config) => generateEcommercePackageJson(config)
}

export const FIREBASE_COLLECTIONS_SETUP = {
  // Products collection structure
  products: {
    fields: {
      name: 'string',
      description: 'string',
      price: 'number',
      originalPrice: 'number',
      categoryId: 'string',
      image: 'string',
      images: 'array',
      inStock: 'boolean',
      stockQuantity: 'number',
      rating: 'number',
      reviews: 'number',
      featured: 'boolean',
      active: 'boolean',
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      totalSales: 'number',
      views: 'number'
    },
    indexes: [
      ['active', 'createdAt'],
      ['categoryId', 'active'],
      ['featured', 'active']
    ]
  },
  
  // Categories collection
  categories: {
    fields: {
      name: 'string',
      description: 'string',
      slug: 'string',
      image: 'string',
      active: 'boolean',
      productCount: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },
  
  // Orders collection
  orders: {
    fields: {
      orderNumber: 'string',
      customerId: 'string',
      customer: 'object',
      shippingAddress: 'object',
      billingAddress: 'object',
      items: 'array',
      pricing: 'object',
      status: 'string', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      paymentStatus: 'string', // 'pending', 'paid', 'failed', 'refunded'
      payment: 'object',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    indexes: [
      ['customerId', 'createdAt'],
      ['status'],
      ['orderNumber']
    ]
  },
  
  // Customers collection
  customers: {
    fields: {
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      phone: 'string',
      newsletter: 'boolean',
      totalOrders: 'number',
      totalSpent: 'number',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    indexes: [
      ['email']
    ]
  },
  
  // Reviews collection
  reviews: {
    fields: {
      productId: 'string',
      customerId: 'string',
      customerName: 'string',
      rating: 'number',
      title: 'string',
      content: 'string',
      approved: 'boolean',
      helpful: 'number',
      createdAt: 'timestamp'
    },
    indexes: [
      ['productId', 'approved'],
      ['customerId']
    ]
  }
}

export const LOCALSTORAGE_CART_CONFIG = {
  storageKey: 'shopping_cart',
  expiryKey: 'cart_expiry',
  expiryHours: 24,
  maxItems: 50,
  features: {
    guestCart: true,
    cartMerging: true,
    stockValidation: true,
    priceUpdates: true,
    expiration: true
  }
}

export const ECOMMERCE_FEATURES = {
  core: [
    'product_catalog',
    'shopping_cart',
    'checkout_process',
    'order_management'
  ],
  
  optional: [
    'user_accounts',
    'wishlist',
    'product_reviews',
    'inventory_tracking',
    'coupons_discounts',
    'shipping_calculator',
    'tax_calculator',
    'payment_integration'
  ],
  
  advanced: [
    'recommendation_engine',
    'abandoned_cart_recovery',
    'analytics_tracking',
    'multi_currency',
    'multi_language',
    'subscription_billing'
  ]
}

// Template generation functions (these would generate the actual code)
function generateFirebaseServiceTemplate(config) {
  return `// Firebase Service for ${config.businessName}
// Auto-generated ecommerce service with full CRUD operations
${getFirebaseServiceCode(config)}`
}

function generateCartHookTemplate() {
  return `// localStorage Cart Hook
// Persistent cart with expiration and stock validation
${getCartHookCode()}`
}

function generateShopPageTemplate(config) {
  return `// Shop Page for ${config.businessName}
// Firebase-integrated product listing with search and filters
${getShopPageCode(config)}`
}

function generateCartPageTemplate(config) {
  return `// Shopping Cart Page for ${config.businessName}
// localStorage cart with real-time stock validation
${getCartPageCode(config)}`
}

function generateCheckoutPageTemplate(config) {
  return `// Checkout Page for ${config.businessName}
// Multi-step checkout with Firebase order creation
${getCheckoutPageCode(config)}`
}

function generateProductPageTemplate(config) {
  return `// Product Detail Page for ${config.businessName}
// Dynamic product page with reviews and related products
${getProductPageCode(config)}`
}

function generateProductCardTemplate(config) {
  return `// Product Card Component for ${config.businessName}
// Reusable product card with cart integration
${getProductCardCode(config)}`
}

function generateEcommercePackageJson(config) {
  return JSON.stringify({
    name: config.businessName.toLowerCase().replace(/\s+/g, '-'),
    version: '0.1.0',
    private: true,
    "type": 'module',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      next: '^14.0.0',
      react: '^18.0.0',
      'react-dom': '^18.0.0',
      firebase: '^10.7.0',
      'lucide-react': '^0.300.0'
    },
    devDependencies: {
      tailwindcss: '^3.3.0',
      postcss: '^8.4.0',
      autoprefixer: '^10.4.0',
      eslint: '^8.0.0',
      'eslint-config-next': '^14.0.0'
    }
  }, null, 2)
}

function generateEnvTemplate(config) {
  return `# Firebase Configuration for ${config.businessName}
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional: Payment Integration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORE_NAME=${config.businessName}
NEXT_PUBLIC_STORE_CURRENCY=USD`
}

// Integration helpers for your existing generator
export function enhanceEcommerceGenerator(existingGenerator) {
  // Add new template methods
  existingGenerator.generateFirebaseService = function(config) {
    return generateFirebaseServiceTemplate(config)
  }
  
  existingGenerator.generateCartSystem = function() {
    return generateCartHookTemplate()
  }
  
  existingGenerator.generateEcommercePages = function(config) {
    return {
      'app/shop/page.js': generateShopPageTemplate(config),
      'app/cart/page.js': generateCartPageTemplate(config),
      'app/checkout/page.js': generateCheckoutPageTemplate(config),
      'app/product/[id]/page.js': generateProductPageTemplate(config)
    }
  }
  
  // Override package.json generation for ecommerce
  existingGenerator.generateEcommercePackageJson = function(config) {
    return generateEcommercePackageJson(config)
  }
  
  return existingGenerator
}

export default {
  ECOMMERCE_TEMPLATES,
  FIREBASE_COLLECTIONS_SETUP,
  LOCALSTORAGE_CART_CONFIG,
  ECOMMERCE_FEATURES,
  enhanceEcommerceGenerator
}