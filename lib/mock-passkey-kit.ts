// Mock Passkey-Kit implementation for Phase 1
// In Phase 2, this will be replaced with the real passkey-kit package

export interface PasskeyKitConfig {
  rpcUrl: string
  networkPassphrase: string
  factoryContractId: string
}

export interface WalletOptions {
  name: string
  description: string
}

export class PasskeyKit {
  private config: PasskeyKitConfig
  private address: string | null = null
  private contractId: string | null = null

  constructor(config: PasskeyKitConfig) {
    this.config = config
  }

  async connectWallet(options: WalletOptions): Promise<string> {
    // Simulate passkey authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock wallet address
    this.address = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    this.contractId = `C${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    
    console.log(`🔐 Mock Passkey authentication for: ${options.name}`)
    console.log(`📍 Wallet Address: ${this.address}`)
    console.log(`📄 Contract ID: ${this.contractId}`)
    
    return this.contractId
  }

  async createWallet(options: WalletOptions): Promise<string> {
    // Simulate wallet creation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock wallet address
    this.address = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    this.contractId = `C${Math.random().toString(36).substring(2, 15).toUpperCase()}`
    
    console.log(`🆕 Mock wallet created for: ${options.name}`)
    console.log(`📍 Wallet Address: ${this.address}`)
    console.log(`📄 Contract ID: ${this.contractId}`)
    
    return this.contractId
  }

  getAddress(): string {
    if (!this.address) {
      throw new Error('Wallet not connected')
    }
    return this.address
  }

  getContractId(): string {
    if (!this.contractId) {
      throw new Error('Wallet not connected')
    }
    return this.contractId
  }

  async buildTransaction(params: any): Promise<any> {
    // Mock transaction building
    console.log('🔨 Building mock transaction:', params)
    return {
      id: `tx_${Math.random().toString(36).substring(2, 15)}`,
      ...params
    }
  }

  async signTransaction(tx: any): Promise<any> {
    // Simulate passkey signing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✍️ Mock passkey signature applied')
    return {
      ...tx,
      signature: `sig_${Math.random().toString(36).substring(2, 15)}`
    }
  }

  async submitTransaction(signedTx: any): Promise<any> {
    // Simulate blockchain submission delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('📤 Mock transaction submitted to blockchain')
    return {
      hash: `hash_${Math.random().toString(36).substring(2, 15)}`,
      status: 'success',
      ledger: Math.floor(Math.random() * 1000000) + 1000000
    }
  }

  disconnect(): void {
    console.log('🔌 Mock passkey wallet disconnected')
    // Reset the wallet state
    this.walletAddress = null
    this.contractId = null
  }

  async executeTransaction(params: any): Promise<any> {
    console.log('⚡ Mock transaction execution:', params)
    
    // Simulate transaction execution delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate passkey authentication
    console.log('🔐 Mock passkey authentication for transaction')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Mock transaction executed successfully')
    return {
      hash: `tx_${Math.random().toString(36).substring(2, 15)}`,
      status: 'success',
      ledger: Math.floor(Math.random() * 1000000) + 1000000
    }
  }

  async getAccountInfo(): Promise<any> {
    console.log('📊 Mock account info requested')
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      address: this.walletAddress,
      contractId: this.contractId,
      balance: {
        USDC: '1000000000', // 1000 USDC (7 decimals)
        XLM: '10000000000'  // 1000 XLM (7 decimals)
      },
      sequence: Math.floor(Math.random() * 1000000) + 1000000,
      lastModified: Date.now()
    }
  }
}
