export interface PurchaseOrder {
  id: number
  description: string
  amount: number // in micro USDC units
  buyerLEI: string
  sellerLEI: string
  buyerAddress: string
  sellerAddress: string
  status: 'Created' | 'Accepted' | 'Fulfilled' | 'Paid' | 'Cancelled'
  createdAt: Date
  updatedAt: Date
  metadata?: {
    category?: string
    priority?: 'Low' | 'Medium' | 'High'
    tags?: string[]
    notes?: string
  }
}

export interface User {
  address: string
  role: 'buyer' | 'seller'
  lei: string
  organizationName: string
  personName: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  preferences?: {
    notifications: boolean
    autoAccept: boolean
    defaultCurrency: string
  }
}

export interface Credential {
  id: string
  userAddress: string
  type: 'QVI' | 'OOR' | 'ECR'
  credentialData: any
  isValid: boolean
  issuedAt: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: {
    issuer: string
    subject: string
    purpose: string
  }
}

export interface Payment {
  txHash: string
  purchaseOrderId: number
  amount: number // in micro USDC units
  fromAddress: string
  toAddress: string
  status: 'Pending' | 'Confirmed' | 'Failed'
  network: 'stellar'
  token: 'USDC'
  createdAt: Date
  updatedAt: Date
  metadata?: {
    gasUsed?: number
    blockNumber?: number
    confirmations?: number
  }
}

export interface Analytics {
  totalPurchaseOrders: number
  totalUsers: number
  totalPayments: number
  totalVolume: number
  averageOrderValue: number
  topBuyers: Array<{
    lei: string
    organizationName: string
    totalOrders: number
    totalVolume: number
  }>
  topSellers: Array<{
    lei: string
    organizationName: string
    totalOrders: number
    totalVolume: number
  }>
  recentActivity: Array<{
    type: 'order_created' | 'order_accepted' | 'order_fulfilled' | 'payment_completed'
    timestamp: Date
    description: string
    amount?: number
  }>
}
