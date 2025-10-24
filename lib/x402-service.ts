import { Contract, Keypair, Networks, Transaction, BASE_FEE, Asset, Operation, Server, TransactionBuilder } from '@stellar/stellar-sdk'

export interface X402Config {
  facilitatorUrl: string
  network: 'testnet' | 'mainnet'
  usdcAssetId: string
  horizonUrl: string
}

export interface PaymentParams {
  resource: string
  amount: number
  recipient: string
  token: string
  network: string
  payer?: any
  metadata?: any
}

export interface PaymentResult {
  success: boolean
  txHash?: string
  error?: string
  paymentHeader?: string
}

export interface PaymentRequirements {
  scheme: string
  network: string
  token: string
  amount: number
  recipient: string
  validUntil: number
  metadata?: any
}

export class X402Service {
  private config: X402Config
  private server: any

  constructor(config: X402Config) {
    this.config = config
    try {
      this.server = new Server(config.horizonUrl)
    } catch (error) {
      console.warn('Failed to initialize Stellar Server, using mock mode:', error)
      this.server = null
    }
  }

  /**
   * Initiate X402 payment flow
   */
  async initiatePayment(params: PaymentParams): Promise<PaymentResult> {
    try {
      console.log('💳 Initiating X402 payment:', params)

      // Step 1: Request payment requirements
      const requirements = await this.getPaymentRequirements(params.resource)
      
      if (!requirements) {
        throw new Error('Payment requirements not available')
      }

      // Step 2: Validate payment parameters
      this.validatePaymentParams(params, requirements)

      // Step 3: Create payment transaction
      const paymentTx = await this.createPaymentTransaction(params, requirements)

      // Step 4: Sign and submit transaction
      const result = await this.submitPaymentTransaction(paymentTx, params.payer)

      // Step 5: Create X-PAYMENT header
      const paymentHeader = this.createPaymentHeader(result.txHash, requirements)

      console.log('✅ X402 payment completed:', result.txHash)

      return {
        success: true,
        txHash: result.txHash,
        paymentHeader
      }

    } catch (error) {
      console.error('❌ X402 payment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      }
    }
  }

  /**
   * Get payment requirements from X402 facilitator
   */
  async getPaymentRequirements(resource: string): Promise<PaymentRequirements | null> {
    try {
      console.log(`🔍 Requesting payment requirements for: ${resource}`)

      const response = await fetch(`${this.config.facilitatorUrl}/payment-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resource })
      })

      if (!response.ok) {
        if (response.status === 402) {
          // 402 Payment Required - extract requirements from headers
          const requirements = this.parsePaymentRequiredHeaders(response.headers)
          return requirements
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.requirements

    } catch (error) {
      console.error('Failed to get payment requirements:', error)
      return null
    }
  }

  /**
   * Verify X402 payment
   */
  async verifyPayment(paymentHeader: string, requirements: PaymentRequirements): Promise<boolean> {
    try {
      console.log('🔐 Verifying X402 payment')

      const response = await fetch(`${this.config.facilitatorUrl}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': paymentHeader
        },
        body: JSON.stringify({ requirements })
      })

      return response.ok

    } catch (error) {
      console.error('Payment verification failed:', error)
      return false
    }
  }

  /**
   * Create USDC payment transaction
   */
  private async createPaymentTransaction(
    params: PaymentParams, 
    requirements: PaymentRequirements
  ): Promise<Transaction> {
    if (!this.server) {
      // Mock transaction for development
      console.log('🔧 Creating mock transaction (server not available)')
      return {} as Transaction
    }

    const networkPassphrase = this.config.network === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET

    // Create USDC asset
    const usdcAsset = new Asset('USDC', requirements.recipient)

    // Build payment operation
    const paymentOp = Operation.payment({
      destination: requirements.recipient,
      asset: usdcAsset,
      amount: (requirements.amount / 1000000).toString(), // Convert from micro units
      source: params.payer?.getAddress()
    })

    // Create transaction
    const transaction = new TransactionBuilder(
      await this.getAccount(params.payer?.getAddress()),
      {
        fee: BASE_FEE,
        networkPassphrase
      }
    )
      .addOperation(paymentOp)
      .setTimeout(300)
      .build()

    return transaction
  }

  /**
   * Submit payment transaction
   */
  private async submitPaymentTransaction(
    transaction: Transaction, 
    payer: any
  ): Promise<{ txHash: string }> {
    if (!payer) {
      throw new Error('Payer wallet required for transaction signing')
    }

    if (!this.server) {
      // Mock transaction submission for development
      console.log('🔧 Mock transaction submission (server not available)')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network delay
      return { txHash: `mock_tx_${Date.now()}` }
    }

    // Sign transaction with payer's wallet
    const signedTx = await payer.signTransaction(transaction)

    // Submit to network
    const result = await this.server.submitTransaction(signedTx)

    if (result.successful) {
      return { txHash: result.hash }
    } else {
      throw new Error(`Transaction failed: ${result.extras?.result_codes}`)
    }
  }

  /**
   * Create X-PAYMENT header
   */
  private createPaymentHeader(txHash: string, requirements: PaymentRequirements): string {
    const paymentData = {
      txHash,
      amount: requirements.amount,
      token: requirements.token,
      network: requirements.network,
      timestamp: Date.now()
    }

    // In a real implementation, this would be signed
    return Buffer.from(JSON.stringify(paymentData)).toString('base64')
  }

  /**
   * Parse 402 Payment Required headers
   */
  private parsePaymentRequiredHeaders(headers: Headers): PaymentRequirements {
    const scheme = headers.get('X-PAYMENT-SCHEME') || 'exact'
    const network = headers.get('X-PAYMENT-NETWORK') || 'stellar'
    const token = headers.get('X-PAYMENT-TOKEN') || 'USDC'
    const amount = parseInt(headers.get('X-PAYMENT-AMOUNT') || '0')
    const recipient = headers.get('X-PAYMENT-RECIPIENT') || ''
    const validUntil = parseInt(headers.get('X-PAYMENT-VALID-UNTIL') || '0')

    return {
      scheme,
      network,
      token,
      amount,
      recipient,
      validUntil
    }
  }

  /**
   * Validate payment parameters against requirements
   */
  private validatePaymentParams(params: PaymentParams, requirements: PaymentRequirements): void {
    if (params.amount !== requirements.amount) {
      throw new Error(`Amount mismatch: expected ${requirements.amount}, got ${params.amount}`)
    }

    if (params.token !== requirements.token) {
      throw new Error(`Token mismatch: expected ${requirements.token}, got ${params.token}`)
    }

    if (params.recipient !== requirements.recipient) {
      throw new Error(`Recipient mismatch: expected ${requirements.recipient}, got ${params.recipient}`)
    }

    if (Date.now() > requirements.validUntil) {
      throw new Error('Payment requirements expired')
    }
  }

  /**
   * Get account information
   */
  private async getAccount(address: string) {
    if (!this.server) {
      // Mock account for development
      console.log('🔧 Mock account loading (server not available)')
      return {
        accountId: address,
        sequence: '1234567890'
      }
    }

    try {
      return await this.server.loadAccount(address)
    } catch (error) {
      throw new Error(`Failed to load account ${address}: ${error}`)
    }
  }

  /**
   * Get USDC balance for an account
   */
  async getUSDCBalance(address: string): Promise<number> {
    if (!this.server) {
      // Mock balance for development
      console.log('🔧 Mock USDC balance (server not available)')
      return 1000000000 // 1000 USDC in micro units
    }

    try {
      const account = await this.server.loadAccount(address)
      const usdcAsset = new Asset('USDC', this.config.usdcAssetId)
      
      const balance = account.balances.find((b: any) => 
        b.asset_code === 'USDC' && b.asset_issuer === this.config.usdcAssetId
      )

      return balance ? parseFloat(balance.balance) * 1000000 : 0 // Convert to micro units
    } catch (error) {
      console.error('Failed to get USDC balance:', error)
      return 0
    }
  }

  /**
   * Check if account has sufficient USDC balance
   */
  async hasSufficientBalance(address: string, amount: number): Promise<boolean> {
    const balance = await this.getUSDCBalance(address)
    return balance >= amount
  }
}

// Helper function to create X402 service instance
export function createX402Service(): X402Service {
  const config: X402Config = {
    facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'http://localhost:8080',
    network: (process.env.NEXT_PUBLIC_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    usdcAssetId: process.env.NEXT_PUBLIC_USDC_ASSET_ID || 'GBBD47IF6LXCC7EDU6X6LC4XES3D76GITB4Q5TNWFRJN54H6H6AUDH6A',
    horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org'
  }

  return new X402Service(config)
}
