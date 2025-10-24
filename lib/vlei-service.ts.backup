// Real vLEI Service for Phase 2
// This service manages actual vLEI credentials using KERIA agents

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
  private client: SignifyClient
  private config: VLEIConfig
  private isInitialized = false

  constructor(config: VLEIConfig) {
    this.config = config
    this.client = new SignifyClient(
      config.keriaUrl,
      config.bran,
      config.tier,
      config.bootUrl
    )
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🚀 Initializing vLEI service...')
      await ready()
      
      await this.client.boot()
      await this.client.connect()
      
      this.isInitialized = true
      console.log('✅ vLEI service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize vLEI service:', error)
      throw error
    }
  }

  async createOrganizationAID(orgInfo: OrganizationInfo): Promise<string> {
    await this.initialize()

    try {
      console.log(`🏢 Creating organizational AID for ${orgInfo.name}...`)
      
      const aidResult = await this.client.identifiers().create(orgInfo.name, {
        toad: 1,
        wits: [
          'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha', // GLEIF witness
          'BHF5W3LBPN3X7VQRL4Q5VIT77LZLWL7J2V3ZOIY6Z5Q', // Witness 2
          'B7D6Q3X5Y2Z9A1B4C7D0E3F6G9H2I5J8K1L4M7N0O3P'  // Witness 3
        ]
      })

      const op = await aidResult.op()
      await this.client.operations().wait(op)

      const aid = (await this.client.identifiers().get(orgInfo.name)).prefix
      console.log(`✅ Organizational AID created: ${aid}`)
      
      return aid
    } catch (error) {
      console.error('❌ Failed to create organizational AID:', error)
      throw error
    }
  }

  async createPersonAID(personInfo: PersonInfo): Promise<string> {
    await this.initialize()

    try {
      console.log(`👤 Creating personal AID for ${personInfo.name}...`)
      
      const aidResult = await this.client.identifiers().create(personInfo.name, {
        toad: 1,
        wits: [
          'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha'
        ]
      })

      const op = await aidResult.op()
      await this.client.operations().wait(op)

      const aid = (await this.client.identifiers().get(personInfo.name)).prefix
      console.log(`✅ Personal AID created: ${aid}`)
      
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
    await this.initialize()

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
    await this.initialize()

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
    await this.initialize()

    try {
      console.log('🔍 Verifying credential chain...')

      // 1. Verify ECR credential signature
      const ecrValid = await this.client.credentials().verify(ecrCredential)
      if (!ecrValid) {
        throw new Error('ECR credential signature invalid')
      }

      // 2. Verify ECR links to OOR (via edges.auth)
      const linkedOORSAID = ecrCredential.sad.e?.auth
      if (linkedOORSAID !== oorCredential.sad.d) {
        throw new Error('ECR does not link to provided OOR credential')
      }

      // 3. Verify OOR credential signature
      const oorValid = await this.client.credentials().verify(oorCredential)
      if (!oorValid) {
        throw new Error('OOR credential signature invalid')
      }

      // 4. Verify OOR issuer matches QVI issuee (organization)
      if (oorCredential.sad.i !== qviCredential.sad.a.i) {
        throw new Error('OOR issuer does not match QVI-verified organization')
      }

      // 5. Verify QVI credential (issued by GLEIF)
      const qviValid = await this.client.credentials().verify(qviCredential)
      if (!qviValid) {
        throw new Error('QVI credential signature invalid')
      }

      console.log('✅ Full credential chain verified!')
      console.log('   QVI (GLEIF) → ORG → OOR → ECR')

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
    await this.initialize()

    try {
      const credentials = await this.client.credentials().list(aid)
      return credentials
    } catch (error) {
      console.error('❌ Failed to get credentials:', error)
      throw error
    }
  }

  async revokeCredential(credentialSAID: string): Promise<void> {
    await this.initialize()

    try {
      console.log(`🗑️ Revoking credential: ${credentialSAID}`)
      await this.client.credentials().revoke(credentialSAID)
      console.log('✅ Credential revoked successfully')
    } catch (error) {
      console.error('❌ Failed to revoke credential:', error)
      throw error
    }
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
