// Ecommerce Pages Generator - Extends ProjectPagesGenerator with shop functionality
// File: lib/EcommercePagesGenerator.js

import { OpenAI } from 'openai';

class EcommercePagesGenerator {
  constructor() {
    this.openai = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize OpenAI if available
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      }

      this.initialized = true;
      console.log('✅ EcommercePagesGenerator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize EcommercePagesGenerator:', error);
      throw error;
    }
  }

  // Generate ecommerce pages based on configuration
  async generateEcommercePages(projectData, ecommerceConfig = {}) {
    try {
      await this.initialize();
      
      console.log('🛍️ Generating ecommerce pages...');
      
      const pages = {};
      
      // Generate product data first
      const productData = await this.generateProductData(projectData, ecommerceConfig);
      
      // Generate ecommerce-specific pages
      const ecommercePageTypes = [
        'shop',
        'product',
        'cart', 
        'checkout',
        'account'
      ];

      for (const pageType of ecommercePageTypes) {
        if (this.shouldGeneratePage(pageType, ecommerceConfig)) {
          console.log(`🛒 Generating ${pageType} page...`);
          
          const pageContent = await this.generateEcommercePageContent(pageType, projectData, productData, ecommerceConfig);
          const pageComponent = this.createEcommercePageComponent(pageType, pageContent, projectData, productData);
          
          const filePath = this.getEcommercePageFilePath(pageType);
          pages[filePath] = pageComponent;
          
          console.log(`✅ ${pageType} page generated -> ${filePath}`);
        }
      }

      // Generate product components
      const components = this.generateEcommerceComponents(projectData, productData);
      Object.assign(pages, components);

      console.log(`✅ Generated ${Object.keys(pages).length} ecommerce files`);
      return pages;

    } catch (error) {
      console.error('❌ Error generating ecommerce pages:', error);
      throw error;
    }
  }

  shouldGeneratePage(pageType, config) {
    // Always generate core ecommerce pages
    const corePage = ['shop', 'product', 'cart'].includes(pageType);
    
    // Generate checkout and account based on config
    const optionalPages = {
      checkout: config.enableCheckout !== false,
      account: config.enableUserAccounts !== false
    };

    return corePage || optionalPages[pageType] !== false;
  }

  getEcommercePageFilePath(pageType) {
    const paths = {
      shop: 'app/shop/page.js',
      product: 'app/product/[id]/page.js',
      cart: 'app/cart/page.js',
      checkout: 'app/checkout/page.js',
      account: 'app/account/page.js'
    };
    
    return paths[pageType] || `app/${pageType}/page.js`;
  }

  async generateProductData(projectData, ecommerceConfig) {
    console.log('📦 Generating product data...');
    
    // Try AI generation first
    if (this.openai) {
      try {
        const aiProducts = await this.generateAIProductData(projectData, ecommerceConfig);
        console.log('🧠 AI-generated product data');
        return aiProducts;
      } catch (error) {
        console.warn('⚠️ AI product generation failed, using templates:', error.message);
      }
    }
    
    // Fallback to template products
    return this.getTemplateProductData(projectData, ecommerceConfig);
  }

  async generateAIProductData(projectData, ecommerceConfig) {
    const prompt = `Generate product data for an ecommerce store:

Business: ${projectData.businessName}
Industry: ${projectData.industry}
Business Type: ${projectData.businessType}
Target Audience: ${projectData.targetAudience || 'General consumers'}
Description: ${projectData.businessDescription || 'Online store'}

Generate 8-12 products appropriate for this business. Return JSON:

{
  "categories": [
    {"id": "cat1", "name": "Category Name", "description": "Category description"},
    {"id": "cat2", "name": "Category Name", "description": "Category description"}
  ],
  "products": [
    {
      "id": "prod1",
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "cat1",
      "image": "/placeholder-product.jpg",
      "features": ["Feature 1", "Feature 2"],
      "inStock": true,
      "rating": 4.5,
      "reviews": 25
    }
  ]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an ecommerce expert. Generate realistic product catalogs. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  getTemplateProductData(projectData, ecommerceConfig) {
    const businessName = projectData.businessName || 'Your Store';
    const industry = projectData.industry || 'retail';
    
    // Generate products based on industry
    const industryProducts = this.getIndustryProducts(industry, businessName);
    
    return {
      categories: industryProducts.categories,
      products: industryProducts.products,
      storeInfo: {
        name: businessName,
        description: `Quality products from ${businessName}`,
        currency: 'USD',
        shipping: 'Free shipping on orders over $50'
      }
    };
  }

  getIndustryProducts(industry, businessName) {
    const products = {
      technology: {
        categories: [
          { id: 'electronics', name: 'Electronics', description: 'Latest gadgets and devices' },
          { id: 'accessories', name: 'Accessories', description: 'Tech accessories and add-ons' },
          { id: 'software', name: 'Software', description: 'Digital products and licenses' }
        ],
        products: [
          { id: 'laptop-1', name: 'Professional Laptop', description: 'High-performance laptop for business', price: 1299.99, category: 'electronics', image: '/placeholder-laptop.jpg', features: ['16GB RAM', '512GB SSD', '14" Display'], inStock: true, rating: 4.5, reviews: 42 },
          { id: 'phone-1', name: 'Smart Phone Pro', description: 'Latest smartphone with advanced features', price: 899.99, category: 'electronics', image: '/placeholder-phone.jpg', features: ['5G Ready', '128GB Storage', 'Triple Camera'], inStock: true, rating: 4.3, reviews: 78 },
          { id: 'headphones-1', name: 'Wireless Headphones', description: 'Premium noise-canceling headphones', price: 299.99, category: 'accessories', image: '/placeholder-headphones.jpg', features: ['Noise Canceling', '30h Battery', 'Wireless'], inStock: true, rating: 4.7, reviews: 156 },
          { id: 'mouse-1', name: 'Ergonomic Mouse', description: 'Comfortable wireless mouse', price: 79.99, category: 'accessories', image: '/placeholder-mouse.jpg', features: ['Ergonomic Design', 'Wireless', 'Long Battery'], inStock: true, rating: 4.2, reviews: 34 }
        ]
      },
      'food & beverage': {
        categories: [
          { id: 'coffee', name: 'Coffee', description: 'Premium coffee beans and blends' },
          { id: 'tea', name: 'Tea', description: 'Fine teas from around the world' },
          { id: 'accessories', name: 'Accessories', description: 'Brewing equipment and accessories' }
        ],
        products: [
          { id: 'coffee-1', name: 'Premium Dark Roast', description: 'Rich, bold coffee beans', price: 24.99, category: 'coffee', image: '/placeholder-coffee.jpg', features: ['Dark Roast', 'Single Origin', '1lb Bag'], inStock: true, rating: 4.6, reviews: 89 },
          { id: 'tea-1', name: 'Earl Grey Tea', description: 'Classic Earl Grey blend', price: 18.99, category: 'tea', image: '/placeholder-tea.jpg', features: ['Bergamot Flavored', 'Premium Leaves', '50 Bags'], inStock: true, rating: 4.4, reviews: 67 },
          { id: 'grinder-1', name: 'Coffee Grinder', description: 'Electric burr coffee grinder', price: 149.99, category: 'accessories', image: '/placeholder-grinder.jpg', features: ['Burr Grinder', 'Multiple Settings', 'Easy Clean'], inStock: true, rating: 4.5, reviews: 23 }
        ]
      },
      default: {
        categories: [
          { id: 'featured', name: 'Featured', description: 'Our best products' },
          { id: 'new', name: 'New Arrivals', description: 'Latest additions to our store' },
          { id: 'sale', name: 'Sale', description: 'Special offers and discounts' }
        ],
        products: [
          { id: 'product-1', name: 'Premium Product', description: 'High-quality product for discerning customers', price: 99.99, category: 'featured', image: '/placeholder-product.jpg', features: ['Premium Quality', 'Durable', 'Satisfaction Guaranteed'], inStock: true, rating: 4.5, reviews: 45 },
          { id: 'product-2', name: 'Best Seller', description: 'Our most popular item', price: 149.99, category: 'featured', image: '/placeholder-product2.jpg', features: ['Top Rated', 'Customer Favorite', 'Great Value'], inStock: true, rating: 4.7, reviews: 123 },
          { id: 'product-3', name: 'New Arrival', description: 'Just added to our collection', price: 79.99, category: 'new', image: '/placeholder-product3.jpg', features: ['Latest Design', 'Modern Features', 'Limited Edition'], inStock: true, rating: 4.3, reviews: 18 }
        ]
      }
    };

    const industryKey = industry.toLowerCase();
    return products[industryKey] || products.default;
  }

  async generateEcommercePageContent(pageType, projectData, productData, ecommerceConfig) {
    // For ecommerce pages, we'll use the productData directly
    // AI content generation could be added here for page descriptions, etc.
    
    return {
      products: productData.products,
      categories: productData.categories,
      storeInfo: productData.storeInfo,
      pageType
    };
  }

  createEcommercePageComponent(pageType, content, projectData, productData) {
    const componentMap = {
      shop: () => this.createShopPage(content, projectData),
      product: () => this.createProductPage(content, projectData),
      cart: () => this.createCartPage(content, projectData),
      checkout: () => this.createCheckoutPage(content, projectData),
      account: () => this.createAccountPage(content, projectData)
    };

    const generator = componentMap[pageType];
    if (!generator) {
      throw new Error(`Unknown ecommerce page type: ${pageType}`);
    }

    return generator();
  }

  createShopPage(content, projectData) {
    return `'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ecommerce/ProductCard'
import CategoryFilter from '@/components/ecommerce/CategoryFilter'
import { Search, Filter, Grid, List } from 'lucide-react'

function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')

  const products = ${JSON.stringify(content.products || [], null, 2)};
  const categories = ${JSON.stringify(content.categories || [], null, 2)};

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ${projectData.businessName} Shop
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover our complete collection of premium products
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 px-4 bg-white border-b">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={\`p-2 \${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}\`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={\`p-2 \${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}\`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Products ({filteredProducts.length})
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className={\`\${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }\`}>
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default ShopPage`;
  }

  createProductPage(content, projectData) {
    return `'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { Star, Heart, Share, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react'

function ProductPage() {
  const params = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  // This would normally come from your product data or API
  const product = {
    id: params.id,
    name: "Sample Product",
    description: "This is a sample product description that would be loaded based on the product ID.",
    price: 99.99,
    originalPrice: 129.99,
    rating: 4.5,
    reviews: 128,
    inStock: true,
    images: [
      "/placeholder-product.jpg",
      "/placeholder-product2.jpg", 
      "/placeholder-product3.jpg"
    ],
    features: [
      "Premium Quality Materials",
      "Durable Construction", 
      "30-Day Money Back Guarantee",
      "Free Shipping"
    ],
    specifications: {
      "Brand": "${projectData.businessName}",
      "Model": "PRO-001",
      "Warranty": "2 Years",
      "Weight": "1.2 lbs"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={\`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 \${
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
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={\`w-5 h-5 \${
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

                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    \${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      \${product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                      Save \${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add to Cart */}
              <div className="border-t pt-6">
                <div className="flex items-center space-x-4 mb-4">
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-6"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-6"
                  >
                    <Share className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="w-5 h-5 mr-3 text-green-600" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-5 h-5 mr-3 text-blue-600" />
                  2-year warranty included
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 mr-3 text-purple-600" />
                  30-day return policy
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default ProductPage`;
  }

  createCartPage(content, projectData) {
    return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

function CartPage() {
  // This would normally come from a cart context or state management
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Sample Product 1',
      price: 99.99,
      quantity: 2,
      image: '/placeholder-product.jpg'
    },
    {
      id: '2', 
      name: 'Sample Product 2',
      price: 149.99,
      quantity: 1,
      image: '/placeholder-product2.jpg'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <ShoppingBag className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Link href="/shop">
                <Button size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">\${item.price}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          \${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg h-fit">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>\${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>\${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>\${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>\${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                    Add \${(50 - subtotal).toFixed(2)} more for free shipping!
                  </div>
                )}

                <Link href="/checkout">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link href="/shop">
                  <Button variant="outline" size="lg" className="w-full mt-3">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default CartPage`;
  }

  createCheckoutPage(content, projectData) {
    return `'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { CreditCard, Lock, Truck } from 'lucide-react'

function CheckoutPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  const orderItems = [
    { id: '1', name: 'Sample Product 1', price: 99.99, quantity: 2 },
    { id: '2', name: 'Sample Product 2', price: 149.99, quantity: 1 }
  ];

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { num: 1, label: 'Shipping' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Review' }
              ].map((stepItem, index) => (
                <div key={stepItem.num} className="flex items-center">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium \${
                    step >= stepItem.num 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }\`}>
                    {stepItem.num}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{stepItem.label}</span>
                  {index < 2 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Truck className="w-6 h-6 mr-2" />
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button onClick={() => setStep(2)} size="lg">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <CreditCard className="w-6 h-6 mr-2" />
                    Payment Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="nameOnCard"
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} size="lg">
                      Review Order
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <Lock className="w-4 h-4 mr-2" />
                    Your payment information is secure and encrypted
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>\${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>\${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>\${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>\${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>\${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default CheckoutPage`;
  }

  createAccountPage(content, projectData) {
    return `'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import { User, Package, Heart, Settings, LogOut } from 'lucide-react'

function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={\`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors \${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }\`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {tab.label}
                      </button>
                    );
                  })}
                  
                  <button className="w-full flex items-center px-3 py-2 text-left rounded-lg text-red-600 hover:bg-red-50 mt-4">
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue="John"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order History</h2>
                    
                    <div className="space-y-4">
                      {[1, 2, 3].map(order => (
                        <div key={order} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Order #{order}001</span>
                            <span className="text-sm text-gray-600">Dec {order}, 2024</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">2 items • \$149.98</span>
                            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                              Delivered
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
                    <p className="text-gray-600">Your wishlist is empty. Start adding products you love!</p>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-3" />
                            <span>Email notifications for order updates</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="mr-3" />
                            <span>SMS notifications for shipping</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Marketing emails and promotions</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Change Password</h3>
                        <div className="space-y-4 max-w-md">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <Button>Update Password</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AccountPage`;
  }

  generateEcommerceComponents(projectData, productData) {
    return {
      'components/ecommerce/ProductCard.jsx': this.createProductCard(),
      'components/ecommerce/CategoryFilter.jsx': this.createCategoryFilter(),
      'components/ecommerce/CartButton.jsx': this.createCartButton(),
      'components/ecommerce/PriceDisplay.jsx': this.createPriceDisplay()
    };
  }

  createProductCard() {
    return `'use client'

import Link from 'next/link'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import Button from '@/components/ui/Button'

function ProductCard({ product, viewMode = 'grid' }) {
  const { id, name, description, price, originalPrice, rating, reviews, image, inStock } = product;

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-6">
          <Link href={\`/product/\${id}\`}>
            <img
              src={image}
              alt={name}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer"
            />
          </Link>
          
          <div className="flex-1">
            <Link href={\`/product/\${id}\`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {name}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {description}
            </p>
            
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={\`w-4 h-4 \${
                      i < Math.floor(rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }\`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({reviews} reviews)
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="mb-3">
              <span className="text-xl font-bold text-gray-900">
                \${price}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  \${originalPrice}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" disabled={!inStock}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <button className="p-2 text-gray-400 hover:text-red-500">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={\`/product/\${id}\`}>
        <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={\`/product/\${id}\`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center mt-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={\`w-4 h-4 \${
                  i < Math.floor(rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }\`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              ({reviews})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              \${price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                \${originalPrice}
              </span>
            )}
          </div>
          
          {!inStock && (
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Button size="sm" className="flex-1 mr-2" disabled={!inStock}>
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
          <button className="p-2 text-gray-400 hover:text-red-500">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard`;
  }

  createCategoryFilter() {
    return `'use client'

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={\`block w-full text-left px-3 py-2 rounded-lg transition-colors \${
            selectedCategory === 'all'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50'
          }\`}
        >
          All Products
        </button>
        
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={\`block w-full text-left px-3 py-2 rounded-lg transition-colors \${
              selectedCategory === category.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-50'
            }\`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter`;
  }

  createCartButton() {
    return `'use client'

import { ShoppingCart } from 'lucide-react'

function CartButton({ itemCount = 0, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}

export default CartButton`;
  }

  createPriceDisplay() {
    return `'use client'

function PriceDisplay({ price, originalPrice, className = '' }) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={\`flex items-center space-x-2 \${className}\`}>
      <span className="text-xl font-bold text-gray-900">
        \${price}
      </span>
      
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-500 line-through">
            \${originalPrice}
          </span>
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        </>
      )}
    </div>
  );
}

export default PriceDisplay`;
  }
}

export default EcommercePagesGenerator;