'use client'

import React, { useState } from 'react'
import { PasskeyAuthenticator, createPasskeyAuthenticator, getDefaultPasskeyConfig } from '@/lib/passkey-auth'
import { Fingerprint, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface BiometricAuthDemoProps {
  onAuthSuccess?: (walletInfo: any) => void
  role: 'buyer' | 'seller'
}

export function BiometricAuthDemo({ onAuthSuccess, role }: BiometricAuthDemoProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authResult, setAuthResult] = useState<{
    success: boolean
    message: string
    walletInfo?: any
  } | null>(null)
  const [step, setStep] = useState<'idle' | 'authenticating' | 'creating_wallet' | 'complete'>('idle')

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true)
      setStep('authenticating')
      setAuthResult(null)

      console.log(`🔐 Starting biometric authentication for ${role}...`)

      // Create PasskeyAuthenticator instance
      const config = getDefaultPasskeyConfig()
      const authenticator = createPasskeyAuthenticator(config)

      // Step 1: Authenticate with Passkey (biometric) - following the flow diagram
      const userName = role === 'buyer' ? 'John Doe - TechCorp CFO' : 'Jane Smith - SupplierCo Sales'
      
      setStep('creating_wallet')
      
      // Create or connect to smart wallet with biometric authentication
      const walletInfo = await authenticator.createOrConnectWallet(userName, role)
      
      setStep('complete')
      setAuthResult({
        success: true,
        message: 'Biometric authentication successful! Smart wallet created.',
        walletInfo
      })

      if (onAuthSuccess) {
        onAuthSuccess(walletInfo)
      }

      console.log(`✅ Biometric authentication completed for ${role}`)
    } catch (error) {
      console.error('❌ Biometric authentication failed:', error)
      setAuthResult({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      })
      setStep('idle')
    } finally {
      setIsAuthenticating(false)
    }
  }

  const getStepIcon = () => {
    switch (step) {
      case 'authenticating':
        return <Fingerprint className="w-8 h-8 text-blue-600 animate-pulse" />
      case 'creating_wallet':
        return <Shield className="w-8 h-8 text-purple-600 animate-pulse" />
      case 'complete':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      default:
        return <Fingerprint className="w-8 h-8 text-gray-600" />
    }
  }

  const getStepMessage = () => {
    switch (step) {
      case 'authenticating':
        return 'Authenticating with biometric...'
      case 'creating_wallet':
        return 'Creating smart wallet...'
      case 'complete':
        return 'Authentication complete!'
      default:
        return 'Ready to authenticate'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔐 Biometric Authentication Demo
        </h3>
        
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {getStepIcon()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {getStepMessage()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Role: {role === 'buyer' ? 'John Doe (TechCorp CFO)' : 'Jane Smith (SupplierCo Sales)'}
          </p>
        </div>

        {authResult && (
          <div className={`mb-4 p-4 rounded-lg ${
            authResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-center mb-2">
              {authResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className={`text-sm ${
              authResult.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {authResult.message}
            </p>
            {authResult.walletInfo && (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                <p>Address: {authResult.walletInfo.address}</p>
                <p>Contract: {authResult.walletInfo.contractId}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleBiometricAuth}
          disabled={isAuthenticating}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            isAuthenticating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAuthenticating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Authenticating...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Fingerprint className="w-4 h-4 mr-2" />
              Start Biometric Authentication
            </div>
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          <p>This demo follows the complete flow diagram:</p>
          <ul className="text-left mt-2 space-y-1">
            <li>• Step 1: Authenticate with Passkey (biometric)</li>
            <li>• Step 2: Create/connect smart wallet</li>
            <li>• Step 3: Ready for transaction signing</li>
          </ul>
        </div>

        {typeof window !== 'undefined' && !window.PublicKeyCredential && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              WebAuthn/Passkeys not supported in this browser. This is a demo of the authentication flow.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
