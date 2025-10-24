'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { useContract } from '@/contexts/ContractContext'
import { X, FileText, DollarSign, User, Building } from 'lucide-react'

interface CreatePurchaseOrderModalProps {
  onClose: () => void
}

export function CreatePurchaseOrderModal({ onClose }: CreatePurchaseOrderModalProps) {
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
  const { createPurchaseOrder, loading } = useContract()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    sellerAddress: '',
    sellerLEI: process.env.NEXT_PUBLIC_SELLER_LEI || '549300XOCUZD4EMKGY96',
    sellerVLEIAID: 'EHx9LmN8wRZ6kUpY8QRvSj5sN9oYn3UcEcIdZm9zC',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!wallet || !wallet.isConnected || !wallet.address || !wallet.credentials) {
      setError('Wallet not connected')
      return
    }

    const amountUSD = parseFloat(formData.amount)
    if (isNaN(amountUSD) || amountUSD <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountUSD > (wallet.credentials.spendingLimit || 0)) {
      setError(`Amount exceeds spending limit of $${wallet.credentials.spendingLimit?.toLocaleString()}`)
      return
    }

    try {
      const amountUSDC = Math.floor(amountUSD * 10_000_000) // Convert to USDC (7 decimals)

      await createPurchaseOrder({
        buyer: wallet.credentials.orgLEI, // Use LEI as consistent identifier
        seller: formData.sellerLEI, // Use seller LEI as consistent identifier
        buyerLEI: wallet.credentials.orgLEI,
        sellerLEI: formData.sellerLEI,
        buyerVLEIAID: wallet.credentials.vLEIAID,
        sellerVLEIAID: formData.sellerVLEIAID,
        description: formData.description,
        amount: amountUSDC,
      })

      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create purchase order')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Create Purchase Order</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Buyer Info */}
          <div className="bg-stellar-50 dark:bg-stellar-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Buyer Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Organization</label>
                <p className="text-gray-600 dark:text-gray-400">{wallet.credentials?.orgName}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">LEI</label>
                <p className="text-gray-600 dark:text-gray-400 font-mono">{wallet.credentials?.orgLEI}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Representative</label>
                <p className="text-gray-600 dark:text-gray-400">{wallet.credentials?.personName}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Spending Limit</label>
                <p className="text-gray-600 dark:text-gray-400">
                  ${wallet.credentials?.spendingLimit?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Seller Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Organization</label>
                <p className="text-gray-600 dark:text-gray-400">SupplierCo LLC</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">LEI</label>
                <p className="text-gray-600 dark:text-gray-400 font-mono">{formData.sellerLEI}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Representative</label>
                <p className="text-gray-600 dark:text-gray-400">Jane Smith</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300">Max Contract Value</label>
                <p className="text-gray-600 dark:text-gray-400">$500,000</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the goods or services being procured..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seller Wallet Address (Optional)
              </label>
              <input
                type="text"
                value={formData.sellerAddress}
                onChange={(e) => handleInputChange('sellerAddress', e.target.value)}
                placeholder="GSELLER123456789..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-stellar-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to use default seller address
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="procurement-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="procurement-button"
            >
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
