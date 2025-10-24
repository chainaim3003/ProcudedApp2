'use client'

import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:4000/api'

export function KERIVerificationPage() {
  const [identities, setIdentities] = useState<any>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [verificationResults, setVerificationResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSystemStatus()
    loadIdentities()
  }, [])

  const loadSystemStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()
      setSystemStatus(data)
    } catch (error: any) {
      console.error('Failed to load system status:', error)
    }
  }

  const loadIdentities = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/identities`)
      const data = await response.json()
      
      if (data.success) {
        setIdentities(data.data)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyAll = async () => {
    try {
      setVerifying(true)
      const response = await fetch(`${API_BASE_URL}/identities/verify`)
      const data = await response.json()
      setVerificationResults(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✅ AID copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-600 mx-auto mb-4"></div>
          <p>Loading KERI identities...</p>
        </div>
      </div>
    )
  }

  if (error && !identities) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">❌ Error</h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <div className="bg-red-100 dark:bg-red-900/40 rounded p-4">
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">Start the API server:</p>
          <code className="block bg-red-200 dark:bg-red-900 px-3 py-2 rounded text-sm">
            cd scripts && node start-identity-api.mjs
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* System Status Card */}
      {systemStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white text-center">
              <div className="text-3xl font-bold">{systemStatus.total_identities}</div>
              <div className="text-sm opacity-90 mt-1">Total Identities</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center">
              <div className="text-3xl font-bold">
                {systemStatus.keria.buyer.online ? '✅' : '❌'}
              </div>
              <div className="text-sm opacity-90 mt-1">Buyer KERIA</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white text-center">
              <div className="text-3xl font-bold">
                {systemStatus.keria.seller.online ? '✅' : '❌'}
              </div>
              <div className="text-sm opacity-90 mt-1">Seller KERIA</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-4 text-white text-center">
              <div className="text-3xl font-bold">
                {systemStatus.success ? '✅' : '❌'}
              </div>
              <div className="text-sm opacity-90 mt-1">System Status</div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 animate-pulse ${systemStatus.keria.buyer.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Buyer KERIA: {systemStatus.keria.buyer.url} ({systemStatus.keria.buyer.online ? 'Online' : 'Offline'})
            </div>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 animate-pulse ${systemStatus.keria.seller.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Seller KERIA: {systemStatus.keria.seller.url} ({systemStatus.keria.seller.online ? 'Online' : 'Offline'})
            </div>
          </div>
        </div>
      )}

      {/* Identities Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">KERI Identities</h2>
          <div className="space-x-2">
            <button
              onClick={loadIdentities}
              className="px-4 py-2 bg-stellar-600 text-white rounded-lg hover:bg-stellar-700 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={verifyAll}
              disabled={verifying}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? '⏳ Verifying...' : '✅ Verify All'}
            </button>
          </div>
        </div>

        {identities && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IdentityCard 
              title="👤 Buyer Organization" 
              identity={identities.buyer.org} 
              color="blue"
              onCopy={copyToClipboard} 
            />
            <IdentityCard 
              title="👤 Buyer Agent" 
              identity={identities.buyer.agent} 
              color="blue"
              onCopy={copyToClipboard} 
            />
            <IdentityCard 
              title="🏪 Seller Organization" 
              identity={identities.seller.org} 
              color="green"
              onCopy={copyToClipboard} 
            />
            <IdentityCard 
              title="🏪 Seller Agent" 
              identity={identities.seller.agent} 
              color="green"
              onCopy={copyToClipboard} 
            />
          </div>
        )}
      </div>

      {/* Verification Results Card */}
      {verificationResults && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Verification Results</h2>
          
          {verificationResults.success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-800 dark:text-green-300 font-semibold text-lg">
                ✅ All identities verified successfully!
              </p>
              <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                All KERI identities are valid and KERIA servers are online.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-300 font-semibold text-lg">
                ❌ Some identities failed verification
              </p>
              <p className="text-red-700 dark:text-red-400 text-sm mt-2">
                Please check the details below.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Identity Validation */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Identity Validation:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ValidationItem 
                  label="Buyer Organization" 
                  valid={verificationResults.identities.buyer.org} 
                />
                <ValidationItem 
                  label="Buyer Agent" 
                  valid={verificationResults.identities.buyer.agent} 
                />
                <ValidationItem 
                  label="Seller Organization" 
                  valid={verificationResults.identities.seller.org} 
                />
                <ValidationItem 
                  label="Seller Agent" 
                  valid={verificationResults.identities.seller.agent} 
                />
              </div>
            </div>

            {/* Infrastructure Status */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Infrastructure Status:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfrastructureItem 
                  label="Buyer KERIA" 
                  status={verificationResults.infrastructure.buyer} 
                />
                <InfrastructureItem 
                  label="Seller KERIA" 
                  status={verificationResults.infrastructure.seller} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IdentityCard({ title, identity, color, onCopy }: any) {
  const borderColor = color === 'blue' ? 'border-blue-500' : 'border-green-500'
  
  return (
    <div className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          identity.verified 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        }`}>
          {identity.verified ? '✅ Valid' : '❌ Invalid'}
        </span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3 flex items-center gap-2">
        <code className="text-xs break-all flex-1 font-mono">{identity.aid}</code>
        <button
          onClick={() => onCopy(identity.aid)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition flex-shrink-0"
        >
          📋 Copy
        </button>
      </div>
      
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <div><strong>Name:</strong> {identity.name}</div>
        <div><strong>KERIA:</strong> {identity.keriaUrl}</div>
        <div><strong>Length:</strong> {identity.aid.length} chars</div>
      </div>
    </div>
  )
}

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className={`flex items-center p-3 rounded-lg ${
      valid 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <span className="text-2xl mr-3">{valid ? '✅' : '❌'}</span>
      <div>
        <div className="font-semibold">{label}</div>
        <div className={`text-sm ${valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {valid ? 'Valid KERI format' : 'Invalid format'}
        </div>
      </div>
    </div>
  )
}

function InfrastructureItem({ label, status }: { label: string; status: any }) {
  return (
    <div className={`flex items-center p-3 rounded-lg ${
      status.online 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <span className="text-2xl mr-3">{status.online ? '✅' : '❌'}</span>
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        <div className={`text-sm ${status.online ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {status.online ? 'Online' : 'Offline'}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{status.url}</div>
      </div>
    </div>
  )
}
