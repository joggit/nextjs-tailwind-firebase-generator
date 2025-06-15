// File: lib/vectorCache.js

/**
 * Simple caching system for vector operations
 */
export class VectorCache {
  constructor() {
    this.cache = new Map()
    this.maxSize = 1000
    this.ttl = 24 * 60 * 60 * 1000 // 24 hours
  }

  set(key, value, customTTL = null) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    const expiry = Date.now() + (customTTL || this.ttl)
    this.cache.set(key, { value, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  has(key) {
    return this.cache.has(key) && Date.now() <= this.cache.get(key).expiry
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}
