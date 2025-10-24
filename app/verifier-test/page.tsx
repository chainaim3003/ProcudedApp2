'use client'

import React from 'react'
import identities from '@/app/config/identities.json'

export default function VerifierTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">vLEI Identity Verifier</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Development Mode - Testing Buyer & Seller Identities
          </p>
        </div>

        {/* Identity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">
              Buyer Organization
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <p className="font-medium">{identities.buyerOrg.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">AID:</span>
                <p className="font-mono text-xs break-all">{identities.buyerOrg.aid}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Agent:</span>
                <p className="font-medium">{identities.buyerAgent.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Agent AID:</span>
                <p className="font-mono text-xs break-all">{identities.buyerAgent.aid}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                <p className="font-mono text-xs">{identities.buyerOrg.keriaEndpoint}</p>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Seller Organization
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <p className="font-medium">{identities.sellerOrg.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">AID:</span>
                <p className="font-mono text-xs break-all">{identities.sellerOrg.aid}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Agent:</span>
                <p className="font-medium">{identities.sellerAgent.name}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Agent AID:</span>
                <p className="font-mono text-xs break-all">{identities.sellerAgent.aid}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Endpoint:</span>
                <p className="font-mono text-xs">{identities.sellerOrg.keriaEndpoint}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Development Mode Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚠️ Development Mode
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Method:</strong> {identities.setup.method} <br/>
            <strong>Verified:</strong> {identities.setup.verified ? 'Yes' : 'No (Self-Signed)'} <br/>
            <strong>Note:</strong> {identities.setup.note}
          </p>
        </div>

        {/* Mock Credential Verification */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Mock Credential Verification</h2>
          <div className="space-y-4">
            <VerificationItem
              title="Buyer Agent Verification"
              aid={identities.buyerAgent.aid}
              name={identities.buyerAgent.name}
              status="verified"
            />
            <VerificationItem
              title="Seller Agent Verification"
              aid={identities.sellerAgent.aid}
              name={identities.sellerAgent.name}
              status="verified"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => alert('Buyer verification simulated ✅')}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Verify Buyer Agent
          </button>
          <button
            onClick={() => alert('Seller verification simulated ✅')}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Verify Seller Agent
          </button>
          <button
            onClick={() => {
              console.log('Identity Configuration:', identities)
              alert('Check browser console for full configuration')
            }}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            View Full Config
          </button>
        </div>
      </div>
    </div>
  )
}

function VerificationItem({ 
  title, 
  aid, 
  name, 
  status 
}: { 
  title: string
  aid: string
  name: string
  status: 'verified' | 'unverified'
}) {
  return (
    <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${
        status === 'verified' ? 'bg-green-500' : 'bg-red-500'
      }`}>
        {status === 'verified' && (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
        <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1 break-all">{aid}</p>
        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
          status === 'verified' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {status === 'verified' ? '✅ Verified (Mock)' : '❌ Unverified'}
        </span>
      </div>
    </div>
  )
}
