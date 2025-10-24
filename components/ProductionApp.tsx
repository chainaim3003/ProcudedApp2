'use client'

import React, { useState, useEffect } from 'react'
import { realDataService } from '@/lib/real-data-service'
import { database } from '@/lib/database'
import { PurchaseOrder, User, Credential, Payment } from '@/types/database'
import { BiometricAuthDemo } from './BiometricAuthDemo'
import { BuyerDashboard } from './BuyerDashboard'
import { SellerDashboard } from './SellerDashboard'
import { 
  Wallet, 
  FileText, 
  Shield, 
  CreditCard, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Server,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  X
} from 'lucide-react'

export function ProductionApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'payments' | 'credentials' | 'analytics'>('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Initialize user and load data
  useEffect(() => {
    initializeUser()
    loadAnalytics()
  }, [])

  const initializeUser = async () => {
    setIsLoading(true)
    try {
      // Check if user exists in localStorage or create default user
      const savedUser = localStorage.getItem('current_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        await loadUserData(user.address, user.role)
      } else {
        // Create default user for demo
        const defaultUser = await realDataService.createOrUpdateUser({
          address: 'GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          role: 'buyer',
          lei: '506700GE1G29325QX363',
          organizationName: 'TechCorp Inc.',
          personName: 'John Doe',
          email: 'john.doe@techcorp.com'
        })
        setCurrentUser(defaultUser)
        localStorage.setItem('current_user', JSON.stringify(defaultUser))
        await loadUserData(defaultUser.address, defaultUser.role)
        
        // Create sample purchase orders for demo
        await createSampleData()
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSampleData = async () => {
    try {
      console.log('🎯 Creating sample purchase orders...')
      
      // Create sample purchase orders
      const sampleOrders = [
        {
          description: 'Laptop Computers - Dell XPS 15',
          amount: 2500000000, // $2,500 USDC
          buyerLEI: '506700GE1G29325QX363', // TechCorp
          sellerLEI: '5493000X9NX9F2K5S648', // SupplierCo
          buyerAddress: 'GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          sellerAddress: 'GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          metadata: {
            category: 'IT Equipment',
            priority: 'High',
            tags: ['laptops', 'dell', 'xps'],
            notes: 'Need 10 units for new office setup'
          }
        },
        {
          description: 'Office Furniture - Ergonomic Chairs',
          amount: 1500000000, // $1,500 USDC
          buyerLEI: '506700GE1G29325QX363', // TechCorp
          sellerLEI: '5493000X9NX9F2K5S648', // SupplierCo
          buyerAddress: 'GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          sellerAddress: 'GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          metadata: {
            category: 'Furniture',
            priority: 'Medium',
            tags: ['chairs', 'ergonomic', 'office'],
            notes: '20 ergonomic chairs for employee wellness'
          }
        }
      ]

      for (const orderData of sampleOrders) {
        await realDataService.createPurchaseOrder(orderData)
      }
      
      console.log('✅ Sample purchase orders created')
      
      // Reload data to show the new orders
      await loadUserData('GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'buyer')
    } catch (error) {
      console.error('Failed to create sample data:', error)
    }
  }

  const loadUserData = async (address: string, role: 'buyer' | 'seller') => {
    try {
      console.log(`📋 Loading user data for ${role}:`, address)
      const [orders, creds] = await Promise.all([
        realDataService.getPurchaseOrders(address, role),
        realDataService.getCredentials(address)
      ])
      console.log(`📊 Loaded ${orders.length} purchase orders`)
      setPurchaseOrders(orders)
      setCredentials(creds)
      
      // Load payments for all orders
      const allPayments: Payment[] = []
      for (const order of orders) {
        const orderPayments = await realDataService.getPayments(order.id)
        allPayments.push(...orderPayments)
      }
      setPayments(allPayments)
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      const stats = await realDataService.getAnalytics()
      setAnalytics(stats)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const switchUser = async (role: 'buyer' | 'seller') => {
    setIsLoading(true)
    try {
      const userData = {
        address: role === 'buyer' ? 'GDEMO123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        role,
        lei: role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
        organizationName: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
        personName: role === 'buyer' ? 'John Doe' : 'Jane Smith',
        email: role === 'buyer' ? 'john.doe@techcorp.com' : 'jane.smith@supplierco.com'
      }

      const user = await realDataService.createOrUpdateUser(userData)
      setCurrentUser(user)
      localStorage.setItem('current_user', JSON.stringify(user))
      await loadUserData(user.address, user.role)
    } catch (error) {
      console.error('Failed to switch user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const issueCredentials = async () => {
    if (!currentUser) return
    
    setIsLoading(true)
    try {
      const newCredentials = await realDataService.issueRealCredentials(currentUser.address, currentUser.role)
      setCredentials(prev => [...prev, ...newCredentials])
      console.log('✅ Credentials issued successfully')
    } catch (error) {
      console.error('Failed to issue credentials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSamplePayment = async () => {
    if (!currentUser || purchaseOrders.length === 0) return
    
    setIsLoading(true)
    try {
      // Find a fulfilled order to create a payment for
      const fulfilledOrder = purchaseOrders.find(po => po.status === 'Fulfilled')
      if (fulfilledOrder) {
        const result = await realDataService.processRealPayment(
          fulfilledOrder.id,
          fulfilledOrder.amount,
          currentUser.address,
          'GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        )
        
        if (result.success) {
          console.log('✅ Sample payment created successfully')
          await loadUserData(currentUser.address, currentUser.role)
          await loadAnalytics()
        }
      } else {
        console.log('No fulfilled orders found to create payment for')
      }
    } catch (error) {
      console.error('Failed to create sample payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPurchaseOrder = async (data: {
    description: string
    amount: number
    sellerLEI: string
    sellerAddress: string
  }) => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      const po = await realDataService.createPurchaseOrder({
        ...data,
        buyerLEI: currentUser.lei,
        buyerAddress: currentUser.address
      })
      setPurchaseOrders(prev => [po, ...prev])
      setShowCreateModal(false)
      await loadAnalytics()
    } catch (error) {
      console.error('Failed to create purchase order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (id: number, status: PurchaseOrder['status']) => {
    setIsLoading(true)
    try {
      const updated = await realDataService.updatePurchaseOrderStatus(id, status)
      if (updated) {
        setPurchaseOrders(prev => prev.map(po => po.id === id ? updated : po))
        await loadAnalytics()
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processPayment = async (poId: number, amount: number) => {
    if (!currentUser) return

    setIsLoading(true)
    try {
      const result = await realDataService.processRealPayment(
        poId,
        amount,
        currentUser.address,
        'GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      )

      if (result.success) {
        console.log('✅ Payment processed successfully:', result.txHash)
        // Reload all data including payments
        await loadUserData(currentUser.address, currentUser.role)
        await loadAnalytics()
      } else {
        console.error('❌ Payment failed:', result.error)
      }
    } catch (error) {
      console.error('Failed to process payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const viewOrderDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const editOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  const updateOrder = async (orderId: number, updates: Partial<PurchaseOrder>) => {
    setIsLoading(true)
    try {
      const updated = await realDataService.updatePurchaseOrder(orderId, updates)
      if (updated) {
        setPurchaseOrders(prev => prev.map(po => po.id === orderId ? updated : po))
        setShowEditModal(false)
        setSelectedOrder(null)
        await loadAnalytics()
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return

    setIsLoading(true)
    try {
      const success = await realDataService.deletePurchaseOrder(orderId)
      if (success) {
        setPurchaseOrders(prev => prev.filter(po => po.id !== orderId))
        setShowOrderDetails(false)
        setSelectedOrder(null)
        await loadAnalytics()
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = po.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.id.toString().includes(searchTerm)
    const matchesFilter = filterStatus === 'all' || po.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created': return 'bg-blue-100 text-blue-800'
      case 'Accepted': return 'bg-yellow-100 text-yellow-800'
      case 'Fulfilled': return 'bg-green-100 text-green-800'
      case 'Paid': return 'bg-purple-100 text-purple-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initializing application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Wallet className="w-8 h-8 text-stellar-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Stellar Procurement Platform
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>•</span>
                <span>Smart Wallets</span>
                <span>•</span>
                <span>vLEI Verification</span>
                <span>•</span>
                <span>X402 Payments</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-stellar-100 rounded-full flex items-center justify-center">
                  <span className="text-stellar-600 font-semibold text-sm">
                    {currentUser?.personName?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.personName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.organizationName}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => switchUser('buyer')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    currentUser?.role === 'buyer'
                      ? 'bg-stellar-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => switchUser('seller')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    currentUser?.role === 'seller'
                      ? 'bg-stellar-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'orders', label: 'Purchase Orders', icon: FileText },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'credentials', label: 'Credentials', icon: Shield },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-stellar-500 text-stellar-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Debug Panel */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mx-4 mb-4">
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🐛 Debug Info</h3>
        <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <div>Current User: {currentUser ? `${currentUser.personName} (${currentUser.role})` : 'None'}</div>
          <div>Purchase Orders: {purchaseOrders.length}</div>
          <div>Credentials: {credentials.length}</div>
          <div>Payments: {payments.length}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            {currentUser?.role === 'buyer' ? (
              <BuyerDashboard 
                currentUser={currentUser}
                analytics={analytics}
                purchaseOrders={purchaseOrders}
                credentials={credentials}
                onIssueCredentials={issueCredentials}
                onCreateOrder={() => setShowCreateModal(true)}
                onCreateSampleData={createSampleData}
                isLoading={isLoading}
              />
            ) : (
              <SellerDashboard 
                currentUser={currentUser}
                analytics={analytics}
                purchaseOrders={purchaseOrders}
                credentials={credentials}
                onIssueCredentials={issueCredentials}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            purchaseOrders={filteredOrders}
            currentUser={currentUser}
            onUpdateStatus={updateOrderStatus}
            onProcessPayment={processPayment}
            onCreateOrder={() => setShowCreateModal(true)}
            onViewDetails={viewOrderDetails}
            onEditOrder={editOrder}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab 
            payments={payments} 
            onCreateSamplePayment={createSamplePayment}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'credentials' && (
          <CredentialsTab 
            credentials={credentials}
            onIssueCredentials={issueCredentials}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab analytics={analytics} />
        )}
      </main>

      {/* Create Order Modal - Only for Buyers */}
      {showCreateModal && currentUser && currentUser.role === 'buyer' && (
        <CreateOrderModal
          currentUser={currentUser}
          onCreateOrder={createPurchaseOrder}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          currentUser={currentUser}
          onClose={() => {
            setShowOrderDetails(false)
            setSelectedOrder(null)
          }}
          onEdit={() => {
            setShowOrderDetails(false)
            setShowEditModal(true)
          }}
          onDelete={() => deleteOrder(selectedOrder.id)}
          onUpdateStatus={updateOrderStatus}
          onProcessPayment={processPayment}
          isLoading={isLoading}
        />
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onUpdateOrder={updateOrder}
          onClose={() => {
            setShowEditModal(false)
            setSelectedOrder(null)
          }}
        />
      )}
    </div>
  )
}


// Orders Tab Component
function OrdersTab({ 
  purchaseOrders, 
  currentUser, 
  onUpdateStatus, 
  onProcessPayment, 
  onCreateOrder,
  onViewDetails,
  onEditOrder,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  isLoading 
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Purchase Orders
        </h2>
        {currentUser?.role === 'buyer' && (
          <button
            onClick={onCreateOrder}
            className="bg-stellar-600 text-white px-4 py-2 rounded-lg hover:bg-stellar-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        >
          <option value="all">All Status</option>
          <option value="Created">Created</option>
          <option value="Accepted">Accepted</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {purchaseOrders.map((po: PurchaseOrder) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        PO #{po.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {po.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${formatAmount(po.amount)} USDC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDetails(po)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        View
                      </button>
                      {po.status === 'Created' && (
                        <button
                          onClick={() => onEditOrder(po)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Order"
                        >
                          Edit
                        </button>
                      )}
                      {currentUser?.role === 'seller' && po.status === 'Created' && (
                        <button
                          onClick={() => onUpdateStatus(po.id, 'Accepted')}
                          disabled={isLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Accept
                        </button>
                      )}
                      {currentUser?.role === 'seller' && po.status === 'Accepted' && (
                        <button
                          onClick={() => onUpdateStatus(po.id, 'Fulfilled')}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          Fulfill
                        </button>
                      )}
                      {currentUser?.role === 'buyer' && po.status === 'Fulfilled' && (
                        <button
                          onClick={() => onProcessPayment(po.id, po.amount)}
                          disabled={isLoading}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Payments Tab Component
function PaymentsTab({ payments, onCreateSamplePayment, isLoading }: { 
  payments: Payment[]
  onCreateSamplePayment?: () => void
  isLoading?: boolean
}) {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)

  const toggleExpanded = (txHash: string) => {
    setExpandedPayment(expandedPayment === txHash ? null : txHash)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payments
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} found
          </div>
          {onCreateSamplePayment && (
            <button
              onClick={onCreateSamplePayment}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Create Sample Payment</span>
            </button>
          )}
        </div>
      </div>
      
      {payments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Payments Yet
          </h3>
          <p className="text-gray-500">
            Payments will appear here once you process payments for fulfilled orders.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => {
                  const isExpanded = expandedPayment === payment.txHash
                  return (
                    <React.Fragment key={payment.txHash}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.txHash.slice(0, 8)}...{payment.txHash.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${formatAmount(payment.amount)} USDC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleExpanded(payment.txHash)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {isExpanded ? 'Hide' : 'View'} Details
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Payment Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Transaction Information
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Transaction Hash:</span>
                                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                                        {payment.txHash}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Network:</span>
                                      <span className="text-gray-900 dark:text-white">{payment.network}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Token:</span>
                                      <span className="text-gray-900 dark:text-white">{payment.token}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        ${formatAmount(payment.amount)} USDC
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Parties
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">From:</span>
                                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                                        {payment.fromAddress}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">To:</span>
                                      <span className="text-gray-900 dark:text-white font-mono text-xs">
                                        {payment.toAddress}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">PO ID:</span>
                                      <span className="text-gray-900 dark:text-white">#{payment.purchaseOrderId}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {payment.metadata && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Additional Information
                                  </h5>
                                  <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                                    <div className="space-y-1 text-sm">
                                      {Object.entries(payment.metadata).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {key}:
                                          </span>
                                          <span className="text-gray-900 dark:text-white">
                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Credentials Tab Component
function CredentialsTab({ credentials, onIssueCredentials, isLoading }: any) {
  const [expandedCredential, setExpandedCredential] = useState<string | null>(null)

  const toggleExpanded = (type: string) => {
    setExpandedCredential(expandedCredential === type ? null : type)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          vLEI Credentials
        </h2>
        <button
          onClick={onIssueCredentials}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Shield className="w-4 h-4" />
          <span>Issue Credentials</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['QVI', 'OOR', 'ECR'].map((type) => {
          const credential = credentials.find((c: Credential) => c.type === type)
          const isExpanded = expandedCredential === type
          
          return (
            <div key={type} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {type} Credential
                </h3>
                <div className="flex items-center space-x-2">
                  {credential?.isValid ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                  {credential && (
                    <button
                      onClick={() => toggleExpanded(type)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}
                </div>
              </div>
              
              {credential ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <strong>Issued:</strong> {new Date(credential.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Status:</strong> {credential.isValid ? 'Valid' : 'Invalid'}
                  </p>
                  {credential.expiresAt && (
                    <p className="text-sm text-gray-500">
                      <strong>Expires:</strong> {new Date(credential.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {isExpanded && credential.credentialData && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Credential Data:
                      </h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(credential.credentialData).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              {key}:
                            </span>
                            <span className="text-gray-900 dark:text-white font-mono text-xs">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No credential issued</p>
              )}
            </div>
          )
        })}
      </div>

      {/* All Credentials Summary */}
      {credentials.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            All Credentials Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {credentials.map((cred: Credential) => (
                  <tr key={cred.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cred.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cred.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cred.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cred.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cred.expiresAt ? new Date(cred.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleExpanded(cred.type)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedCredential === cred.type ? 'Hide' : 'View'} Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Analytics Tab Component
function AnalyticsTab({ analytics }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalPurchaseOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formatAmount(analytics?.totalVolume || 0)} USDC
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalPayments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Create Order Modal Component
function CreateOrderModal({ currentUser, onCreateOrder, onClose }: any) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    sellerLEI: '',
    sellerAddress: '',
    category: '',
    priority: 'Medium',
    tags: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    onCreateOrder({
      description: formData.description,
      amount: parseFloat(formData.amount) * 1000000, // Convert to micro units
      sellerLEI: formData.sellerLEI,
      sellerAddress: formData.sellerAddress,
      metadata: {
        category: formData.category,
        priority: formData.priority,
        tags: tags,
        notes: formData.notes
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Create Purchase Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seller LEI
            </label>
            <input
              type="text"
              value={formData.sellerLEI}
              onChange={(e) => setFormData(prev => ({ ...prev, sellerLEI: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="549300XOCUZD4EMKGY96"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seller Address
            </label>
            <input
              type="text"
              value={formData.sellerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, sellerAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="GSELLER123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="Electronics, Services, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="urgent, electronics, q4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="Additional notes or requirements..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-stellar-600 text-white rounded-lg hover:bg-stellar-700"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ 
  order, 
  currentUser, 
  onClose, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  onProcessPayment, 
  isLoading 
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Order Details - PO #{order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Order Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                  <p className="text-gray-900 dark:text-white">{order.description}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span>
                  <p className="text-gray-900 dark:text-white">${formatAmount(order.amount)} USDC</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                  <p className="text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Updated:</span>
                  <p className="text-gray-900 dark:text-white">{new Date(order.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Parties
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Buyer LEI:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{order.buyerLEI}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Buyer Address:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{order.buyerAddress}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Seller LEI:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{order.sellerLEI}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Seller Address:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{order.sellerAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {order.metadata && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Additional Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {order.metadata.category && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{order.metadata.category}</span>
                  </div>
                )}
                {order.metadata.priority && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{order.metadata.priority}</span>
                  </div>
                )}
                {order.metadata.tags && order.metadata.tags.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.metadata.tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {order.metadata.notes && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{order.metadata.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              {order.status === 'Created' && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Edit Order
                </button>
              )}
              {order.status === 'Created' && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Order
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              {currentUser?.role === 'seller' && order.status === 'Created' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'Accepted')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Accept Order
                </button>
              )}
              {currentUser?.role === 'seller' && order.status === 'Accepted' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'Fulfilled')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark as Fulfilled
                </button>
              )}
              {currentUser?.role === 'buyer' && order.status === 'Fulfilled' && (
                <button
                  onClick={() => onProcessPayment(order.id, order.amount)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Process Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Order Modal Component
function EditOrderModal({ order, onUpdateOrder, onClose }: any) {
  const [formData, setFormData] = useState({
    description: order.description,
    amount: (order.amount / 1000000).toString(),
    sellerLEI: order.sellerLEI,
    sellerAddress: order.sellerAddress,
    category: order.metadata?.category || '',
    priority: order.metadata?.priority || 'Medium',
    tags: order.metadata?.tags?.join(', ') || '',
    notes: order.metadata?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    onUpdateOrder(order.id, {
      description: formData.description,
      amount: parseFloat(formData.amount) * 1000000,
      sellerLEI: formData.sellerLEI,
      sellerAddress: formData.sellerAddress,
      metadata: {
        category: formData.category,
        priority: formData.priority,
        tags: tags,
        notes: formData.notes
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Edit Order - PO #{order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seller LEI
            </label>
            <input
              type="text"
              value={formData.sellerLEI}
              onChange={(e) => setFormData(prev => ({ ...prev, sellerLEI: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seller Address
            </label>
            <input
              type="text"
              value={formData.sellerAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, sellerAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="urgent, electronics, q4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-stellar-600 text-white rounded-lg hover:bg-stellar-700"
            >
              Update Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper functions
function formatAmount(amount: number): string {
  return (amount / 1000000).toFixed(2)
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Created': return 'bg-blue-100 text-blue-800'
    case 'Accepted': return 'bg-yellow-100 text-yellow-800'
    case 'Fulfilled': return 'bg-green-100 text-green-800'
    case 'Paid': return 'bg-purple-100 text-purple-800'
    case 'Cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
