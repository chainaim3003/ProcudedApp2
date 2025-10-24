'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { Wallet, Copy, CheckCircle, AlertCircle } from 'lucide-react'

export function WalletCard() {
  // Try to use the appropriate wallet context
  let wallet: any = null
  let disconnectWallet: (() => void) | null = null
  
  try {
    const walletContext = useWallet()
    wallet = walletContext.wallet
    disconnectWallet = walletContext.disconnectWallet
  } catch (error) {
    // Fallback to passkey wallet context
    try {
      const passkeyContext = usePasskeyWallet()
      wallet = passkeyContext.wallet
      disconnectWallet = passkeyContext.disconnectWallet
    } catch (passkeyError) {
      console.warn('No wallet context available')
    }
  }
  const [copied, setCopied] = useState(false)

  if (!wallet || !wallet.isConnected) {
    return null
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  return (
    <div className="procurement-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Smart Wallet</span>
        </h2>
        {disconnectWallet && (
          <button
            onClick={disconnectWallet}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Disconnect
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Wallet Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Wallet Address
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
              {formatAddress(wallet.address!)}
            </code>
            <button
              onClick={() => copyToClipboard(wallet.address!)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Contract ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Smart Contract ID
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono">
              {formatAddress(wallet.contractId!)}
            </code>
            <button
              onClick={() => copyToClipboard(wallet.contractId!)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              wallet.role === 'buyer' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {wallet.role === 'buyer' ? 'Buyer' : 'Seller'}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {wallet.role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC'}
            </span>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 dark:text-green-400">
            Connected with Passkey
          </span>
        </div>

        {/* Error Display */}
        {wallet.error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600 dark:text-red-400">
              {wallet.error}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
