'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { usePasskeyWallet } from '@/contexts/PasskeyWalletContext'
import { Shield, CheckCircle, XCircle, Building, User, FileText } from 'lucide-react'

interface CredentialVerificationProps {
  onClose?: () => void
}

export function CredentialVerification({ onClose }: CredentialVerificationProps) {
  // Try to use the appropriate wallet context
  let wallet: any = null
  
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
  const [isModal, setIsModal] = useState(false)

  // Mock credential verification for Phase 1
  const mockVerification = {
    qviCredential: {
      valid: true,
      issuer: 'GLEIF External QVI',
      issuee: wallet?.credentials?.orgName || 'Organization',
      lei: wallet?.credentials?.orgLEI || 'LEI',
      legalName: wallet?.credentials?.orgName || 'Organization',
    },
    oorCredential: {
      valid: true,
      issuer: wallet?.credentials?.orgName || 'Organization',
      issuee: wallet?.credentials?.personName || 'Person',
      lei: wallet?.credentials?.orgLEI || 'LEI',
      personLegalName: wallet?.credentials?.personName || 'Person',
      officialRole: wallet?.credentials?.role || 'Role',
    },
    ecrCredential: {
      valid: true,
      issuer: wallet?.credentials?.orgName || 'Organization',
      issuee: wallet?.credentials?.personName || 'Person',
      lei: wallet?.credentials?.orgLEI || 'LEI',
      personLegalName: wallet?.credentials?.personName || 'Person',
      engagementContextRole: wallet?.role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
      spendingLimit: wallet?.credentials?.spendingLimit || wallet?.credentials?.maxContractValue || 0,
    },
  }

  const verifyCredentials = () => {
    // In Phase 1, we'll simulate credential verification
    // In Phase 2, this will use actual vLEI verification
    return mockVerification
  }

  const verification = verifyCredentials()
  const allValid = verification.qviCredential.valid && 
                   verification.oorCredential.valid && 
                   verification.ecrCredential.valid

  const CredentialCard = ({ 
    title, 
    credential, 
    icon: Icon 
  }: { 
    title: string
    credential: any
    icon: React.ComponentType<{ className?: string }>
  }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center space-x-2">
          <Icon className="w-4 h-4" />
          <span>{title}</span>
        </h4>
        {credential.valid ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
          <span className="font-medium">{credential.issuer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Issuee:</span>
          <span className="font-medium">{credential.issuee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">LEI:</span>
          <span className="font-mono text-xs">{credential.lei}</span>
        </div>
        {credential.personLegalName && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Person:</span>
            <span className="font-medium">{credential.personLegalName}</span>
          </div>
        )}
        {credential.officialRole && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Role:</span>
            <span className="font-medium">{credential.officialRole}</span>
          </div>
        )}
        {credential.engagementContextRole && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Context Role:</span>
            <span className="font-medium">{credential.engagementContextRole}</span>
          </div>
        )}
        {credential.spendingLimit && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Limit:</span>
            <span className="font-medium">${credential.spendingLimit.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>vLEI Credential Verification</span>
        </h3>
        {allValid ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
            All Valid
          </span>
        ) : (
          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium">
            Invalid
          </span>
        )}
      </div>

      <div className="space-y-4">
        <CredentialCard
          title="QVI Credential (Legal Entity)"
          credential={verification.qviCredential}
          icon={Building}
        />
        
        <CredentialCard
          title="OOR Credential (Organizational Role)"
          credential={verification.oorCredential}
          icon={User}
        />
        
        <CredentialCard
          title="ECR Credential (Engagement Context)"
          credential={verification.ecrCredential}
          icon={FileText}
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Credential Chain Verification
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          ✅ QVI (GLEIF) → Organization → OOR → ECR
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Phase 1: Mock verification • Phase 2: Real vLEI integration
        </p>
      </div>
    </div>
  )

  if (onClose) {
    // Modal version
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Credential Verification</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    )
  }

  // Card version
  return (
    <div className="procurement-card">
      {content}
    </div>
  )
}
