// Enhanced ProjectTemplateGenerator with Ecommerce Support
// File: lib/ProjectTemplateGeneratorWithEcommerce.js

import ProjectTemplateGenerator from './ProjectTemplateGenerator.js';
import EcommercePagesGenerator from './EcommercePagesGenerator.js';

class ProjectTemplateGeneratorWithEcommerce extends ProjectTemplateGenerator {
  constructor() {
    super();
    this.ecommerceGenerator = new EcommercePagesGenerator();
  }

  async generateProject(config) {
    console.log(`🚀 Generating project with ecommerce: ${config.businessName || config.name}`);
    
    // Check if this is an ecommerce project
    const isEcommerce = this.isEcommerceProject(config);
    console.log(`🛍️ Ecommerce mode: ${isEcommerce ? 'Yes' : 'No'}`);
    
    if (isEcommerce) {
      return await this.generateEcommerceProject(config);
    } else {
      return await super.generateProject(config);
    }
  }

  isEcommerceProject(config) {
    // Check multiple indicators for ecommerce
    const ecommerceIndicators = [
      config.projectType === 'ecommerce',
      config.businessType?.toLowerCase().includes('ecommerce'),
      config.businessType?.toLowerCase().includes('e-commerce'),
      config.businessType?.toLowerCase().includes('shop'),
      config.businessType?.toLowerCase().includes('store'),
      config.businessType?.toLowerCase().includes('retail'),
      config.enableEcommerce === true,
      config.pages?.some(page => ['shop', 'product', 'cart', 'checkout'].includes(page.type))
    ];

    return ecommerceIndicators.some(indicator => indicator);
  }

