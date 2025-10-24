// Real vLEI Service for Phase 2 - ENHANCED FIX VERSION
// This service manages actual vLEI credentials using KERIA agents
// FIX: Added client state refresh, proper delays, and enhanced error handling

import { SignifyClient, Tier, randomPasscode, ready } from 'signify-ts'

export interface VLEIConfig {
  keriaUrl: string
  bran: string
  tier: Tier
  bootUrl?: string
}

export interface OrganizationInfo {
  name: string
  lei: string
  legalName: string
  jurisdiction: string
}

export interface PersonInfo {
  name: string
  legalName: string
  role: string
  organizationLEI: string
}

export interface CredentialData {
  qviCredential?: any
  oorCredential?: any
  ecrCredential?: any
}

export class VLEIService {
  private client: SignifyClient | null = null
  private config: VLEIConfig
  private isInitialized = false
  private controllerPrefix: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private lastOperationTime = 0
  private minOperationDelay = 500 // Minimum ms between operations

  constructor(config: VLEIConfig) {
    this.config = config
    this.client = new SignifyClient(
      config.keriaUrl,
      config.bran,
      config.tier,
      config.bootUrl
    )
  }

  /**
   * Enforce minimum delay between operations to prevent race conditions
   */
  private async enforceOperationDelay(): Promise<void> {
    const now = Date.now()
    const timeSinceLastOp = now - this.lastOperationTime
    
    if (timeSinceLastOp < this.minOperationDelay) {
      const delay = this.minOperationDelay - timeSinceLastOp
      console.log(`⏱️ Waiting ${delay}ms before next operation...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastOperationTime = Date.now()
  }

  /**
   * Refresh client state to ensure it's ready for operations
   */
  private async refreshClientState(): Promise<void> {
    if (!this.client) {
      throw new Error('Client is null, cannot refresh state')
    }

    try {
      console.log('🔄 Refreshing client state...')
      
      // Try to get the state - this forces the client to refresh its internal state
      if (typeof this.client.state === 'function') {
        await this.client.state()
      }
      
      // Verify controller is still available
      if (!this.client.controller || !this.client.controller.pre) {
        console.warn('⚠️ Controller lost after state refresh, reconnecting...')
        await this.client.connect()
      }
      
      console.log('✅ Client state refreshed')
    } catch (error: any) {
      console.error('❌ Failed to refresh client state:', error)
      throw new Error(`Client state refresh failed: ${error.message}`)
    }
  }

  /**
   * Validate client state and reconnect if necessary
   * ENHANCED: Now includes state refresh and better error handling
   */
  private async ensureClientConnected(): Promise<void> {
    console.log('🔍 Validating client connection...')

    // Check if client exists
    if (!this.client) {
      console.log('⚠️ Client is null, attempting to reinitialize...')
      await this.initialize()
      return
    }

    // Check if client has a controller (which means it's connected)
    if (this.client.controller && this.client.controller.pre) {
      console.log('✅ Client connection validated (controller exists)')
      this.reconnectAttempts = 0
      
      // Refresh state to ensure everything is ready
      await this.refreshClientState()
      return
    }

    // If no controller, try a gentler state check
    try {
      const state = typeof this.client.state === 'function' ? await this.client.state() : this.client.state
      if (state) {
        console.log('✅ Client connection validated (state check passed)')
        this.reconnectAttempts = 0
        return
      }
    } catch (err: any) {
      console.warn('⚠️ State check failed:', err.message)
    }

    // If we get here, try to reconnect
    console.log('⚠️ Client appears disconnected, attempting to reconnect...')
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      await new Promise(resolve => setTimeout(resolve, 1000 * this.reconnectAttempts))
      
      try {
        await this.client.connect()
        console.log('✅ Reconnection successful')
        this.reconnectAttempts = 0
        await this.refreshClientState()
      } catch (error: any) {
        console.error('❌ Reconnection failed:', error)
        throw new Error(`Failed to reconnect: ${error.message}`)
      }
    } else {
      throw new Error('Max reconnection attempts reached. Please restart the service.')
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.client) {
      console.log('✅ Service already initialized')
      return
    }

    try {
      console.log('🚀 Initializing vLEI service...')
      await ready()
      
      // Create new client if needed
      if (!this.client) {
        this.client = new SignifyClient(
          this.config.keriaUrl,
          this.config.bran,
          this.config.tier,
          this.config.bootUrl
        )
      }
      
      // Try to connect first (agent might already exist)
      try {
        await this.client.connect()
        console.log('✅ Connected to existing KERIA agent')
      } catch (connectError: any) {
        // If connect fails, boot a new agent (boot automatically connects)
        console.log('📋 Agent does not exist, booting new agent...')
        try {
          await this.client.boot()
          console.log('✅ Agent booted successfully (already connected)')
        } catch (bootError: any) {
          // 409 means agent already exists - need to connect instead
          if (bootError.message?.includes('409') || bootError.message?.includes('Conflict')) {
            console.log('⚠️ Agent already exists (409 Conflict), connecting instead...')
            try {
              await this.client.connect()
              console.log('✅ Connected to existing agent after boot conflict')
            } catch (connectAfterBootError) {
              console.error('❌ Failed to connect after boot conflict:', connectAfterBootError)
              throw new Error('Agent exists but cannot connect. Please restart KERIA services.')
            }
          } else {
            console.error('❌ Failed to boot agent:', bootError)
            throw bootError
          }
        }
      }
      
      // Wait a bit for the client to fully stabilize
      console.log('⏱️ Allowing client to stabilize...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get the controller prefix (AID) after connection
      try {
        const controllerAID = this.client.controller?.pre
        console.log('🔑 Controller AID:', controllerAID)
        
        if (controllerAID) {
          this.controllerPrefix = controllerAID
        } else {
          console.warn('⚠️ Warning: Controller AID is undefined or null')
        }
      } catch (error) {
        console.error('❌ Error accessing controller AID:', error)
      }
      
      // Refresh state to ensure everything is ready
      await this.refreshClientState()
      
      this.isInitialized = true
      this.reconnectAttempts = 0
      this.lastOperationTime = Date.now()
      console.log('✅ vLEI service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize vLEI service:', error)
      this.client = null
      this.isInitialized = false
      throw error
    }
  }

  async createOrganizationAID(orgInfo: OrganizationInfo): Promise<string> {
    console.log(`🏢 Creating organizational AID for ${orgInfo.name}...`)
    
    // CRITICAL: Enforce delay and ensure client is ready
    await this.enforceOperationDelay()
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client is not initialized after connection check')
    }

    // Verify client has identifiers method before proceeding
    if (!this.client.identifiers || typeof this.client.identifiers !== 'function') {
      console.error('❌ Client.identifiers is not available')
      console.error('❌ Client state:', {
        hasClient: !!this.client,
        hasController: !!this.client.controller,
        controllerPre: this.client.controller?.pre,
        hasIdentifiers: !!this.client.identifiers,
        identifiersType: typeof this.client.identifiers
      })
      
      // Try to refresh client state and retry once
      console.log('🔄 Attempting to refresh client state and retry...')
      await this.refreshClientState()
      
      if (!this.client.identifiers || typeof this.client.identifiers !== 'function') {
        throw new Error('Client identifiers method is not available even after refresh. Please restart the service.')
      }
    }

    try {
      // Check if AID already exists
      try {
        const identifiersApi = this.client.identifiers()
        if (!identifiersApi) {
          throw new Error('identifiers() returned null')
        }
        
        const existingAid = await identifiersApi.get(orgInfo.name)
        if (existingAid && existingAid.prefix) {
          console.log(`ℹ️ AID already exists: ${existingAid.prefix}`)
          return existingAid.prefix
        }
      } catch (error) {
        // AID doesn't exist, continue to create it
        console.log(`📝 AID does not exist yet, creating new one...`)
      }
      
      // Create new AID
      console.log('🔵 Calling identifiers().create() for:', orgInfo.name)
      
      // Get identifiers API with null check
      let identifiersApi
      try {
        identifiersApi = this.client.identifiers()
      } catch (error: any) {
        console.error('❌ Failed to get identifiers API:', error)
        throw new Error(`Failed to access identifiers API: ${error.message}`)
      }
      
      if (!identifiersApi || !identifiersApi.create) {
        console.error('❌ identifiers() returned null or has no create method')
        console.error('❌ Attempting emergency client refresh...')
        
        // Emergency refresh
        try {
          await this.client.connect()
          await this.refreshClientState()
          identifiersApi = this.client.identifiers()
          
          if (!identifiersApi || !identifiersApi.create) {
            throw new Error('identifiers() still null after emergency refresh')
          }
        } catch (refreshError: any) {
          throw new Error(`Client state is corrupted. Emergency refresh failed: ${refreshError.message}`)
        }
      }
      
      // Now attempt to create the AID
      let aidResult
      try {
        aidResult = await identifiersApi.create(orgInfo.name)
      } catch (createError: any) {
        console.error('❌ create() call failed:', createError)
        throw new Error(`Failed to create AID: ${createError.message}`)
      }
      
      if (!aidResult) {
        throw new Error('Failed to create identifier - aidResult is null')
      }

      // Get the operation name if available
      let opName = null
      try {
        if (typeof aidResult.op === 'function') {
          const opResult = aidResult.op()
          opName = opResult?.name || null
        }
      } catch (opError) {
        console.warn('⚠️ Error calling op():', opError)
      }
      
      if (!opName) {
        console.log('🔄 No operation name, waiting briefly then checking AID...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
          const aid = (await this.client.identifiers().get(orgInfo.name)).prefix
          console.log(`✅ Organizational AID created: ${aid}`)
          this.lastOperationTime = Date.now()
          return aid
        } catch (getError) {
          console.error('❌ Failed to verify AID creation:', getError)
          throw new Error('AID creation status uncertain - operation not tracked')
        }
      }
      
      // Wait for the operation to complete
      console.log(`⏳ Waiting for operation: ${opName}`)
      await this.client.operations().wait(opName)
      
      const aid = (await this.client.identifiers().get(orgInfo.name)).prefix
      console.log(`✅ Organizational AID created: ${aid}`)
      this.lastOperationTime = Date.now()
      
      return aid
    } catch (error: any) {
      console.error('❌ Failed to create organizational AID:', error)
      
      // Enhanced error message
      let errorMessage = error.message
      if (error.message?.includes('Cannot read properties of null')) {
        errorMessage = 'Client state became null during AID creation. This indicates a timing or state management issue. Please try again, or restart the KERIA services if the problem persists.'
      }
      
      throw new Error(errorMessage)
    }
  }

  async createPersonAID(personInfo: PersonInfo): Promise<string> {
    await this.enforceOperationDelay()
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      console.log(`👤 Creating personal AID for ${personInfo.name}...`)
      
      // Check if AID already exists
      try {
        const existingAid = await this.client.identifiers().get(personInfo.name)
        if (existingAid && existingAid.prefix) {
          console.log(`ℹ️ AID already exists: ${existingAid.prefix}`)
          return existingAid.prefix
        }
      } catch (error) {
        console.log(`📝 AID does not exist yet, creating new one...`)
      }
      
      const identifiersApi = this.client.identifiers()
      if (!identifiersApi || !identifiersApi.create) {
        await this.refreshClientState()
        throw new Error('identifiers() API not available')
      }
      
      const aidResult = await identifiersApi.create(personInfo.name)
      
      if (!aidResult) {
        throw new Error('Failed to create identifier - aidResult is null')
      }

      // Get the operation name if available
      let opName = null
      try {
        if (typeof aidResult.op === 'function') {
          const opResult = aidResult.op()
          opName = opResult?.name || null
        }
      } catch (opError) {
        console.warn('⚠️ Error calling op():', opError)
      }
      
      if (!opName) {
        console.log('🔄 No operation name, waiting briefly then checking AID...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        try {
          const aid = (await this.client.identifiers().get(personInfo.name)).prefix
          console.log(`✅ Personal AID created: ${aid}`)
          this.lastOperationTime = Date.now()
          return aid
        } catch (getError) {
          console.error('❌ Failed to verify AID creation:', getError)
          throw new Error('AID creation status uncertain - operation not tracked')
        }
      }
      
      console.log(`⏳ Waiting for operation: ${opName}`)
      await this.client.operations().wait(opName)
      
      const aid = (await this.client.identifiers().get(personInfo.name)).prefix
      console.log(`✅ Personal AID created: ${aid}`)
      this.lastOperationTime = Date.now()
      
      return aid
    } catch (error) {
      console.error('❌ Failed to create personal AID:', error)
      throw error
    }
  }

  async issueOORCredential(
    orgAid: string,
    personAid: string,
    personInfo: PersonInfo
  ): Promise<any> {
    await this.enforceOperationDelay()
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      console.log(`📜 Issuing OOR credential for ${personInfo.name}...`)
      
      const oorSchema = 'EH6ekLjSr8V32WyFbGe1zXjTzFs9PkTYmupJ9H65O14g'
      
      const credentialData = {
        LEI: personInfo.organizationLEI,
        personLegalName: personInfo.legalName,
        officialRole: personInfo.role,
      }

      const credential = await this.client.credentials().issue(
        orgAid,
        personAid,
        oorSchema,
        credentialData
      )

      console.log(`✅ OOR credential issued: ${credential.sad.d}`)
      this.lastOperationTime = Date.now()
      return credential
    } catch (error) {
      console.error('❌ Failed to issue OOR credential:', error)
      throw error
    }
  }

  async issueECRCredential(
    orgAid: string,
    personAid: string,
    personInfo: PersonInfo,
    oorCredentialSAID: string,
    spendingLimit?: number,
    maxContractValue?: number
  ): Promise<any> {
    await this.enforceOperationDelay()
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      console.log(`📜 Issuing ECR credential for ${personInfo.name}...`)
      
      const ecrSchema = 'EKA57bKBKxr_kN7iN_zZeBG8aP0Sv-JvpPLdJ1jg3b2g'
      
      const credentialData = {
        LEI: personInfo.organizationLEI,
        personLegalName: personInfo.legalName,
        engagementContextRole: personInfo.role,
        ...(spendingLimit && { spendingLimit }),
        ...(maxContractValue && { maxContractValue }),
      }

      const edges = {
        auth: oorCredentialSAID,
      }

      const credential = await this.client.credentials().issue(
        orgAid,
        personAid,
        ecrSchema,
        credentialData,
        edges
      )

      console.log(`✅ ECR credential issued: ${credential.sad.d}`)
      this.lastOperationTime = Date.now()
      return credential
    } catch (error) {
      console.error('❌ Failed to issue ECR credential:', error)
      throw error
    }
  }

  async verifyCredentialChain(
    ecrCredential: any,
    oorCredential: any,
    qviCredential: any
  ): Promise<{
    valid: boolean
    orgLEI: string
    personName: string
    role: string
    spendingLimit?: number
    maxContractValue?: number
    details: any
  }> {
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      console.log('🔍 Verifying credential chain...')

      const ecrValid = await this.client.credentials().verify(ecrCredential)
      if (!ecrValid) {
        throw new Error('ECR credential signature invalid')
      }

      const linkedOORSAID = ecrCredential.sad.e?.auth
      if (linkedOORSAID !== oorCredential.sad.d) {
        throw new Error('ECR does not link to provided OOR credential')
      }

      const oorValid = await this.client.credentials().verify(oorCredential)
      if (!oorValid) {
        throw new Error('OOR credential signature invalid')
      }

      if (oorCredential.sad.i !== qviCredential.sad.a.i) {
        throw new Error('OOR issuer does not match QVI-verified organization')
      }

      const qviValid = await this.client.credentials().verify(qviCredential)
      if (!qviValid) {
        throw new Error('QVI credential signature invalid')
      }

      console.log('✅ Full credential chain verified!')

      return {
        valid: true,
        orgLEI: qviCredential.sad.a.LEI,
        personName: ecrCredential.sad.a.personLegalName,
        role: ecrCredential.sad.a.engagementContextRole,
        spendingLimit: ecrCredential.sad.a.spendingLimit,
        maxContractValue: ecrCredential.sad.a.maxContractValue,
        details: {
          orgName: qviCredential.sad.a.legalName,
          lei: qviCredential.sad.a.LEI,
          personName: ecrCredential.sad.a.personLegalName,
          role: ecrCredential.sad.a.engagementContextRole,
          spendingLimit: ecrCredential.sad.a.spendingLimit,
          maxContractValue: ecrCredential.sad.a.maxContractValue,
        }
      }
    } catch (error) {
      console.error('❌ Credential chain verification failed:', error)
      return {
        valid: false,
        orgLEI: '',
        personName: '',
        role: '',
        details: { error: error.message }
      }
    }
  }

  async getCredentials(aid: string): Promise<any[]> {
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      const credentials = await this.client.credentials().list(aid)
      return credentials
    } catch (error) {
      console.error('❌ Failed to get credentials:', error)
      throw error
    }
  }

  async revokeCredential(credentialSAID: string): Promise<void> {
    await this.ensureClientConnected()
    
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    try {
      console.log(`🗑️ Revoking credential: ${credentialSAID}`)
      await this.client.credentials().revoke(credentialSAID)
      console.log('✅ Credential revoked successfully')
    } catch (error) {
      console.error('❌ Failed to revoke credential:', error)
      throw error
    }
  }

  getControllerAID(): string | null {
    return this.controllerPrefix
  }

  isServiceInitialized(): boolean {
    return this.isInitialized && !!this.client
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up vLEI service...')
    this.client = null
    this.controllerPrefix = null
    this.isInitialized = false
    this.reconnectAttempts = 0
    this.lastOperationTime = 0
  }
}

// Factory function to create vLEI service instances
export function createVLEIService(config: VLEIConfig): VLEIService {
  return new VLEIService(config)
}

// Utility function to generate random bran
export function generateBran(): string {
  return randomPasscode()
}
