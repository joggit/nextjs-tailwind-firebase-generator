// Firebase Ecommerce Service
// File: lib/ecommerce/FirebaseEcommerceService.js

import { initializeFirebase } from '@/lib/firebase'
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export class FirebaseEcommerceService {
  constructor() {
    this.initialized = false
    this.db = null
    this.auth = null
    this.collections = {
      products: 'products',
      categories: 'categories',
      orders: 'orders',
      customers: 'customers',
      inventory: 'inventory',
      coupons: 'coupons',
      reviews: 'reviews'
    }
  }

  async initialize() {
    if (this.initialized) return true

    try {
      const app = initializeFirebase()
      this.db = getFirestore(app)
      this.auth = getAuth(app)
      this.initialized = true
      console.log('✅ Firebase Ecommerce Service initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Ecommerce Service:', error)
      throw error
    }
  }

  // ==================== PRODUCTS ====================

  async createProduct(productData) {
    await this.initialize()
    
    const product = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
      totalSales: 0,
      views: 0
    }

    const docRef = await addDoc(collection(this.db, this.collections.products), product)
    console.log(`✅ Product created: ${docRef.id}`)
    return docRef.id
  }

  async getProducts(options = {}) {
    await this.initialize()
    
    const {
      categoryId,
      active = true,
      limit: queryLimit = 50,
      orderByField = 'createdAt',
      orderDirection = 'desc'
    } = options

    let q = collection(this.db, this.collections.products)
    const constraints = []

    if (active !== null) {
      constraints.push(where('active', '==', active))
    }
    
    if (categoryId) {
      constraints.push(where('categoryId', '==', categoryId))
    }

    constraints.push(orderBy(orderByField, orderDirection))
    constraints.push(limit(queryLimit))

    if (constraints.length > 0) {
      q = query(q, ...constraints)
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  async getProductById(productId) {
    await this.initialize()
    
    const docRef = doc(this.db, this.collections.products, productId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Update view count
      await updateDoc(docRef, {
        views: (docSnap.data().views || 0) + 1,
        updatedAt: serverTimestamp()
      })
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      }
    }
    
    return null
  }

  async updateProduct(productId, updates) {
    await this.initialize()
    
    const docRef = doc(this.db, this.collections.products, productId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    
    console.log(`✅ Product updated: ${productId}`)
  }

  async searchProducts(searchTerm) {
    await this.initialize()
    
    // Firebase doesn't have full-text search, so we'll do a simple name search
    // For production, consider using Algolia or Elasticsearch
    const q = query(
      collection(this.db, this.collections.products),
      where('active', '==', true),
      orderBy('name'),
      limit(20)
    )
    
    const snapshot = await getDocs(q)
    const allProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Client-side filtering for now
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // ==================== CATEGORIES ====================

  async createCategory(categoryData) {
    await this.initialize()
    
    const category = {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
      productCount: 0
    }

    const docRef = await addDoc(collection(this.db, this.collections.categories), category)
    console.log(`✅ Category created: ${docRef.id}`)
    return docRef.id
  }

  async getCategories() {
    await this.initialize()
    
    const q = query(
      collection(this.db, this.collections.categories),
      where('active', '==', true),
      orderBy('name')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  // ==================== ORDERS ====================

  async createOrder(orderData) {
    await this.initialize()
    
    const order = {
      ...orderData,
      orderNumber: this.generateOrderNumber(),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentStatus: 'pending'
    }

    const batch = writeBatch(this.db)
    
    // Create order
    const orderRef = doc(collection(this.db, this.collections.orders))
    batch.set(orderRef, order)
    
    // Update product sales counts
    for (const item of orderData.items) {
      const productRef = doc(this.db, this.collections.products, item.productId)
      batch.update(productRef, {
        totalSales: (item.totalSales || 0) + item.quantity,
        updatedAt: serverTimestamp()
      })
    }
    
    await batch.commit()
    
    console.log(`✅ Order created: ${orderRef.id}`)
    return {
      id: orderRef.id,
      orderNumber: order.orderNumber
    }
  }

  async getOrdersByCustomer(customerId) {
    await this.initialize()
    
    const q = query(
      collection(this.db, this.collections.orders),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  async updateOrderStatus(orderId, status, paymentStatus = null) {
    await this.initialize()
    
    const updates = {
      status,
      updatedAt: serverTimestamp()
    }
    
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus
    }
    
    const docRef = doc(this.db, this.collections.orders, orderId)
    await updateDoc(docRef, updates)
    
    console.log(`✅ Order ${orderId} status updated to: ${status}`)
  }

  // ==================== INVENTORY ====================

  async updateInventory(productId, quantityChange) {
    await this.initialize()
    
    const productRef = doc(this.db, this.collections.products, productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      const currentStock = productSnap.data().stockQuantity || 0
      const newStock = Math.max(0, currentStock + quantityChange)
      
      await updateDoc(productRef, {
        stockQuantity: newStock,
        inStock: newStock > 0,
        updatedAt: serverTimestamp()
      })
      
      console.log(`✅ Inventory updated for ${productId}: ${currentStock} → ${newStock}`)
      return newStock
    }
    
    throw new Error(`Product ${productId} not found`)
  }

  async checkStock(productId, requestedQuantity) {
    await this.initialize()
    
    const productRef = doc(this.db, this.collections.products, productId)
    const productSnap = await getDoc(productRef)
    
    if (productSnap.exists()) {
      const stockQuantity = productSnap.data().stockQuantity || 0
      return {
        available: stockQuantity >= requestedQuantity,
        currentStock: stockQuantity,
        requestedQuantity
      }
    }
    
    return {
      available: false,
      currentStock: 0,
      requestedQuantity
    }
  }

  // ==================== REVIEWS ====================

  async addReview(productId, customerId, reviewData) {
    await this.initialize()
    
    const review = {
      productId,
      customerId,
      ...reviewData,
      createdAt: serverTimestamp(),
      approved: false // Reviews need approval
    }

    const docRef = await addDoc(collection(this.db, this.collections.reviews), review)
    console.log(`✅ Review added: ${docRef.id}`)
    return docRef.id
  }

  async getProductReviews(productId, approved = true) {
    await this.initialize()
    
    const q = query(
      collection(this.db, this.collections.reviews),
      where('productId', '==', productId),
      where('approved', '==', approved),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }

  // ==================== CUSTOMERS ====================

  async createCustomer(customerData) {
    await this.initialize()
    
    const customer = {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalOrders: 0,
      totalSpent: 0
    }

    const docRef = await addDoc(collection(this.db, this.collections.customers), customer)
    console.log(`✅ Customer created: ${docRef.id}`)
    return docRef.id
  }

  async getCustomerByEmail(email) {
    await this.initialize()
    
    const q = query(
      collection(this.db, this.collections.customers),
      where('email', '==', email),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      }
    }
    
    return null
  }

  // ==================== UTILITIES ====================

  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  // Real-time listeners
  subscribeToProducts(callback, categoryId = null) {
    let q = collection(this.db, this.collections.products)
    const constraints = [where('active', '==', true)]
    
    if (categoryId) {
      constraints.push(where('categoryId', '==', categoryId))
    }
    
    q = query(q, ...constraints, orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(products)
    })
  }

  subscribeToOrders(customerId, callback) {
    const q = query(
      collection(this.db, this.collections.orders),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(orders)
    })
  }
}

export default FirebaseEcommerceService