  async generateEcommerceProject(config) {
    console.log(`🛍️ Generating ecommerce project for: ${config.businessName}`);
    
    // Ensure ecommerce pages are included
    config = this.ensureEcommercePages(config);
    
    console.log(`📊 Ecommerce project details:`, {
      business: config.businessName,
      industry: config.industry,
      type: config.businessType,
      pages: config.pages?.length || 0,
      ecommercePages: config.pages?.filter(p => this.isEcommercePage(p.type)).length || 0
    });

    const project = {
      id: `ecommerce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.businessName || config.name,
      type: 'ecommerce',
      config,
      files: {},
      generationMetadata: {
        projectType: 'ecommerce',
        pageCount: config.pages?.filter(p => p.enabled).length || 1,
        ecommercePageCount: config.pages?.filter(p => p.enabled && this.isEcommercePage(p.type)).length || 0,
        generatedAt: new Date().toISOString(),
        processingStartTime: Date.now()
      }
    };

    try {
      console.log('🔧 Generating ecommerce project files...');
      
      // Generate base files (package.json, configs, etc.)
      const baseFiles = await this.generateEcommerceBaseFiles(config);
      
      // Generate regular pages (home, about, contact, etc.)
      const regularPageFiles = await this.pagesGenerator.generatePages(config.projectId, config);
      
      // Generate ecommerce-specific pages and components
      const ecommerceFiles = await this.ecommerceGenerator.generateEcommercePages(config, {
        enableCheckout: config.enableCheckout !== false,
        enableUserAccounts: config.enableUserAccounts !== false,
        enableWishlist: config.enableWishlist !== false
      });
      
      // Generate ecommerce-enhanced components
      const componentFiles = this.generateEcommerceComponents(config);
      
      // Combine all files
      project.files = {
        ...baseFiles,
        ...regularPageFiles,
        ...ecommerceFiles,
        ...componentFiles
      };

      // Update metadata
      project.generationMetadata.processingTime = `${((Date.now() - project.generationMetadata.processingStartTime) / 1000).toFixed(2)}s`;
      project.generationMetadata.fileCount = Object.keys(project.files).length;
      delete project.generationMetadata.processingStartTime;

      console.log(`✅ Ecommerce project generated with ${Object.keys(project.files).length} files`);
      console.log(`⏱️  Generation completed in ${project.generationMetadata.processingTime}`);
      
      return project;

    } catch (error) {
      console.error('❌ Error generating ecommerce project:', error);
      throw new Error(`Ecommerce project generation failed: ${error.message}`);
    }
  }

  ensureEcommercePages(config) {
    // If pages array doesn't exist, create it
    if (!config.pages || !Array.isArray(config.pages)) {
      config.pages = [];
    }

    // Define required ecommerce pages
    const requiredEcommercePages = [
      {
        id: 'home',
        name: 'Home',
        type: 'home',
        enabled: true,
        config: { showProducts: true, featuredProducts: true }
      },
      {
        id: 'shop',
        name: 'Shop',
        type: 'shop',
        enabled: true,
        config: { productsPerPage: 12, enableFilters: true, enableSearch: true }
      },
      {
        id: 'product',
        name: 'Product Detail',
        type: 'product',
        enabled: true,
        config: { showRelated: true, enableReviews: true }
      },
      {
        id: 'cart',
        name: 'Shopping Cart',
        type: 'cart',
        enabled: true,
        config: { showRecommendations: true }
      },
      {
        id: 'checkout',
        name: 'Checkout',
        type: 'checkout',
        enabled: config.enableCheckout !== false,
        config: { enableGuestCheckout: true, paymentMethods: ['card', 'paypal'] }
      },
      {
        id: 'account',
        name: 'My Account',
        type: 'account',
        enabled: config.enableUserAccounts !== false,
        config: { enableWishlist: true, enableOrderHistory: true }
      }
    ];

    // Add missing ecommerce pages
    requiredEcommercePages.forEach(requiredPage => {
      const existingPage = config.pages.find(page => page.type === requiredPage.type);
      if (!existingPage) {
        config.pages.push(requiredPage);
        console.log(`➕ Added missing ecommerce page: ${requiredPage.name}`);
      }
    });

    // Ensure at least basic business pages exist
    const basicPages = [
      { id: 'about', name: 'About', type: 'about', enabled: true, config: {} },
      { id: 'contact', name: 'Contact', type: 'contact', enabled: true, config: {} }
    ];

    basicPages.forEach(basicPage => {
      const existingPage = config.pages.find(page => page.type === basicPage.type);
      if (!existingPage) {
        config.pages.push(basicPage);
        console.log(`➕ Added basic business page: ${basicPage.name}`);
      }
    });

    return config;
  }

  isEcommercePage(pageType) {
    return ['shop', 'product', 'cart', 'checkout', 'account'].includes(pageType);
  }

  async generateEcommerceBaseFiles(config) {
    const baseFiles = await super.generateBaseFiles(config);
    
    // Override package.json with ecommerce dependencies
    baseFiles['package.json'] = this.generateEcommercePackageJson(config);
    
    // Add ecommerce-specific configuration files
    baseFiles['lib/ecommerce/config.js'] = this.generateEcommerceConfig(config);
    baseFiles['lib/ecommerce/cart.js'] = this.generateCartLogic();
    baseFiles['lib/ecommerce/products.js'] = this.generateProductService();
    
    return baseFiles;
  }

  generateEcommercePackageJson(config) {
    return JSON.stringify({
      name: (config.businessName || config.name).toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
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
        'lucide-react': '^0.300.0',
        firebase: '^10.7.0',
        openai: '^4.20.0',
        // Ecommerce-specific dependencies
        stripe: '^13.0.0',
        '@stripe/stripe-js': '^2.0.0',
        'use-shopping-cart': '^3.1.0',
        'react-query': '^3.39.0',
        'zustand': '^4.4.0',
        'react-hook-form': '^7.45.0',
        'react-hot-toast': '^2.4.0'
      },
      devDependencies: {
        tailwindcss: '^3.3.0',
        postcss: '^8.4.0',
        autoprefixer: '^10.4.0',
        eslint: '^8.0.0',
        'eslint-config-next': '^14.0.0',
        '@types/stripe': '^8.0.0'
      }
    }, null, 2);
  }

  generateEcommerceConfig(config) {
    return `// Ecommerce Configuration
// File: lib/ecommerce/config.js

export const ecommerceConfig = {
  // Store Information
  store: {
    name: '${config.businessName || 'Your Store'}',
    description: '${config.businessDescription || 'Quality products for discerning customers'}',
    currency: 'USD',
    locale: 'en-US',
    timezone: 'America/New_York'
  },

  // Product Settings
  products: {
    perPage: 12,
    maxPerPage: 48,
    enableReviews: true,
    enableWishlist: ${config.enableWishlist !== false},
    enableCompare: true,
    showStock: true,
    lowStockThreshold: 5
  },

  // Shopping Cart
  cart: {
    enableGuestCheckout: true,
    maxQuantityPerItem: 99,
    sessionTimeout: 30, // minutes
    abandonedCartEmail: true
  },

  // Checkout & Payments
  checkout: {
    requireAccount: false,
    enablePayPal: true,
    enableStripe: true,
    enableApplePay: true,
    enableGooglePay: true,
    taxCalculation: 'automatic',
    shippingCalculation: 'realtime'
  },

  // Shipping
  shipping: {
    freeShippingThreshold: 50,
    defaultRate: 9.99,
    internationalShipping: false,
    processingTime: '1-2 business days',
    shippingMethods: [
      { id: 'standard', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7' },
      { id: 'express', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3' },
      { id: 'overnight', name: 'Overnight', price: 39.99, estimatedDays: '1' }
    ]
  },

  // User Accounts
  accounts: {
    enabled: ${config.enableUserAccounts !== false},
    requireEmailVerification: true,
    enableSocialLogin: false,
    passwordMinLength: 8,
    enableOrderHistory: true,
    enableAddressBook: true
  },

  // SEO & Analytics
  seo: {
    enableStructuredData: true,
    enableSitemap: true,
    enableRobots: true,
    metaDescription: '${config.businessDescription || 'Shop quality products online'}',
    keywords: ['${config.industry || 'ecommerce'}', 'online shopping', 'quality products']
  },

  // Features
  features: {
    enableSearch: true,
    enableFilters: true,
    enableSorting: true,
    enableRecentlyViewed: true,
    enableRecommendations: true,
    enableCoupons: false,
    enableInventoryTracking: true
  }
};

export default ecommerceConfig;`;
  }

  generateCartLogic() {
    return `// Shopping Cart Logic
// File: lib/ecommerce/cart.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity }]
          });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal > 50 ? 0 : 9.99;
        const tax = subtotal * 0.08; // 8% tax
        return subtotal + shipping + tax;
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;`;
  }

  generateProductService() {
    return `// Product Service
// File: lib/ecommerce/products.js

// This would normally connect to your product database/API
// For now, we'll use sample data

const sampleProducts = [
  {
    id: '1',
    name: 'Premium Laptop',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    originalPrice: 1499.99,
    category: 'electronics',
    image: '/placeholder-laptop.jpg',
    images: ['/placeholder-laptop.jpg', '/placeholder-laptop2.jpg'],
    inStock: true,
    stockQuantity: 15,
    rating: 4.5,
    reviews: 42,
    features: ['16GB RAM', '512GB SSD', '14" Display'],
    specifications: {
      'Brand': 'TechBrand',
      'Model': 'PRO-001',
      'Weight': '3.2 lbs',
      'Warranty': '2 Years'
    }
  },
  // Add more sample products...
];

export class ProductService {
  static async getAllProducts() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(sampleProducts), 100);
    });
  }
  
  static async getProductById(id) {
    return new Promise((resolve) => {
      const product = sampleProducts.find(p => p.id === id);
      setTimeout(() => resolve(product), 100);
    });
  }
  
  static async getProductsByCategory(categoryId) {
    return new Promise((resolve) => {
      const products = sampleProducts.filter(p => p.category === categoryId);
      setTimeout(() => resolve(products), 100);
    });
  }
  
  static async searchProducts(query) {
    return new Promise((resolve) => {
      const results = sampleProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
      setTimeout(() => resolve(results), 100);
    });
  }
  
  static async getFeaturedProducts() {
    return new Promise((resolve) => {
      const featured = sampleProducts.slice(0, 4);
      setTimeout(() => resolve(featured), 100);
    });
  }
}

