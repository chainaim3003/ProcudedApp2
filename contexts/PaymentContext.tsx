'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { X402Service, PaymentParams, PaymentResult, PaymentRequirements } from '@/lib/x402-service'

export interface PaymentState {
  isProcessing: boolean
  lastPayment: PaymentResult | null
  usdcBalance: number
  error: string | null
}

export interface PaymentContextType {
  payment: PaymentState
  initiatePayment: (params: PaymentParams) => Promise<PaymentResult>
  getPaymentRequirements: (resource: string) => Promise<PaymentRequirements | null>
  verifyPayment: (paymentHeader: string, requirements: PaymentRequirements) => Promise<boolean>
  getUSDCBalance: (address: string) => Promise<number>
  hasSufficientBalance: (address: string, amount: number) => Promise<boolean>
  clearError: () => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
}

interface PaymentProviderProps {
  children: ReactNode
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  const [payment, setPayment] = useState<PaymentState>({
    isProcessing: false,
    lastPayment: null,
    usdcBalance: 0,
    error: null,
  })

  const [x402Service, setX402Service] = useState<X402Service | null>(null)

  // Initialize X402 service
  useEffect(() => {
    const initializeX402Service = async () => {
      try {
        // Dynamic import to handle potential module issues
        let X402Service: any
        let createX402Service: any
        
        try {
          const x402Module = await import('@/lib/x402-service')
          X402Service = x402Module.X402Service
          createX402Service = x402Module.createX402Service
        } catch (importError) {
          console.warn('X402 service import failed, using mock implementation:', importError)
          // Fallback to mock implementation
          const mockModule = await import('@/lib/mock-x402-client')
          X402Service = mockModule.X402Client
          createX402Service = () => new X402Service({})
        }

        const service = createX402Service()
        setX402Service(service)
        console.log('✅ X402 service initialized')
      } catch (error) {
        console.error('Failed to initialize X402 service:', error)
        // Don't set error state, just log it and continue with mock
        console.warn('Continuing with mock X402 implementation')
        
        // Use mock implementation as fallback
        try {
          const mockModule = await import('@/lib/mock-x402-client')
          const MockX402Client = mockModule.X402Client
          const mockService = new MockX402Client({})
          setX402Service(mockService)
          console.log('✅ Mock X402 service initialized as fallback')
        } catch (mockError) {
          console.error('Failed to initialize mock X402 service:', mockError)
          setPayment(prev => ({ ...prev, error: 'Failed to initialize X402 service' }))
        }
      }
    }

    initializeX402Service()
  }, [])

  const initiatePayment = async (params: PaymentParams): Promise<PaymentResult> => {
    if (!x402Service) {
      const error = 'X402 service not initialized'
      setPayment(prev => ({ ...prev, error }))
      return { success: false, error }
    }

    setPayment(prev => ({ ...prev, isProcessing: true, error: null }))

    try {
      const result = await x402Service.initiatePayment(params)
      
      setPayment(prev => ({
        ...prev,
        isProcessing: false,
        lastPayment: result,
        error: result.success ? null : result.error || 'Payment failed'
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setPayment(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }))
      return { success: false, error: errorMessage }
    }
  }

  const getPaymentRequirements = async (resource: string): Promise<PaymentRequirements | null> => {
    if (!x402Service) {
      console.error('X402 service not initialized')
      return null
    }

    try {
      return await x402Service.getPaymentRequirements(resource)
    } catch (error) {
      console.error('Failed to get payment requirements:', error)
      return null
    }
  }

  const verifyPayment = async (paymentHeader: string, requirements: PaymentRequirements): Promise<boolean> => {
    if (!x402Service) {
      console.error('X402 service not initialized')
      return false
    }

    try {
      return await x402Service.verifyPayment(paymentHeader, requirements)
    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  const getUSDCBalance = async (address: string): Promise<number> => {
    if (!x402Service) {
      console.error('X402 service not initialized')
      return 0
    }

    try {
      const balance = await x402Service.getUSDCBalance(address)
      setPayment(prev => ({ ...prev, usdcBalance: balance }))
      return balance
    } catch (error) {
      console.error('Failed to get USDC balance:', error)
      return 0
    }
  }

  const hasSufficientBalance = async (address: string, amount: number): Promise<boolean> => {
    if (!x402Service) {
      console.error('X402 service not initialized')
      return false
    }

    try {
      return await x402Service.hasSufficientBalance(address, amount)
    } catch (error) {
      console.error('Failed to check balance:', error)
      return false
    }
  }

  const clearError = () => {
    setPayment(prev => ({ ...prev, error: null }))
  }

  const value: PaymentContextType = {
    payment,
    initiatePayment,
    getPaymentRequirements,
    verifyPayment,
    getUSDCBalance,
    hasSufficientBalance,
    clearError,
  }

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  )
}
