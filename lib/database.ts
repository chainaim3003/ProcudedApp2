import { PurchaseOrder, User, Credential, Payment } from '@/types/database'

// In-memory database for development (replace with real database in production)
class Database {
  private purchaseOrders: Map<number, PurchaseOrder> = new Map()
  private users: Map<string, User> = new Map()
  private credentials: Map<string, Credential> = new Map()
  private payments: Map<string, Payment> = new Map()
  private nextPOId: number = 1

  // Purchase Orders
  async createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
    const id = this.nextPOId++
    const now = new Date()
    const purchaseOrder: PurchaseOrder = {
      ...po,
      id,
      createdAt: now,
      updatedAt: now
    }
    this.purchaseOrders.set(id, purchaseOrder)
    return purchaseOrder
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | null> {
    return this.purchaseOrders.get(id) || null
  }

  async getPurchaseOrdersByBuyer(buyerLEI: string): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values())
      .filter(po => po.buyerLEI === buyerLEI)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getPurchaseOrdersBySeller(sellerLEI: string): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values())
      .filter(po => po.sellerLEI === sellerLEI)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async updatePurchaseOrder(id: number, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const existing = this.purchaseOrders.get(id)
    if (!existing) return null

    const updated: PurchaseOrder = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    this.purchaseOrders.set(id, updated)
    return updated
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    return this.purchaseOrders.delete(id)
  }

  // Users
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date()
    const newUser: User = {
      ...user,
      createdAt: now,
      updatedAt: now
    }
    this.users.set(user.address, newUser)
    return newUser
  }

  async getUser(address: string): Promise<User | null> {
    return this.users.get(address) || null
  }

  async updateUser(address: string, updates: Partial<User>): Promise<User | null> {
    const existing = this.users.get(address)
    if (!existing) return null

    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    this.users.set(address, updated)
    return updated
  }

  // Credentials
  async createCredential(credential: Omit<Credential, 'createdAt' | 'updatedAt'>): Promise<Credential> {
    const now = new Date()
    const newCredential: Credential = {
      ...credential,
      createdAt: now,
      updatedAt: now
    }
    this.credentials.set(credential.id, newCredential)
    return newCredential
  }

  async getCredential(id: string): Promise<Credential | null> {
    return this.credentials.get(id) || null
  }

  async getCredentialsByUser(userAddress: string): Promise<Credential[]> {
    return Array.from(this.credentials.values())
      .filter(cred => cred.userAddress === userAddress)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async updateCredential(id: string, updates: Partial<Credential>): Promise<Credential | null> {
    const existing = this.credentials.get(id)
    if (!existing) return null

    const updated: Credential = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    this.credentials.set(id, updated)
    return updated
  }

  // Payments
  async createPayment(payment: Omit<Payment, 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const now = new Date()
    const newPayment: Payment = {
      ...payment,
      createdAt: now,
      updatedAt: now
    }
    this.payments.set(payment.txHash, newPayment)
    return newPayment
  }

  async getPayment(txHash: string): Promise<Payment | null> {
    return this.payments.get(txHash) || null
  }

  async getPaymentsByPurchaseOrder(poId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.purchaseOrderId === poId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async updatePayment(txHash: string, updates: Partial<Payment>): Promise<Payment | null> {
    const existing = this.payments.get(txHash)
    if (!existing) return null

    const updated: Payment = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    this.payments.set(txHash, updated)
    return updated
  }

  // Analytics
  async getStats(): Promise<{
    totalPurchaseOrders: number
    totalUsers: number
    totalPayments: number
    totalVolume: number
  }> {
    const totalPurchaseOrders = this.purchaseOrders.size
    const totalUsers = this.users.size
    const totalPayments = this.payments.size
    const totalVolume = Array.from(this.payments.values())
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      totalPurchaseOrders,
      totalUsers,
      totalPayments,
      totalVolume
    }
  }

  // Persistence (for development - replace with real database)
  async saveToLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    const data = {
      purchaseOrders: Array.from(this.purchaseOrders.entries()),
      users: Array.from(this.users.entries()),
      credentials: Array.from(this.credentials.entries()),
      payments: Array.from(this.payments.entries()),
      nextPOId: this.nextPOId
    }

    localStorage.setItem('stellar_procurement_db', JSON.stringify(data))
  }

  async loadFromLocalStorage(): Promise<void> {
    if (typeof window === 'undefined') return

    const data = localStorage.getItem('stellar_procurement_db')
    if (!data) return

    try {
      const parsed = JSON.parse(data)
      
      this.purchaseOrders = new Map(parsed.purchaseOrders || [])
      this.users = new Map(parsed.users || [])
      this.credentials = new Map(parsed.credentials || [])
      this.payments = new Map(parsed.payments || [])
      this.nextPOId = parsed.nextPOId || 1

      // Convert date strings back to Date objects
      for (const [id, po] of this.purchaseOrders) {
        po.createdAt = new Date(po.createdAt)
        po.updatedAt = new Date(po.updatedAt)
      }

      for (const [address, user] of this.users) {
        user.createdAt = new Date(user.createdAt)
        user.updatedAt = new Date(user.updatedAt)
      }

      for (const [id, cred] of this.credentials) {
        cred.createdAt = new Date(cred.createdAt)
        cred.updatedAt = new Date(cred.updatedAt)
      }

      for (const [txHash, payment] of this.payments) {
        payment.createdAt = new Date(payment.createdAt)
        payment.updatedAt = new Date(payment.updatedAt)
      }
    } catch (error) {
      console.error('Failed to load database from localStorage:', error)
    }
  }
}

// Singleton instance
export const database = new Database()

// Initialize database on client side
if (typeof window !== 'undefined') {
  database.loadFromLocalStorage()
  
  // Auto-save every 30 seconds
  setInterval(() => {
    database.saveToLocalStorage()
  }, 30000)
}
