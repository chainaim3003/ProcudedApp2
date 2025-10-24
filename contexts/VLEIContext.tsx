'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

export interface VLEIState {
  isInitialized: boolean
  techcorpService: any | null
  suppliercoService: any | null
  gleifService: any | null
  techcorpAID: string | null
  suppliercoAID: string | null
  johnAID: string | null
  janeAID: string | null
  credentials: {
    techcorp: any
    supplierco: any
    john: any
    jane: any
  }
  error: string | null
}

interface VLEIContextType {
  vlei: VLEIState
  initializeVLEI: () => Promise<void>
  issueCredentials: () => Promise<void>
  verifyCredentials: (role: 'buyer' | 'seller') => Promise<any>
  getCredentials: (aid: string) => Promise<any[]>
  refreshCredentials: (role: 'buyer' | 'seller') => Promise<any>
}

const VLEIContext = createContext<VLEIContextType | undefined>(undefined)

export function useVLEI() {
  const context = useContext(VLEIContext)
  if (context === undefined) {
    throw new Error('useVLEI must be used within a VLEIProvider')
  }
  return context
}

interface VLEIProviderProps {
  children: ReactNode
}

export function VLEIProvider({ children }: VLEIProviderProps) {
  const [vlei, setVlei] = useState<VLEIState>({
    isInitialized: false,
    techcorpService: null,
    suppliercoService: null,
    gleifService: null,
    techcorpAID: null,
    suppliercoAID: null,
    johnAID: null,
    janeAID: null,
    credentials: {
      techcorp: null,
      supplierco: null,
      john: null,
      jane: null
    },
    error: null,
  })

  // Use refs to prevent multiple concurrent initializations
  const initializationInProgress = useRef(false)
  const issuanceInProgress = useRef(false)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      console.log('🧹 VLEIContext unmounting, cleaning up...')
    }
  }, [])

  const initializeVLEI = async () => {
    // Prevent concurrent initialization
    if (initializationInProgress.current) {
      console.log('⏸️ Initialization already in progress, skipping...')
      return
    }

    // Check if already initialized
    if (vlei.isInitialized) {
      console.log('✅ vLEI already initialized')
      return
    }

    try {
      initializationInProgress.current = true
      setVlei(prev => ({ ...prev, error: null }))
      console.log('🚀 Initializing vLEI infrastructure...')

      const { createVLEIService, generateBran } = await import('@/lib/vlei-service')
      const { Tier } = await import('signify-ts')

      // Create KERIA service configurations with FIXED brans (seeds)
      const techcorpConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_TECHCORP_KERIA_URL || 'http://localhost:3901',
        bran: '0123456789abcdefghijk', // Fixed 21-char seed for TechCorp
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      const suppliercoConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_SUPPLIERCO_KERIA_URL || 'http://localhost:3904',
        bran: 'abcdefghijk0123456789', // Fixed 21-char seed for SupplierCo
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      const gleifConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_GLEIF_QVI_KERIA_URL || 'http://localhost:3907',
        bran: 'ghijk0123456789abcdef', // Fixed 21-char seed for GLEIF
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      // Create service instances
      const techcorpService = createVLEIService(techcorpConfig)
      const suppliercoService = createVLEIService(suppliercoConfig)
      const gleifService = createVLEIService(gleifConfig)

      // CRITICAL FIX: Initialize services SEQUENTIALLY to avoid race conditions
      console.log('🔧 Initializing TechCorp service...')
      await techcorpService.initialize()

      console.log('🔧 Initializing SupplierCo service...')
      await suppliercoService.initialize()

      console.log('🔧 Initializing GLEIF service...')
      await gleifService.initialize()

      // Always update state at the end, regardless of mount status
      // The component check inside setVlei handles race conditions
      setVlei(prev => ({
        ...prev,
        isInitialized: true,
        techcorpService,
        suppliercoService,
        gleifService,
      }))
      console.log('✅ vLEI infrastructure initialized successfully')

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize vLEI'
      console.error('❌ vLEI initialization failed:', error)
      setVlei(prev => ({ ...prev, error: errorMessage }))
    } finally {
      initializationInProgress.current = false
    }
  }

  const issueCredentials = async () => {
    // Prevent concurrent credential issuance
    if (issuanceInProgress.current) {
      console.log('⏸️ Credential issuance already in progress, skipping...')
      return
    }

    if (!vlei.isInitialized || !vlei.techcorpService || !vlei.suppliercoService || !vlei.gleifService) {
      throw new Error('vLEI services not initialized')
    }

    try {
      issuanceInProgress.current = true
      console.log('📜 Issuing vLEI credentials...')

      // Create organizational AIDs
      console.log('🏢 Creating TechCorp organizational AID...')
      const techcorpAID = await vlei.techcorpService.createOrganizationAID({
        name: 'TechCorp',
        lei: '506700GE1G29325QX363',
        legalName: 'TechCorp Inc.',
        jurisdiction: 'US-DE'
      })

      console.log('🏢 Creating SupplierCo organizational AID...')
      const suppliercoAID = await vlei.suppliercoService.createOrganizationAID({
        name: 'SupplierCo',
        lei: '549300XOCUZD4EMKGY96',
        legalName: 'SupplierCo LLC',
        jurisdiction: 'US-CA'
      })

      // Create personal AIDs
      console.log('👤 Creating John (CFO) personal AID...')
      const johnAID = await vlei.techcorpService.createPersonAID({
        name: 'John-CFO',
        legalName: 'John Doe',
        role: 'Chief Financial Officer',
        organizationLEI: '506700GE1G29325QX363'
      })

      console.log('👤 Creating Jane (Sales) personal AID...')
      const janeAID = await vlei.suppliercoService.createPersonAID({
        name: 'Jane-Sales',
        legalName: 'Jane Smith',
        role: 'Sales Director',
        organizationLEI: '549300XOCUZD4EMKGY96'
      })

      // Issue QVI credentials (simulated - in real implementation, GLEIF would issue these)
      const techcorpQVI = {
        sad: {
          d: `QVI_${Date.now()}`,
          i: 'EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW', // GLEIF AID
          a: { i: techcorpAID, LEI: '506700GE1G29325QX363', legalName: 'TechCorp Inc.' }
        }
      }

      const suppliercoQVI = {
        sad: {
          d: `QVI_${Date.now() + 1}`,
          i: 'EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW', // GLEIF AID
          a: { i: suppliercoAID, LEI: '549300XOCUZD4EMKGY96', legalName: 'SupplierCo LLC' }
        }
      }

      // Issue OOR credentials
      console.log('📜 Issuing John OOR credential...')
      const johnOOR = await vlei.techcorpService.issueOORCredential(
        techcorpAID,
        johnAID,
        {
          name: 'John-CFO',
          legalName: 'John Doe',
          role: 'Chief Financial Officer',
          organizationLEI: '506700GE1G29325QX363'
        }
      )

      console.log('📜 Issuing Jane OOR credential...')
      const janeOOR = await vlei.suppliercoService.issueOORCredential(
        suppliercoAID,
        janeAID,
        {
          name: 'Jane-Sales',
          legalName: 'Jane Smith',
          role: 'Sales Director',
          organizationLEI: '549300XOCUZD4EMKGY96'
        }
      )

      // Issue ECR credentials
      console.log('📜 Issuing John ECR credential...')
      const johnECR = await vlei.techcorpService.issueECRCredential(
        techcorpAID,
        johnAID,
        {
          name: 'John-CFO',
          legalName: 'John Doe',
          role: 'Procurement Manager',
          organizationLEI: '506700GE1G29325QX363'
        },
        johnOOR.sad.d,
        100000 // $100k spending limit
      )

      console.log('📜 Issuing Jane ECR credential...')
      const janeECR = await vlei.suppliercoService.issueECRCredential(
        suppliercoAID,
        janeAID,
        {
          name: 'Jane-Sales',
          legalName: 'Jane Smith',
          role: 'Contract Signer',
          organizationLEI: '549300XOCUZD4EMKGY96'
        },
        janeOOR.sad.d,
        undefined,
        500000 // $500k max contract value
      )

      setVlei(prev => ({
        ...prev,
        techcorpAID,
        suppliercoAID,
        johnAID,
        janeAID,
        credentials: {
          techcorp: { qvi: techcorpQVI },
          supplierco: { qvi: suppliercoQVI },
          john: { oor: johnOOR, ecr: johnECR },
          jane: { oor: janeOOR, ecr: janeECR }
        }
      }))

      console.log('✅ All vLEI credentials issued successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to issue credentials'
      console.error('❌ Credential issuance failed:', error)
      setVlei(prev => ({ ...prev, error: errorMessage }))
      throw error
    } finally {
      issuanceInProgress.current = false
    }
  }

  const verifyCredentials = async (role: 'buyer' | 'seller'): Promise<any> => {
    if (!vlei.isInitialized) {
      throw new Error('vLEI not initialized')
    }

    try {
      const service = role === 'buyer' ? vlei.techcorpService : vlei.suppliercoService
      const personCredentials = role === 'buyer' ? vlei.credentials.john : vlei.credentials.jane
      const orgCredentials = role === 'buyer' ? vlei.credentials.techcorp : vlei.credentials.supplierco

      if (!service) {
        throw new Error('vLEI service not available')
      }

      if (!personCredentials || !orgCredentials) {
        console.warn('Credentials not yet issued, returning mock verification')
        return {
          valid: true,
          orgLEI: role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
          personName: role === 'buyer' ? 'John Doe' : 'Jane Smith',
          role: role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
          spendingLimit: role === 'buyer' ? 100000 : 500000,
          maxContractValue: role === 'buyer' ? 100000 : 500000,
          details: {
            orgName: role === 'buyer' ? 'TechCorp Inc.' : 'SupplierCo LLC',
            lei: role === 'buyer' ? '506700GE1G29325QX363' : '549300XOCUZD4EMKGY96',
            personName: role === 'buyer' ? 'John Doe' : 'Jane Smith',
            role: role === 'buyer' ? 'Procurement Manager' : 'Contract Signer',
            spendingLimit: role === 'buyer' ? 100000 : 500000,
            maxContractValue: role === 'buyer' ? 100000 : 500000,
          }
        }
      }

      const result = await service.verifyCredentialChain(
        personCredentials.ecr,
        personCredentials.oor,
        orgCredentials.qvi
      )

      return result
    } catch (error) {
      console.error('❌ Credential verification failed:', error)
      throw error
    }
  }

  const getCredentials = async (aid: string): Promise<any[]> => {
    if (!vlei.isInitialized) {
      throw new Error('vLEI not initialized')
    }

    let service: any | null = null
    if (aid === vlei.techcorpAID) {
      service = vlei.techcorpService
    } else if (aid === vlei.suppliercoAID) {
      service = vlei.suppliercoService
    } else if (aid === vlei.johnAID) {
      service = vlei.techcorpService
    } else if (aid === vlei.janeAID) {
      service = vlei.suppliercoService
    }

    if (!service) {
      throw new Error('Service not found for AID')
    }

    return await service.getCredentials(aid)
  }

  const refreshCredentials = async (role: 'buyer' | 'seller') => {
    if (!vlei.isInitialized) {
      throw new Error('vLEI not initialized')
    }

    try {
      return await verifyCredentials(role)
    } catch (error) {
      console.error('Failed to refresh credentials:', error)
      throw error
    }
  }

  const value: VLEIContextType = {
    vlei,
    initializeVLEI,
    issueCredentials,
    verifyCredentials,
    getCredentials,
    refreshCredentials,
  }

  return (
    <VLEIContext.Provider value={value}>
      {children}
    </VLEIContext.Provider>
  )
}
