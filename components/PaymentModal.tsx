'use client'

import React, { useState, useEffect } from 'react'
import { usePayment } from '@/contexts/PaymentContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { X, CreditCard, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { PaymentParams, PaymentRequirements } from '@/lib/x402-service'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrder: {
    id: number
    amount: number
    description: string
    seller: string
    sellerLEI: string
  }
  onPaymentSuccess: (txHash: string) => void
}

export function PaymentModal({ isOpen, onClose, purchaseOrder, onPaymentSuccess }: PaymentModalProps) {
  const { payment, initiatePayment, getPaymentRequirements, getUSDCBalance, hasSufficientBalance } = usePayment()
  const { wallet } = usePasskeyWallet()
  
  const [requirements, setRequirements] = useState<PaymentRequirements | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'requirements' | 'payment' | 'success' | 'error'>('requirements')

  useEffect(() => {
    if (isOpen && wallet?.address) {
      loadPaymentRequirements()
      loadBalance()
    }
  }, [isOpen, wallet?.address])

  const loadPaymentRequirements = async () => {
    setIsLoading(true)
    try {
      const req = await getPaymentRequirements(`/api/procurement/${purchaseOrder.id}/payment`)
      setRequirements(req)
      setStep(req ? 'payment' : 'error')
    } catch (error) {
      console.error('Failed to load payment requirements:', error)
      setStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBalance = async () => {
    if (wallet?.address) {
      const usdcBalance = await getUSDCBalance(wallet.address)
      setBalance(usdcBalance)
    }
  }

  const handlePayment = async () => {
    if (!wallet || !requirements) return

    setIsLoading(true)
    try {
      const paymentParams: PaymentParams = {
        resource: `/api/procurement/${purchaseOrder.id}/payment`,
        amount: requirements.amount,
        recipient: requirements.recipient,
        token: requirements.token,
        network: requirements.network,
        payer: wallet,
        metadata: {
          purchaseOrderId: purchaseOrder.id,
          description: purchaseOrder.description,
          sellerLEI: purchaseOrder.sellerLEI
        }
      }

      const result = await initiatePayment(paymentParams)
      
      if (result.success && result.txHash) {
        setStep('success')
        onPaymentSuccess(result.txHash)
      } else {
        setStep('error')
      }
    } catch (error) {
      console.error('Payment failed:', error)
      setStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return (amount / 1000000).toFixed(2) // Convert from micro units
  }

  const formatBalance = (balance: number) => {
    return (balance / 1000000).toFixed(2) // Convert from micro units
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>X402 Payment</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Purchase Order Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Purchase Order #{purchaseOrder.id}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {purchaseOrder.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Amount:</span>
              <span className="text-lg font-bold text-green-600">
                ${formatAmount(purchaseOrder.amount)} USDC
              </span>
            </div>
          </div>

          {/* Wallet Balance */}
          {wallet?.address && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Your USDC Balance:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${formatBalance(balance)} USDC
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
              </div>
            </div>
          )}

          {/* Payment Requirements */}
          {requirements && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Payment Requirements</span>
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Token:</span>
                  <span className="font-mono">{requirements.token}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-mono">{requirements.network}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-mono text-xs">
                    {requirements.recipient.slice(0, 8)}...{requirements.recipient.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="text-xs">
                    {new Date(requirements.validUntil).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {payment.error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 dark:text-red-400">
                {payment.error}
              </span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Processing payment...</span>
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Payment completed successfully!
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            
            {step === 'payment' && requirements && (
              <button
                onClick={handlePayment}
                disabled={isLoading || balance < requirements.amount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>
                  {balance < requirements.amount ? 'Insufficient Balance' : 'Pay with X402'}
                </span>
              </button>
            )}

            {step === 'success' && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>

          {/* Insufficient Balance Warning */}
          {requirements && balance < requirements.amount && (
            <div className="text-center text-sm text-red-600 dark:text-red-400">
              You need at least ${formatAmount(requirements.amount)} USDC to complete this payment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
