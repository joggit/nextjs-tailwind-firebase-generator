// localStorage-based Cart System
// File: lib/ecommerce/LocalStorageCart.js

const CART_STORAGE_KEY = 'ecommerce_cart'
const CART_EXPIRY_KEY = 'ecommerce_cart_expiry'
const CART_EXPIRY_HOURS = 24 // Cart expires after 24 hours

class LocalStorageCart {
  constructor() {
    this.listeners = new Set()
    this.init()
  }

  init() {
    // Check if cart has expired
    this.checkCartExpiry()
    
    // Listen for storage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === CART_STORAGE_KEY) {
          this.notifyListeners()
        }
      })
    }
  }

  checkCartExpiry() {
    if (typeof window === 'undefined') return

    const expiryTime = localStorage.getItem(CART_EXPIRY_KEY)
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      this.clearCart()
      console.log('🕒 Cart expired and cleared')
    }
  }

  setCartExpiry() {
    if (typeof window === 'undefined') return
    
    const expiryTime = Date.now() + (CART_EXPIRY_HOURS * 60 * 60 * 1000)
    localStorage.setItem(CART_EXPIRY_KEY, expiryTime.toString())
  }

  getCart() {
    if (typeof window === 'undefined') return { items: [], metadata: {} }

    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY)
      if (!cartData) {
        return { items: [], metadata: {} }
      }

      const parsed = JSON.parse(cartData)
      return {
        items: parsed.items || [],
        metadata: parsed.metadata || {}
      }
    } catch (error) {
      console.error('Error parsing cart data:', error)
      this.clearCart()
      return { items: [], metadata: {} }
    }
  }

  saveCart(cartData) {
    if (typeof window === 'undefined') return

    try {
      const dataToSave = {
        items: cartData.items || [],
        metadata: {
          ...cartData.metadata,
          lastUpdated: new Date().toISOString(),
          version: '1.0'
        }
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(dataToSave))
      this.setCartExpiry()
      this.notifyListeners()
    } catch (error) {
      console.error('Error saving cart:', error)
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        alert('Cart storage is full. Please clear some items.')
      }
    }
  }

  addItem(product, quantity = 1, options = {}) {
    const cart = this.getCart()
    const itemId = this.generateItemId(product, options)
    
    const existingItemIndex = cart.items.findIndex(item => item.id === itemId)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity
      cart.items[existingItemIndex].lastUpdated = new Date().toISOString()
    } else {
      // Add new item
      const newItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        quantity: quantity,
        options: options, // For variants like size, color, etc.
        addedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
      cart.items.push(newItem)
    }

    this.saveCart(cart)
    
    console.log(`✅ Added ${quantity}x ${product.name} to cart`)
    return this.getCart()
  }

  removeItem(itemId) {
    const cart = this.getCart()
    const itemIndex = cart.items.findIndex(item => item.id === itemId)
    
    if (itemIndex >= 0) {
      const removedItem = cart.items[itemIndex]
      cart.items.splice(itemIndex, 1)
      this.saveCart(cart)
      
      console.log(`✅ Removed ${removedItem.name} from cart`)
      return removedItem
    }
    
    return null
  }

  updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(itemId)
    }

    const cart = this.getCart()
    const itemIndex = cart.items.findIndex(item => item.id === itemId)
    
    if (itemIndex >= 0) {
      const oldQuantity = cart.items[itemIndex].quantity
      cart.items[itemIndex].quantity = quantity
      cart.items[itemIndex].lastUpdated = new Date().toISOString()
      this.saveCart(cart)
      
      console.log(`✅ Updated ${cart.items[itemIndex].name} quantity: ${oldQuantity} → ${quantity}`)
      return cart.items[itemIndex]
    }
    
    return null
  }

  updateItemOptions(itemId, options) {
    const cart = this.getCart()
    const itemIndex = cart.items.findIndex(item => item.id === itemId)
    
    if (itemIndex >= 0) {
      cart.items[itemIndex].options = { ...cart.items[itemIndex].options, ...options }
      cart.items[itemIndex].lastUpdated = new Date().toISOString()
      this.saveCart(cart)
      
      console.log(`✅ Updated ${cart.items[itemIndex].name} options`)
      return cart.items[itemIndex]
    }
    
    return null
  }

  clearCart() {
    if (typeof window === 'undefined') return

    localStorage.removeItem(CART_STORAGE_KEY)
    localStorage.removeItem(CART_EXPIRY_KEY)
    this.notifyListeners()
    
    console.log('🗑️ Cart cleared')
  }

  getItemCount() {
    const cart = this.getCart()
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  getUniqueItemCount() {
    const cart = this.getCart()
    return cart.items.length
  }

  getSubtotal() {
    const cart = this.getCart()
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  getTax(taxRate = 0.08) {
    return this.getSubtotal() * taxRate
  }

  getShipping(freeShippingThreshold = 50, standardRate = 9.99) {
    const subtotal = this.getSubtotal()
    return subtotal >= freeShippingThreshold ? 0 : standardRate
  }

  getTotal(options = {}) {
    const {
      taxRate = 0.08,
      freeShippingThreshold = 50,
      standardShippingRate = 9.99,
      couponDiscount = 0
    } = options

    const subtotal = this.getSubtotal()
    const tax = this.getTax(taxRate)
    const shipping = this.getShipping(freeShippingThreshold, standardShippingRate)
    
    return Math.max(0, subtotal + tax + shipping - couponDiscount)
  }

  getCartSummary(options = {}) {
    const subtotal = this.getSubtotal()
    const tax = this.getTax(options.taxRate)
    const shipping = this.getShipping(options.freeShippingThreshold, options.standardShippingRate)
    const total = this.getTotal(options)

    return {
      itemCount: this.getItemCount(),
      uniqueItemCount: this.getUniqueItemCount(),
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      savings: options.couponDiscount || 0
    }
  }

  // Check if item already exists in cart
  hasItem(productId, options = {}) {
    const cart = this.getCart()
    const itemId = this.generateItemId({ id: productId }, options)
    return cart.items.some(item => item.id === itemId)
  }

  // Get specific item from cart
  getItem(itemId) {
    const cart = this.getCart()
    return cart.items.find(item => item.id === itemId) || null
  }

  // Apply coupon code
  applyCoupon(couponCode) {
    const cart = this.getCart()
    cart.metadata.coupon = {
      code: couponCode,
      appliedAt: new Date().toISOString()
    }
    this.saveCart(cart)
    
    console.log(`✅ Applied coupon: ${couponCode}`)
  }

  // Remove coupon
  removeCoupon() {
    const cart = this.getCart()
    delete cart.metadata.coupon
    this.saveCart(cart)
    
    console.log('🗑️ Removed coupon')
  }

  // Merge carts (useful for login scenarios)
  mergeCart(serverCart) {
    const localCart = this.getCart()
    const mergedItems = [...localCart.items]

    // Add server items that don't exist locally
    serverCart.items.forEach(serverItem => {
      const existingIndex = mergedItems.findIndex(item => item.id === serverItem.id)
      if (existingIndex >= 0) {
        // Take the item with the latest update
        if (new Date(serverItem.lastUpdated) > new Date(mergedItems[existingIndex].lastUpdated)) {
          mergedItems[existingIndex] = serverItem
        }
      } else {
        mergedItems.push(serverItem)
      }
    })

    const mergedCart = {
      items: mergedItems,
      metadata: {
        ...localCart.metadata,
        ...serverCart.metadata,
        merged: true,
        mergedAt: new Date().toISOString()
      }
    }

    this.saveCart(mergedCart)
    console.log('🔄 Carts merged successfully')
    return mergedCart
  }

  // Generate unique item ID based on product and options
  generateItemId(product, options = {}) {
    const optionsString = Object.keys(options).length > 0 
      ? '_' + btoa(JSON.stringify(options)).replace(/=/g, '')
      : ''
    return `${product.id}${optionsString}`
  }

  // Event system for cart updates
  subscribe(callback) {
    this.listeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  notifyListeners() {
    const cart = this.getCart()
    this.listeners.forEach(callback => {
      try {
        callback(cart)
      } catch (error) {
        console.error('Error in cart listener:', error)
      }
    })
  }

  // Export cart data
  exportCart() {
    const cart = this.getCart()
    return {
      ...cart,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  // Import cart data
  importCart(cartData) {
    if (!cartData.items || !Array.isArray(cartData.items)) {
      throw new Error('Invalid cart data format')
    }

    this.saveCart(cartData)
    console.log('✅ Cart imported successfully')
  }

  // Get cart age
  getCartAge() {
    const cart = this.getCart()
    if (!cart.metadata.lastUpdated) return null

    const lastUpdate = new Date(cart.metadata.lastUpdated)
    const now = new Date()
    const ageInHours = (now - lastUpdate) / (1000 * 60 * 60)
    
    return {
      hours: ageInHours,
      days: ageInHours / 24,
      lastUpdated: cart.metadata.lastUpdated
    }
  }

  // Cleanup old cart data
  cleanup() {
    const age = this.getCartAge()
    if (age && age.hours > CART_EXPIRY_HOURS) {
      this.clearCart()
      return true
    }
    return false
  }
}

// Create singleton instance
const cartInstance = new LocalStorageCart()

// React hook for using the cart
export const useCart = () => {
  const [cart, setCart] = useState(() => cartInstance.getCart())
  const [summary, setSummary] = useState(() => cartInstance.getCartSummary())

  useEffect(() => {
    const unsubscribe = cartInstance.subscribe((updatedCart) => {
      setCart(updatedCart)
      setSummary(cartInstance.getCartSummary())
    })

    return unsubscribe
  }, [])

  return {
    cart,
    summary,
    addItem: (product, quantity, options) => cartInstance.addItem(product, quantity, options),
    removeItem: (itemId) => cartInstance.removeItem(itemId),
    updateQuantity: (itemId, quantity) => cartInstance