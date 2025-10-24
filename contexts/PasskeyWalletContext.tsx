'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useVLEI } from './VLEIContext'
import { PasskeyAuthenticator, createPasskeyAuthenticator, getDefaultPasskeyConfig } from '@/lib/passkey-auth'

export interface PasskeyWalletState {
  isConnected: boolean
  address: string | null
  contractId: string | null
  role: 'buyer' | 'seller' | null
  credentials: any | null
  error: string | null
  loading: boolean
}

interface PasskeyWalletContextType {
  wallet: PasskeyWalletState
  connectWallet: (role: 'buyer' | 'seller') => Promise<void>
  disconnectWallet: () => void
  switchRole: (role: 'buyer' | 'seller') => void
  executeTransaction: (params: any) => Promise<any>
  getAccountInfo: () => Promise<any>
}

const PasskeyWalletContext = createContext<PasskeyWalletContextType | undefined>(undefined)

export function usePasskeyWallet() {
  const context = useContext(PasskeyWalletContext)
  if (context === undefined) {
    throw new Error('usePasskeyWallet must be used within a PasskeyWalletProvider')
  }
  return context
}

interface PasskeyWalletProviderProps {
  children: ReactNode
}

export function PasskeyWalletProvider({ children }: PasskeyWalletProviderProps) {
  const { vlei, verifyCredentials } = useVLEI()
  const [wallet, setWallet] = useState<PasskeyWalletState>({
    isConnected: false,
    address: null,
    contractId: null,
    role: null,
    credentials: null,
    error: null,
    loading: false,
  })

  const [passkeyService, setPasskeyService] = useState<PasskeyService | null>(null)

  const connectWallet = async (role: 'buyer' | 'seller') => {
    try {
      setWallet(prev => ({ ...prev, error: null, loading: true }))

      console.log(`🔐 Starting biometric authentication for ${role}...`)

      // Create PasskeyAuthenticator instance
      const config = getDefaultPasskeyConfig()
      const authenticator = createPasskeyAuthenticator(config)

      // Step 1: Authenticate with Passkey (biometric) - following the flow diagram
      const userName = role === 'buyer' ? 'John Doe - TechCorp CFO' : 'Jane Smith - SupplierCo Sales'
      
      // Create or connect to smart wallet with biometric authentication
      const walletInfo = await authenticator.createOrConnectWallet(userName, role)
      
      // Store authenticator for future use
      setPasskeyService(authenticator as any)

      const address = walletInfo.address
      const contractId = walletInfo.contractId

      // Verify vLEI credentials
      let credentials = null
      if (vlei.isInitialized) {
        try {
          credentials = await verifyCredentials(role)
        } catch (error) {
          console.warn('vLEI credential verification failed:', error)
          // Continue without credentials for now
        }
      }

      setWallet({
        isConnected: true,
        address,
        contractId,
        role,
        credentials,
        error: null,
        loading: false,
      })

      // Store in localStorage for persistence
      localStorage.setItem('passkeyWalletState', JSON.stringify({
        isConnected: true,
        address,
        contractId,
        role,
        credentials,
      }))

      console.log(`✅ ${role} wallet connected successfully`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setWallet(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }))
      console.error('❌ Wallet connection failed:', error)
    }
  }

  const disconnectWallet = () => {
    try {
      if (passkeyService && typeof passkeyService.disconnect === 'function') {
        passkeyService.disconnect()
      }
    } catch (error) {
      console.warn('Error during wallet disconnect:', error)
    }
    
    setWallet({
      isConnected: false,
      address: null,
      contractId: null,
      role: null,
      credentials: null,
      error: null,
      loading: false,
    })
    
    setPasskeyService(null)
    localStorage.removeItem('passkeyWalletState')
    console.log('🔌 Wallet disconnected')
  }

  const switchRole = async (role: 'buyer' | 'seller') => {
    if (wallet.isConnected) {
      await connectWallet(role)
    }
  }

  const executeTransaction = async (params: any): Promise<any> => {
    if (!passkeyService || !wallet.isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      setWallet(prev => ({ ...prev, loading: true, error: null }))
      
      console.log(`🔐 Executing transaction with biometric authentication...`)
      
      // Step 3: Sign transaction with passkey (following the flow diagram)
      const userName = wallet.role === 'buyer' ? 'John Doe - TechCorp CFO' : 'Jane Smith - SupplierCo Sales'
      
      // Use the authenticator to sign the transaction with biometric authentication
      if (passkeyService && typeof (passkeyService as any).signTransactionWithPasskey === 'function') {
        const result = await (passkeyService as any).signTransactionWithPasskey(params, userName)
        setWallet(prev => ({ ...prev, loading: false }))
        return result
      } else {
        // Fallback to mock implementation
        const result = await (passkeyService as any).executeTransaction(params)
        setWallet(prev => ({ ...prev, loading: false }))
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      setWallet(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }

  const getAccountInfo = async (): Promise<any> => {
    if (!passkeyService || !wallet.isConnected) {
      throw new Error('Wallet not connected')
    }

    return await passkeyService.getAccountInfo()
  }

  // Restore wallet state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('passkeyWalletState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed.isConnected && parsed.role) {
          // Don't auto-connect, just restore the state
          setWallet(prev => ({
            ...prev,
            ...parsed,
            loading: false,
            error: null,
          }))
        }
      } catch (error) {
        console.error('Failed to restore wallet state:', error)
        localStorage.removeItem('passkeyWalletState')
      }
    }
  }, [])

  // Update credentials when vLEI is initialized and credentials are available
  useEffect(() => {
    if (vlei.isInitialized && wallet.isConnected && wallet.role) {
      // Check if credentials are available before trying to verify
      const hasCredentials = wallet.role === 'buyer' 
        ? (vlei.credentials.john && vlei.credentials.techcorp)
        : (vlei.credentials.jane && vlei.credentials.supplierco)
      
      if (hasCredentials) {
        verifyCredentials(wallet.role)
          .then(credentials => {
            setWallet(prev => ({ ...prev, credentials }))
          })
          .catch(error => {
            console.warn('Failed to update credentials:', error)
          })
      } else {
        // Use mock credentials if real ones aren't available yet
        const mockCredentials = {
          valid: true,
          orgLEI: wallet.role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
          personName: wallet.role === 'buyer' ? 'John Doe' : 'Jane Smith',
          role: wallet.role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
          spendingLimit: wallet.role === 'buyer' ? 100000 : 500000,
          maxContractValue: wallet.role === 'buyer' ? 100000 : 500000,
          details: {
            orgName: wallet.role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
            lei: wallet.role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
            personName: wallet.role === 'buyer' ? 'John Doe' : 'Jane Smith',
            role: wallet.role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
            spendingLimit: wallet.role === 'buyer' ? 100000 : 500000,
            maxContractValue: wallet.role === 'buyer' ? 100000 : 500000,
          }
        }
        setWallet(prev => ({ ...prev, credentials: mockCredentials }))
      }
    }
  }, [vlei.isInitialized, wallet.isConnected, wallet.role, vlei.credentials])

  const value: PasskeyWalletContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    switchRole,
    executeTransaction,
    getAccountInfo,
  }

  return (
    <PasskeyWalletContext.Provider value={value}>
      {children}
    </PasskeyWalletContext.Provider>
  )
}
