'use client'

import React from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { useContract } from '@/contexts/ContractContext'
import { PurchaseOrder } from '@/contexts/ContractContext'
import { FileText, Clock, CheckCircle, DollarSign, X } from 'lucide-react'

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[]
  onPayWithX402?: (po: PurchaseOrder) => void
}

export function PurchaseOrderList({ purchaseOrders, onPayWithX402 }: PurchaseOrderListProps) {
  // Try to use the appropriate wallet context
  let wallet: any = null
  
  try {
    const walletContext = useWallet()
    wallet = walletContext.wallet
  } catch (error) {
    // Fallback to passkey wallet context
    try {
      const passkeyContext = usePasskeyWallet()
      wallet = passkeyContext.wallet
    } catch (passkeyError) {
      console.warn('No wallet context available')
    }
  }
  const { acceptPurchaseOrder, fulfillPurchaseOrder, releasePayment, cancelPurchaseOrder, loading } = useContract()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Created':
        return <Clock className="w-4 h-4" />
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'Fulfilled':
        return <CheckCircle className="w-4 h-4" />
      case 'Paid':
        return <DollarSign className="w-4 h-4" />
      case 'Cancelled':
        return <X className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'status-created'
      case 'Accepted':
        return 'status-accepted'
      case 'Fulfilled':
        return 'status-fulfilled'
      case 'Paid':
        return 'status-paid'
      case 'Cancelled':
        return 'status-cancelled'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const formatAmount = (amount: number) => {
    return `$${(amount / 10_000_000).toFixed(2)} USDC`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAction = async (action: () => Promise<void>, poId: number) => {
    try {
      await action()
    } catch (error) {
      console.error(`Failed to perform action on PO ${poId}:`, error)
    }
  }

  if (purchaseOrders.length === 0) {
    return (
      <div className="procurement-card text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No Purchase Orders
        </h3>
        <p className="text-gray-500 dark:text-gray-500">
          {wallet.role === 'buyer' 
            ? 'Create your first purchase order to get started'
            : 'No purchase orders have been sent to you yet'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {purchaseOrders.map((po) => (
        <div key={po.id} className="procurement-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Purchase Order #{po.id}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {po.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(po.status)}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                {po.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <p className="text-lg font-semibold text-stellar-600">
                {formatAmount(po.amount)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(po.createdAt)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {wallet.role === 'buyer' ? 'Seller' : 'Buyer'}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {wallet.role === 'buyer' ? 'SupplierCo LLC' : 'TechCorp Inc.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LEI
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {wallet.role === 'buyer' ? po.sellerLEI : po.buyerLEI}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {wallet.role === 'seller' && po.status === 'Created' && (
              <button
                onClick={() => handleAction(() => acceptPurchaseOrder(po.id), po.id)}
                disabled={loading}
                className="procurement-button text-sm"
              >
                {loading ? 'Processing...' : 'Accept Order'}
              </button>
            )}
            
            {wallet.role === 'seller' && po.status === 'Accepted' && (
              <button
                onClick={() => handleAction(() => fulfillPurchaseOrder(po.id), po.id)}
                disabled={loading}
                className="procurement-button text-sm"
              >
                {loading ? 'Processing...' : 'Mark as Fulfilled'}
              </button>
            )}
            
            {wallet.role === 'buyer' && po.status === 'Fulfilled' && (
              <>
                <button
                  onClick={() => handleAction(() => releasePayment(po.id), po.id)}
                  disabled={loading}
                  className="procurement-button text-sm"
                >
                  {loading ? 'Processing...' : 'Release Payment'}
                </button>
                {onPayWithX402 && (
                  <button
                    onClick={() => onPayWithX402(po)}
                    className="procurement-button text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Pay with X402
                  </button>
                )}
              </>
            )}
            
            {wallet.role === 'buyer' && po.status === 'Created' && (
              <button
                onClick={() => handleAction(() => cancelPurchaseOrder(po.id), po.id)}
                disabled={loading}
                className="procurement-button-secondary text-sm"
              >
                {loading ? 'Processing...' : 'Cancel Order'}
              </button>
            )}
          </div>

          {/* Fulfillment Date */}
          {po.fulfilledAt && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fulfilled
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(po.fulfilledAt)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
