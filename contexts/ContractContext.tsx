'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface PurchaseOrder {
  id: number
  buyer: string
  seller: string
  buyerLEI: string
  sellerLEI: string
  buyerVLEIAID: string
  sellerVLEIAID: string
  description: string
  amount: number
  status: 'Created' | 'Accepted' | 'Fulfilled' | 'Paid' | 'Disputed' | 'Cancelled'
  createdAt: number
  fulfilledAt?: number
}

interface ContractContextType {
  purchaseOrders: PurchaseOrder[]
  createPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>) => Promise<number>
  acceptPurchaseOrder: (id: number) => Promise<void>
  fulfillPurchaseOrder: (id: number) => Promise<void>
  releasePayment: (id: number) => Promise<void>
  cancelPurchaseOrder: (id: number) => Promise<void>
  loading: boolean
  error: string | null
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
}

interface ContractProviderProps {
  children: ReactNode
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextId, setNextId] = useState(1)

  // Load purchase orders from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('purchaseOrders')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        console.log('📋 Loading purchase orders from localStorage:', parsed)
        setPurchaseOrders(parsed)
        setNextId(Math.max(...parsed.map((po: PurchaseOrder) => po.id), 0) + 1)
      } catch (error) {
        console.error('Failed to load purchase orders:', error)
      }
    } else {
      console.log('📋 No saved purchase orders found in localStorage')
    }
  }, [])

  // Save purchase orders to localStorage whenever they change
  useEffect(() => {
    console.log('💾 Saving purchase orders to localStorage:', purchaseOrders)
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders))
  }, [purchaseOrders])

  const createPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'status' | 'createdAt'>): Promise<number> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newOrder: PurchaseOrder = {
        ...order,
        id: nextId,
        status: 'Created',
        createdAt: Date.now(),
      }

      console.log('🆕 Creating new purchase order:', newOrder)
      setPurchaseOrders(prev => {
        const updated = [...prev, newOrder]
        console.log('📋 Updated purchase orders list:', updated)
        return updated
      })
      setNextId(prev => prev + 1)

      return newOrder.id
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create purchase order'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const acceptPurchaseOrder = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === id ? { ...po, status: 'Accepted' as const } : po
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept purchase order'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fulfillPurchaseOrder = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === id
            ? { ...po, status: 'Fulfilled' as const, fulfilledAt: Date.now() }
            : po
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fulfill purchase order'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const releasePayment = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate X402 payment delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === id ? { ...po, status: 'Paid' as const } : po
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to release payment'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cancelPurchaseOrder = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPurchaseOrders(prev =>
        prev.map(po =>
          po.id === id ? { ...po, status: 'Cancelled' as const } : po
        )
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel purchase order'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const value: ContractContextType = {
    purchaseOrders,
    createPurchaseOrder,
    acceptPurchaseOrder,
    fulfillPurchaseOrder,
    releasePayment,
    cancelPurchaseOrder,
    loading,
    error,
  }

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  )
}
