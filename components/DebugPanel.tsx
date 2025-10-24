'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { useContract } from '@/contexts/ContractContext'
import { Bug, Eye, EyeOff } from 'lucide-react'

export function DebugPanel() {
  // Try to use the appropriate wallet context
  let wallet: any = null
  let purchaseOrders: any[] = []
  
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
  
  try {
    const contractContext = useContract()
    purchaseOrders = contractContext.purchaseOrders
  } catch (error) {
    console.warn('No contract context available')
  }
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Show Debug Panel"
      >
        <Bug className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">🐛 Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Wallet State */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Wallet State</h4>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono">
            <div>Connected: {wallet.isConnected ? '✅' : '❌'}</div>
            <div>Role: {wallet.role || 'None'}</div>
            <div>Address: {wallet.address ? `${wallet.address.slice(0, 8)}...` : 'None'}</div>
            <div>LEI: {wallet.credentials?.orgLEI || 'None'}</div>
          </div>
        </div>

        {/* Purchase Orders */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Orders</h4>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono">
            <div>Total: {purchaseOrders.length}</div>
            {purchaseOrders.map(po => (
              <div key={po.id} className="mt-1">
                <div>PO #{po.id}: {po.status}</div>
                <div className="text-gray-500">Buyer: {po.buyerLEI}</div>
                <div className="text-gray-500">Seller: {po.sellerLEI}</div>
              </div>
            ))}
          </div>
        </div>

        {/* localStorage */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">localStorage</h4>
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono">
            <div>POs: {localStorage.getItem('purchaseOrders') ? '✅' : '❌'}</div>
            <div>Wallet: {localStorage.getItem('walletState') ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => {
              console.log('🔍 Current wallet state:', wallet)
              console.log('🔍 Current purchase orders:', purchaseOrders)
              console.log('🔍 localStorage data:', {
                purchaseOrders: localStorage.getItem('purchaseOrders'),
                walletState: localStorage.getItem('walletState')
              })
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Log to Console
          </button>
          <button
            onClick={() => {
              // Create a test PO directly in localStorage
              const testPO = {
                id: Date.now(),
                buyer: "506700GE1G29325QX363",
                seller: "549300XOCUZD4EMKGY96",
                buyerLEI: "506700GE1G29325QX363",
                sellerLEI: "549300XOCUZD4EMKGY96",
                buyerVLEIAID: "ELbfbbLMcKinMyOrQMDm8kDBaxfqHRhruA1ZF7EZS4hF",
                sellerVLEIAID: "EHx9LmN8wRZ6kUpY8QRvSj5sN9oYn3UcEcIdZm9zC",
                description: "Test PO from Debug Panel",
                amount: 1000000000,
                status: "Created",
                createdAt: Date.now()
              }
              
              const existing = JSON.parse(localStorage.getItem('purchaseOrders') || '[]')
              localStorage.setItem('purchaseOrders', JSON.stringify([...existing, testPO]))
              window.location.reload()
            }}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
          >
            Create Test PO
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
          >
            Clear & Reload
          </button>
        </div>
      </div>
    </div>
  )
}
