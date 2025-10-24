'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface WalletState {
  isConnected: boolean
  address: string | null
  contractId: string | null
  role: 'buyer' | 'seller' | null
  credentials: MockCredentials | null
  error: string | null
}

export interface MockCredentials {
  vLEIAID: string
  orgLEI: string
  orgName: string
  personName: string
  role: string
  spendingLimit?: number
  maxContractValue?: number
}

interface WalletContextType {
  wallet: WalletState
  connectWallet: (role: 'buyer' | 'seller') => Promise<void>
  disconnectWallet: () => void
  switchRole: (role: 'buyer' | 'seller') => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    contractId: null,
    role: null,
    credentials: null,
    error: null,
  })

  // Mock data for Phase 1
  const mockCredentials = {
    buyer: {
      vLEIAID: 'ELbfbbLMcKinMyOrQMDm8kDBaxfqHRhruA1ZF7EZS4hF',
      orgLEI: process.env.NEXT_PUBLIC_BUYER_LEI || '506700GE1G29325QX363',
      orgName: 'TechCorp Inc.',
      personName: 'John Doe',
      role: 'Chief Financial Officer',
      spendingLimit: 100000,
    },
    seller: {
      vLEIAID: 'EHx9LmN8wRZ6kUpY8QRvSj5sN9oYn3UcEcIdZm9zC',
      orgLEI: process.env.NEXT_PUBLIC_SELLER_LEI || '549300XOCUZD4EMKGY96',
      orgName: 'SupplierCo LLC',
      personName: 'Jane Smith',
      role: 'Sales Director',
      maxContractValue: 500000,
    },
  }

  const connectWallet = async (role: 'buyer' | 'seller') => {
    try {
      setWallet(prev => ({ ...prev, error: null }))

      // Import mock Passkey-Kit for Phase 1
      const { PasskeyKit } = await import('@/lib/mock-passkey-kit')
      
      const account = new PasskeyKit({
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
        networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
        factoryContractId: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || 'CCWJFJ7YQHZ3QH2GQYQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
      })

      const contractId = await account.connectWallet({
        name: role === 'buyer' ? 'John Doe - TechCorp CFO' : 'Jane Smith - SupplierCo Sales',
        description: 'Procurement wallet',
      })

      const address = account.getAddress()

      setWallet({
        isConnected: true,
        address,
        contractId,
        role,
        credentials: mockCredentials[role],
        error: null,
      })

      // Store in localStorage for persistence
      localStorage.setItem('walletState', JSON.stringify({
        isConnected: true,
        address,
        contractId,
        role,
        credentials: mockCredentials[role],
      }))
    } catch (error) {
      setWallet(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }))
    }
  }

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      contractId: null,
      role: null,
      credentials: null,
      error: null,
    })
    localStorage.removeItem('walletState')
  }

  const switchRole = (role: 'buyer' | 'seller') => {
    if (wallet.isConnected) {
      connectWallet(role)
    }
  }

  // Restore wallet state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('walletState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.isConnected && parsed.role) {
          setWallet({
            ...parsed,
            error: null,
          })
        }
      } catch (error) {
        console.error('Failed to restore wallet state:', error)
        localStorage.removeItem('walletState')
      }
    }
  }, [])

  const value: WalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    switchRole,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
