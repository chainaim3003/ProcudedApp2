'use client'

import React, { useState } from 'react'
import { useVLEI } from '@/contexts/VLEIContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { usePayment } from '@/contexts/PaymentContext'
import { useContract } from '@/contexts/ContractContext'
import { WalletCard } from './WalletCard'
import { PurchaseOrderList } from './PurchaseOrderList'
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal'
import { CredentialVerification } from './CredentialVerification'
import { PaymentModal } from './PaymentModal'
import { DebugPanel } from './DebugPanel'
import { 
  Wallet, 
  FileText, 
  Shield, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Server,
  CreditCard,
  DollarSign
} from 'lucide-react'

export function Phase3App() {
  const { vlei, initializeVLEI, issueCredentials } = useVLEI()
  const { wallet, connectWallet, switchRole } = usePasskeyWallet()
  const { payment, getUSDCBalance } = usePayment()
  const { purchaseOrders } = useContract()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPO, setSelectedPO] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const handleRoleSwitch = (role: 'buyer' | 'seller') => {
    if (wallet.isConnected) {
      switchRole(role)
    } else {
      connectWallet(role)
    }
  }

  const handleInitializeVLEI = async () => {
    setIsInitializing(true)
    try {
      if (!vlei.isInitialized) {
        await initializeVLEI()
      }
      await issueCredentials()
    } catch (error) {
      console.error('Failed to initialize vLEI:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful:', txHash)
    // Update purchase order status to 'Paid'
    // This would typically involve calling a smart contract method
    setShowPaymentModal(false)
    setSelectedPO(null)
  }

  const handlePayWithX402 = (po: any) => {
    setSelectedPO(po)
    setShowPaymentModal(true)
  }

  const filteredPurchaseOrders = purchaseOrders.filter(po => {
    if (!wallet.isConnected || !wallet.role) return false
    
    // Filter by role using LEI
    if (wallet.role === 'buyer') {
      return po.buyerLEI === '506700GE1G29325QX363'
    } else {
      return po.sellerLEI === '549300XOCUZD4EMKGY96'
    }
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
          <div className="flex items-center space-x-2 text-stellar-600">
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">X402 Payments</span>
          </div>
        </div>
        <div className="mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
            Phase 3: X402 Payments
          </span>
        </div>
      </div>

      {/* vLEI Status */}
      <div className="procurement-card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>vLEI Infrastructure Status</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            {vlei.isInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm">
              KERIA Agents: {vlei.isInitialized ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {vlei.techcorpAID ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="text-sm">
              TechCorp AID: {vlei.techcorpAID ? 'Created' : 'Pending'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {vlei.suppliercoAID ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className="text-sm">
              SupplierCo AID: {vlei.suppliercoAID ? 'Created' : 'Pending'}
            </span>
          </div>
        </div>

        {!vlei.isInitialized && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleInitializeVLEI}
              disabled={isInitializing}
              className="procurement-button flex items-center space-x-2"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Server className="w-4 h-4" />
              )}
              <span>
                {isInitializing ? 'Initializing...' : 'Initialize vLEI Infrastructure'}
              </span>
            </button>
          </div>
        )}

        {vlei.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {vlei.error}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* X402 Payment Status */}
      <div className="procurement-card">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>X402 Payment Status</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm">
              USDC Balance: ${(payment.usdcBalance / 1000000).toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {payment.isProcessing ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : payment.lastPayment?.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm">
              Payment Status: {payment.isProcessing ? 'Processing' : payment.lastPayment?.success ? 'Ready' : 'Idle'}
            </span>
          </div>
        </div>

        {payment.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {payment.error}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Role Selection */}
      {!wallet.isConnected && (
        <div className="procurement-card text-center">
          <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select your role to connect your passkey-secured smart wallet with vLEI credentials and X402 payments
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => connectWallet('buyer')}
              disabled={!vlei.isInitialized}
              className="procurement-button flex items-center space-x-2 disabled:opacity-50"
            >
              <Users className="w-5 h-5" />
              <span>Connect as Buyer (TechCorp)</span>
            </button>
            <button
              onClick={() => connectWallet('seller')}
              disabled={!vlei.isInitialized}
              className="procurement-button flex items-center space-x-2 disabled:opacity-50"
            >
              <Users className="w-5 h-5" />
              <span>Connect as Seller (SupplierCo)</span>
            </button>
          </div>
          {!vlei.isInitialized && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              Please initialize vLEI infrastructure first
            </p>
          )}
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

            <PurchaseOrderList 
              purchaseOrders={filteredPurchaseOrders} 
              onPayWithX402={handlePayWithX402}
            />
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

      {showPaymentModal && selectedPO && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedPO(null)
          }}
          purchaseOrder={selectedPO}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  )
}