export default ProductService;`;
  }

  generateEcommerceComponents(config) {
    const baseComponents = super.generateComponents(config);
    
    // Add ecommerce-enhanced header with cart
    baseComponents['components/Header.js'] = this.generateEcommerceHeader(config);
    
    // Add ecommerce utility components
    baseComponents['components/ecommerce/AddToCartButton.jsx'] = this.generateAddToCartButton();
    baseComponents['components/ecommerce/ProductGrid.jsx'] = this.generateProductGrid();
    baseComponents['components/ecommerce/QuickView.jsx'] = this.generateQuickView();
    
    return baseComponents;
  }

  generateEcommerceHeader(config) {
    const businessName = config.businessName || config.name || 'Your Store';
    
    return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sparkles, Search, ShoppingCart, User, Heart } from 'lucide-react'
import Button from './ui/Button'
import useCartStore from '@/lib/ecommerce/cart'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const itemCount = useCartStore(state => state.getItemCount())

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">${businessName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Link href="/account" className="p-2 text-gray-600 hover:text-gray-900">
              <User className="w-5 h-5" />
            </Link>
            
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Heart className="w-5 h-5" />
            </button>
            
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-around">
                <Link href="/account" className="flex flex-col items-center text-gray-600">
                  <User className="w-6 h-6 mb-1" />
                  <span className="text-xs">Account</span>
                </Link>
                
                <button className="flex flex-col items-center text-gray-600">
                  <Heart className="w-6 h-6 mb-1" />
                  <span className="text-xs">Wishlist</span>
                </button>
                
                <Link href="/cart" className="flex flex-col items-center text-gray-600 relative">
                  <ShoppingCart className="w-6 h-6 mb-1" />
                  <span className="text-xs">Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header`;
  }

  generateAddToCartButton() {
    return `'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import useCartStore from '@/lib/ecommerce/cart'
import toast from 'react-hot-toast'

function AddToCartButton({ product, quantity = 1, variant = 'primary', size = 'md', className = '' }) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = async () => {
    if (!product.inStock) return;
    
    setIsAdding(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      addItem(product, quantity)
      setJustAdded(true)
      toast.success(\`Added \${product.name} to cart!\`)
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      toast.error('Failed to add item to cart')
    } finally {
      setIsAdding(false)
    }
  }

  if (!product.inStock) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={\`\${className} cursor-not-allowed opacity-50\`}
        disabled
      >
        Out of Stock
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Adding...
        </>
      ) : justAdded ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  )
}

export default AddToCartButton`;
  }

  generateProductGrid() {
    return `'use client'

import ProductCard from './ProductCard'

function ProductGrid({ products, viewMode = 'grid', className = '' }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    )
  }

  return (
    <div className={\`\${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
    } \${className}\`}>
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}

export default ProductGrid`;
  }

  generateQuickView() {
    return `'use client'

import { useState } from 'react'
import { X, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import AddToCartButton from './AddToCartButton'

function QuickView({ product, isOpen, onClose }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick View</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={\`aspect-square bg-gray-100 rounded overflow-hidden border-2 \${
                        selectedImage === index ? 'border-blue-500' : 'border-transparent'
                      }\`}
                    >
                      <img
                        src={image}
                        alt={\`\${product.name} view \${index + 1}\`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={\`w-4 h-4 \${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }\`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-2xl font-bold text-gray-900">
                  \${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    \${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6">
                {product.description}
              </p>

              {product.features && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <AddToCartButton 
                product={product}
                quantity={quantity}
                size="lg"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickView`;
  }
}

export default ProjectTemplateGeneratorWithEcommerce;