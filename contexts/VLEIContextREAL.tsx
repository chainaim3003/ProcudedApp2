'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// Dynamic import for vLEI service to handle potential module issues

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

  const initializeVLEI = async () => {
    try {
      setVlei(prev => ({ ...prev, error: null }))
      console.log('🚀 Initializing vLEI infrastructure...')

      // Use mock implementation for now (Phase 2 will use real implementation when packages are stable)
      //const mockModule = await import('@/lib/mock-signify-ts')
      //const VLEIService = mockModule.MockSignifyClient

      //const generateBran = mockModule.randomPasscode
      //const Tier = mockModule.Tier
      //const { VLEIService, generateBran, Tier } = await import('@/lib/vlei-service')

      const { createVLEIService, generateBran } = await import('@/lib/vlei-service')
      const { Tier } = await import('signify-ts')

      // Create KERIA service configurations
      const techcorpConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_KERIA_TECHCORP_URL || 'http://localhost:3901',
        bran: generateBran(),
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      const suppliercoConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_KERIA_SUPPLIERCO_URL || 'http://localhost:3904',
        bran: generateBran(),
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      const gleifConfig = {
        keriaUrl: process.env.NEXT_PUBLIC_KERIA_GLEIF_URL || 'http://localhost:3906',
        bran: generateBran(),
        tier: Tier.low,
        bootUrl: process.env.NEXT_PUBLIC_KERIA_BOOT_URL || 'http://localhost:3903'
      }

      // Create service instances
      //const techcorpService = new VLEIService(techcorpConfig)
      //const suppliercoService = new VLEIService(suppliercoConfig)
      //const gleifService = new VLEIService(gleifConfig)

      const techcorpService = createVLEIService(techcorpConfig)
      const suppliercoService = createVLEIService(suppliercoConfig)
      const gleifService = createVLEIService(gleifConfig)

      // Initialize services
      await Promise.all([
        techcorpService.initialize(),
        suppliercoService.initialize(),
        gleifService.initialize()
      ])

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
      setVlei(prev => ({ ...prev, error: errorMessage }))
      console.error('❌ vLEI initialization failed:', error)
    }
  }

  const issueCredentials = async () => {
    if (!vlei.isInitialized || !vlei.techcorpService || !vlei.suppliercoService || !vlei.gleifService) {
      throw new Error('vLEI services not initialized')
    }

    try {
      console.log('📜 Issuing vLEI credentials...')

      // Create organizational AIDs
      const techcorpAID = await vlei.techcorpService.createOrganizationAID({
        name: 'TechCorp',
        lei: '506700GE1G29325QX363',
        legalName: 'TechCorp Inc.',
        jurisdiction: 'US-DE'
      })

      const suppliercoAID = await vlei.suppliercoService.createOrganizationAID({
        name: 'SupplierCo',
        lei: '549300XOCUZD4EMKGY96',
        legalName: 'SupplierCo LLC',
        jurisdiction: 'US-CA'
      })

      // Create personal AIDs
      const johnAID = await vlei.techcorpService.createPersonAID({
        name: 'John-CFO',
        legalName: 'John Doe',
        role: 'Chief Financial Officer',
        organizationLEI: '506700GE1G29325QX363'
      })

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
      setVlei(prev => ({ ...prev, error: errorMessage }))
      console.error('❌ Credential issuance failed:', error)
      throw error
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
        // Return mock verification if credentials aren't available yet
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

    // Determine which service to use based on AID
    let service: VLEIService | null = null
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

  // Auto-initialize on mount
  useEffect(() => {
    if (!vlei.isInitialized && !vlei.error) {
      initializeVLEI()
    }
  }, [])

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