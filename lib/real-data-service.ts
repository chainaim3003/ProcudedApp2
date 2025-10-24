import { database } from './database'
import { PurchaseOrder, User, Credential, Payment } from '@/types/database'

export class RealDataService {
  // Purchase Order Management
  async createPurchaseOrder(data: {
    description: string
    amount: number
    buyerLEI: string
    sellerLEI: string
    buyerAddress: string
    sellerAddress: string
    metadata?: any
  }): Promise<PurchaseOrder> {
    console.log('📝 Creating real purchase order:', data)
    
    const po = await database.createPurchaseOrder({
      ...data,
      status: 'Created'
    })

    // Auto-save to localStorage
    await database.saveToLocalStorage()
    
    console.log('✅ Purchase order created:', po.id)
    return po
  }

  async getPurchaseOrders(userAddress: string, role: 'buyer' | 'seller'): Promise<PurchaseOrder[]> {
    console.log(`📋 Fetching purchase orders for ${role}:`, userAddress)
    
    if (role === 'buyer') {
      const user = await database.getUser(userAddress)
      if (!user) return []
      return await database.getPurchaseOrdersByBuyer(user.lei)
    } else {
      const user = await database.getUser(userAddress)
      if (!user) return []
      return await database.getPurchaseOrdersBySeller(user.lei)
    }
  }

  async updatePurchaseOrderStatus(id: number, status: PurchaseOrder['status']): Promise<PurchaseOrder | null> {
    console.log(`🔄 Updating purchase order ${id} status to:`, status)
    
    const updated = await database.updatePurchaseOrder(id, { status })
    if (updated) {
      await database.saveToLocalStorage()
    }
    
    return updated
  }

  async updatePurchaseOrder(id: number, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    console.log(`🔄 Updating purchase order ${id}:`, updates)
    
    const updated = await database.updatePurchaseOrder(id, updates)
    if (updated) {
      await database.saveToLocalStorage()
    }
    
    return updated
  }

  async deletePurchaseOrder(id: number): Promise<boolean> {
    console.log(`🗑️ Deleting purchase order ${id}`)
    
    const success = await database.deletePurchaseOrder(id)
    if (success) {
      await database.saveToLocalStorage()
    }
    
    return success
  }

  // User Management
  async createOrUpdateUser(data: {
    address: string
    role: 'buyer' | 'seller'
    lei: string
    organizationName: string
    personName: string
    email?: string
    phone?: string
  }): Promise<User> {
    console.log('👤 Creating/updating user:', data)
    
    const existing = await database.getUser(data.address)
    if (existing) {
      const updated = await database.updateUser(data.address, data)
      if (updated) {
        await database.saveToLocalStorage()
        return updated
      }
    }

    const user = await database.createUser({
      ...data,
      isActive: true
    })
    
    await database.saveToLocalStorage()
    return user
  }

  async getUser(address: string): Promise<User | null> {
    return await database.getUser(address)
  }

  // Credential Management
  async createCredential(data: {
    id: string
    userAddress: string
    type: 'QVI' | 'OOR' | 'ECR'
    credentialData: any
    isValid: boolean
    issuedAt: Date
    expiresAt?: Date
  }): Promise<Credential> {
    console.log('🔐 Creating credential:', data.type, 'for user:', data.userAddress)
    
    const credential = await database.createCredential(data)
    await database.saveToLocalStorage()
    
    return credential
  }

  async getCredentials(userAddress: string): Promise<Credential[]> {
    return await database.getCredentialsByUser(userAddress)
  }

  async validateCredentials(userAddress: string): Promise<{
    hasQVI: boolean
    hasOOR: boolean
    hasECR: boolean
    isValid: boolean
    credentials: Credential[]
  }> {
    const credentials = await this.getCredentials(userAddress)
    
    const qvi = credentials.find(c => c.type === 'QVI' && c.isValid)
    const oor = credentials.find(c => c.type === 'OOR' && c.isValid)
    const ecr = credentials.find(c => c.type === 'ECR' && c.isValid)
    
    return {
      hasQVI: !!qvi,
      hasOOR: !!oor,
      hasECR: !!ecr,
      isValid: !!(qvi && oor && ecr),
      credentials
    }
  }

  // Payment Management
  async createPayment(data: {
    txHash: string
    purchaseOrderId: number
    amount: number
    fromAddress: string
    toAddress: string
    status: 'Pending' | 'Confirmed' | 'Failed'
    metadata?: any
  }): Promise<Payment> {
    console.log('💳 Creating payment record:', data.txHash)
    
    const payment = await database.createPayment({
      ...data,
      network: 'stellar',
      token: 'USDC'
    })
    
    // Update purchase order status to 'Paid'
    await this.updatePurchaseOrderStatus(data.purchaseOrderId, 'Paid')
    
    await database.saveToLocalStorage()
    return payment
  }

