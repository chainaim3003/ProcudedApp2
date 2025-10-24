'use client'

import React from 'react'
import { 
  FileText, 
  DollarSign, 
  CreditCard, 
  Users, 
  Shield, 
  Plus,
  ShoppingBag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Fingerprint,
  Database
} from 'lucide-react'
import { BiometricAuthDemo } from './BiometricAuthDemo'
import { PurchaseOrder, User, Credential, Payment } from '@/types/database'

interface BuyerDashboardProps {
  currentUser: User | null
  analytics: any
  purchaseOrders: PurchaseOrder[]
  credentials: Credential[]
  onIssueCredentials: () => void
  onCreateOrder: () => void
  onCreateSampleData?: () => void
  isLoading: boolean
}

export function BuyerDashboard({ 
  currentUser, 
  analytics, 
  purchaseOrders, 
  credentials, 
  onIssueCredentials, 
  onCreateOrder, 
  onCreateSampleData,
  isLoading 
}: BuyerDashboardProps) {
  const credentialStatus = credentials.reduce((acc: any, cred: Credential) => {
    acc[cred.type] = cred.isValid
    return acc
  }, {})

  const buyerOrders = purchaseOrders.filter(po => po.buyerLEI === currentUser?.orgLEI)
  const pendingOrders = buyerOrders.filter(po => po.status === 'Pending')
  const acceptedOrders = buyerOrders.filter(po => po.status === 'Accepted')
  const fulfilledOrders = buyerOrders.filter(po => po.status === 'Fulfilled')
  const paidOrders = buyerOrders.filter(po => po.status === 'Paid')

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount / 1000000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'Accepted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'Fulfilled': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'Paid': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🛒 Buyer Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.personName} - {currentUser?.orgName}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onIssueCredentials}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Issue Credentials</span>
          </button>
          <button
            onClick={onCreateOrder}
            className="bg-stellar-600 text-white px-4 py-2 rounded-lg hover:bg-stellar-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
          {onCreateSampleData && (
            <button
              onClick={onCreateSampleData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Create Sample Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Buyer-Specific Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {buyerOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formatAmount(buyerOrders.reduce((sum, po) => sum + po.amount, 0))} USDC
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingOrders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {paidOrders.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Order Status Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{acceptedOrders.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{fulfilledOrders.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fulfilled</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{paidOrders.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
          </div>
        </div>
      </div>

      {/* Biometric Authentication Demo */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔐 Buyer Biometric Authentication
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Secure your purchase orders with biometric authentication:
        </p>
        <BiometricAuthDemo 
          role="buyer" 
          onAuthSuccess={(walletInfo) => {
            console.log('Buyer authentication successful:', walletInfo)
          }}
        />
      </div>

      {/* vLEI Credential Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🛡️ vLEI Credential Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { type: 'QVI', label: 'Legal Entity Verification', description: 'Organization verification' },
            { type: 'OOR', label: 'Official Organizational Role', description: 'CFO role authorization' },
            { type: 'ECR', label: 'Engagement Context Role', description: 'Procurement authority' }
          ].map(({ type, label, description }) => (
            <div key={type} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{type}</h4>
                {credentialStatus[type] ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Recent Purchase Orders
        </h3>
        <div className="space-y-3">
          {buyerOrders.slice(0, 5).map((po: PurchaseOrder) => (
            <div key={po.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">PO #{po.id}</p>
                <p className="text-sm text-gray-500">{po.description}</p>
                <p className="text-xs text-gray-400">To: {po.sellerLEI}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  ${formatAmount(po.amount)} USDC
                </p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(po.status)}`}>
                  {po.status}
                </span>
              </div>
            </div>
          ))}
          {buyerOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No purchase orders yet</p>
              <button
                onClick={onCreateOrder}
                className="mt-2 bg-stellar-600 text-white px-4 py-2 rounded-lg hover:bg-stellar-700"
              >
                Create Your First Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateOrder}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-stellar-500 hover:bg-stellar-50 dark:hover:bg-stellar-900/20 transition-colors"
          >
            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Create New Order</p>
            <p className="text-sm text-gray-500">Start a new purchase order</p>
          </button>
          <button
            onClick={onIssueCredentials}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Issue Credentials</p>
            <p className="text-sm text-gray-500">Update vLEI credentials</p>
          </button>
          <button
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Fingerprint className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Biometric Setup</p>
            <p className="text-sm text-gray-500">Configure passkey authentication</p>
          </button>
        </div>
      </div>
    </div>
  )
}
