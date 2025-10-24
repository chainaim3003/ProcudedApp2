'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useContract } from '@/contexts/ContractContext'
import { WalletCard } from './WalletCard'
import { PurchaseOrderList } from './PurchaseOrderList'
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal'
import { CredentialVerification } from './CredentialVerification'
import { DebugPanel } from './DebugPanel'
import { Wallet, FileText, Shield, Users } from 'lucide-react'

export function ProcurementApp() {
  const { wallet, connectWallet, switchRole } = useWallet()
  const { purchaseOrders } = useContract()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  const handleRoleSwitch = (role: 'buyer' | 'seller') => {
    if (wallet.isConnected) {
      switchRole(role)
    } else {
      connectWallet(role)
    }
  }

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    if (!wallet.isConnected || !wallet.role) return false
    
    // Filter by role instead of wallet address to maintain consistency across role switches
    if (wallet.role === 'buyer') {
      // Show POs where the buyer LEI matches the current user's LEI
      const matches = po.buyerLEI === wallet.credentials?.orgLEI
      console.log(`🔍 Filtering PO ${po.id} for buyer:`, {
        poBuyerLEI: po.buyerLEI,
        currentLEI: wallet.credentials?.orgLEI,
        matches
      })
      return matches
    } else {
      // Show POs where the seller LEI matches the current user's LEI
      const matches = po.sellerLEI === wallet.credentials?.orgLEI
      console.log(`🔍 Filtering PO ${po.id} for seller:`, {
        poSellerLEI: po.sellerLEI,
        currentLEI: wallet.credentials?.orgLEI,
        matches
      })
      return matches
    }
  })

  console.log('📊 Filtered purchase orders:', {
    total: purchaseOrders.length,
    filtered: filteredPurchaseOrders.length,
    role: wallet.role,
    currentLEI: wallet.credentials?.orgLEI
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-2 text-stellar-600">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">Smart Wallets</span>
          </div>
          <div className="flex items-center space-x-2 text-stellar-600">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Purchase Orders</span>
          </div>
          <div className="flex items-center space-x-2 text-stellar-600">
            <Shield className="w-5 h-5" />
            <span className="font-medium">vLEI Verification</span>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      {!wallet.isConnected && (
        <div className="procurement-card text-center">
          <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select your role to connect your smart wallet and start using the procurement dApp
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => connectWallet('buyer')}
              className="procurement-button flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Connect as Buyer (TechCorp)</span>
            </button>
            <button
              onClick={() => connectWallet('seller')}
              className="procurement-button flex items-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Connect as Seller (SupplierCo)</span>
            </button>
          </div>
        </div>
      )}

      {/* Connected State */}
      {wallet.isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & Credentials */}
          <div className="space-y-6">
            <WalletCard />
            <CredentialVerification />
          </div>

          {/* Right Column - Purchase Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Order Actions */}
            <div className="procurement-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Purchase Orders</h2>
                <div className="flex space-x-2">
                  {wallet.role === 'buyer' && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="procurement-button"
                    >
                      Create Purchase Order
                    </button>
                  )}
                  <button
                    onClick={() => setShowVerification(true)}
                    className="procurement-button-secondary"
                  >
                    Verify Credentials
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredPurchaseOrders.length} purchase order(s) found
              </div>
            </div>

            <PurchaseOrderList purchaseOrders={filteredPurchaseOrders} />
          </div>
        </div>
      )}

      {/* Role Switcher */}
      {wallet.isConnected && (
        <div className="procurement-card text-center">
          <h3 className="text-lg font-semibold mb-4">Switch Role</h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleRoleSwitch('buyer')}
              className={`procurement-button-secondary ${
                wallet.role === 'buyer' ? 'bg-stellar-100 dark:bg-stellar-900' : ''
              }`}
            >
              Switch to Buyer (TechCorp)
            </button>
            <button
              onClick={() => handleRoleSwitch('seller')}
              className={`procurement-button-secondary ${
                wallet.role === 'seller' ? 'bg-stellar-100 dark:bg-stellar-900' : ''
              }`}
            >
              Switch to Seller (SupplierCo)
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePurchaseOrderModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showVerification && (
        <CredentialVerification
          onClose={() => setShowVerification(false)}
        />
      )}

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  )
}