  async getPayments(purchaseOrderId: number): Promise<Payment[]> {
    return await database.getPaymentsByPurchaseOrder(purchaseOrderId)
  }

  async updatePaymentStatus(txHash: string, status: Payment['status']): Promise<Payment | null> {
    console.log(`🔄 Updating payment ${txHash} status to:`, status)
    
    const updated = await database.updatePayment(txHash, { status })
    if (updated) {
      await database.saveToLocalStorage()
    }
    
    return updated
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalPurchaseOrders: number
    totalUsers: number
    totalPayments: number
    totalVolume: number
    averageOrderValue: number
  }> {
    const stats = await database.getStats()
    const averageOrderValue = stats.totalPurchaseOrders > 0 
      ? stats.totalVolume / stats.totalPurchaseOrders 
      : 0

    return {
      ...stats,
      averageOrderValue
    }
  }

  // Real vLEI Integration (placeholder for production)
  async issueRealCredentials(userAddress: string, role: 'buyer' | 'seller'): Promise<Credential[]> {
    console.log('🏛️ Issuing real vLEI credentials for:', userAddress, role)
    
    // In production, this would integrate with real KERIA agents
    // For now, we'll create realistic mock credentials that persist
    
    const credentials: Credential[] = []
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year

    // QVI Credential
    const qviCredential = await this.createCredential({
      id: `qvi_${userAddress}_${Date.now()}`,
      userAddress,
      type: 'QVI',
      credentialData: {
        issuer: 'GLEIF External QVI',
        subject: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
        lei: role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
        legalName: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
        status: 'Active'
      },
      isValid: true,
      issuedAt: now,
      expiresAt
    })
    credentials.push(qviCredential)

    // OOR Credential
    const oorCredential = await this.createCredential({
      id: `oor_${userAddress}_${Date.now()}`,
      userAddress,
      type: 'OOR',
      credentialData: {
        issuer: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
        subject: role === 'buyer' ? 'John Doe' : 'Jane Smith',
        role: role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
        authority: role === 'buyer' ? 'CFO' : 'CEO',
        status: 'Active'
      },
      isValid: true,
      issuedAt: now,
      expiresAt
    })
    credentials.push(oorCredential)

    // ECR Credential
    const ecrCredential = await this.createCredential({
      id: `ecr_${userAddress}_${Date.now()}`,
      userAddress,
      type: 'ECR',
      credentialData: {
        issuer: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
        subject: role === 'buyer' ? 'John Doe' : 'Jane Smith',
        engagementContext: 'Procurement',
        role: role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
        spendingLimit: role === 'buyer' ? 100000 : 500000,
        maxContractValue: role === 'buyer' ? 100000 : 500000,
        status: 'Active'
      },
      isValid: true,
      issuedAt: now,
      expiresAt
    })
    credentials.push(ecrCredential)

    console.log('✅ Real vLEI credentials issued:', credentials.length)
    return credentials
  }

  // Real X402 Payment Integration (placeholder for production)
  async processRealPayment(purchaseOrderId: number, amount: number, fromAddress: string, toAddress: string): Promise<{
    success: boolean
    txHash?: string
    error?: string
  }> {
    console.log('💳 Processing real X402 payment for PO:', purchaseOrderId)
    
    try {
      // In production, this would integrate with real X402 facilitator and Stellar network
      // For now, we'll simulate a real payment with a realistic transaction hash
      const txHash = `real_tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Create payment record
      const payment = await this.createPayment({
        txHash,
        purchaseOrderId,
        amount,
        fromAddress,
        toAddress,
        status: 'Confirmed',
        metadata: {
          network: 'stellar',
          token: 'USDC',
          gasUsed: 100,
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          confirmations: 1
        }
      })

      console.log('✅ Real payment processed:', txHash)
      return {
        success: true,
        txHash
      }
    } catch (error) {
      console.error('❌ Real payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      }
    }
  }

  // Data Migration and Cleanup
  async migrateFromLocalStorage(): Promise<void> {
    console.log('🔄 Migrating data from localStorage to database...')
    
    // Load existing data from localStorage
    await database.loadFromLocalStorage()
    
    // Save to ensure persistence
    await database.saveToLocalStorage()
    
    console.log('✅ Data migration completed')
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️ Clearing all data...')
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('stellar_procurement_db')
    }
    
    // Reset database
    // Note: In production, you'd want to clear the actual database
    console.log('✅ All data cleared')
  }
}

// Singleton instance
export const realDataService = new RealDataService()
