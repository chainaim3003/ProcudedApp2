// Real Passkey-Kit Service for Phase 2
// This service manages actual passkey authentication and smart wallet operations

import { PasskeyKit } from 'passkey-kit'
import { Contract, SorobanRpc, Networks, Transaction, BASE_FEE } from '@stellar/stellar-sdk'

export interface PasskeyConfig {
  rpcUrl: string
  networkPassphrase: string
  factoryContractId: string
}

export interface WalletOptions {
  name: string
  description: string
}

export interface TransactionParams {
  contract: Contract
  method: string
  args: any[]
}

export class PasskeyService {
  private passkeyKit: PasskeyKit
  private config: PasskeyConfig
  private address: string | null = null
  private contractId: string | null = null

  constructor(config: PasskeyConfig) {
    this.config = config
    this.passkeyKit = new PasskeyKit(config)
  }

  async connectWallet(options: WalletOptions): Promise<string> {
    try {
      console.log(`🔐 Connecting to wallet: ${options.name}`)
      
      this.contractId = await this.passkeyKit.connectWallet(options)
      this.address = this.passkeyKit.getAddress()
      
      console.log(`✅ Wallet connected successfully`)
      console.log(`📍 Address: ${this.address}`)
      console.log(`📄 Contract ID: ${this.contractId}`)
      
      return this.contractId
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error)
      throw error
    }
  }

  async createWallet(options: WalletOptions): Promise<string> {
    try {
      console.log(`🆕 Creating new wallet: ${options.name}`)
      
      this.contractId = await this.passkeyKit.createWallet(options)
      this.address = this.passkeyKit.getAddress()
      
      console.log(`✅ Wallet created successfully`)
      console.log(`📍 Address: ${this.address}`)
      console.log(`📄 Contract ID: ${this.contractId}`)
      
      return this.contractId
    } catch (error) {
      console.error('❌ Failed to create wallet:', error)
      throw error
    }
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

  async buildTransaction(params: TransactionParams): Promise<Transaction> {
    try {
      console.log(`🔨 Building transaction: ${params.method}`)
      
      const transaction = await this.passkeyKit.buildTransaction(params)
      
      console.log(`✅ Transaction built successfully`)
      return transaction
    } catch (error) {
      console.error('❌ Failed to build transaction:', error)
      throw error
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      console.log(`✍️ Signing transaction with passkey...`)
      
      const signedTransaction = await this.passkeyKit.signTransaction(transaction)
      
      console.log(`✅ Transaction signed successfully`)
      return signedTransaction
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error)
      throw error
    }
  }

  async submitTransaction(signedTransaction: Transaction): Promise<any> {
    try {
      console.log(`📤 Submitting transaction to blockchain...`)
      
      const result = await this.passkeyKit.submitTransaction(signedTransaction)
      
      console.log(`✅ Transaction submitted successfully`)
      console.log(`🔗 Transaction hash: ${result.hash}`)
      console.log(`📊 Ledger: ${result.ledger}`)
      
      return result
    } catch (error) {
      console.error('❌ Failed to submit transaction:', error)
      throw error
    }
  }

  async executeTransaction(params: TransactionParams): Promise<any> {
    try {
      console.log(`🚀 Executing complete transaction flow: ${params.method}`)
      
      // Build transaction
      const transaction = await this.buildTransaction(params)
      
      // Sign transaction
      const signedTransaction = await this.signTransaction(transaction)
      
      // Submit transaction
      const result = await this.submitTransaction(signedTransaction)
      
      return result
    } catch (error) {
      console.error('❌ Failed to execute transaction:', error)
      throw error
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      if (!this.address) {
        throw new Error('Wallet not connected')
      }

      const server = new SorobanRpc.Server(this.config.rpcUrl)
      const account = await server.getAccount(this.address)
      
      return account
    } catch (error) {
      console.error('❌ Failed to get account info:', error)
      throw error
    }
  }

  async getContractData(contractId: string, key: string): Promise<any> {
    try {
      const server = new SorobanRpc.Server(this.config.rpcUrl)
      const contract = new Contract(contractId)
      
      const result = await server.getContractData(contract, key)
      
      return result
    } catch (error) {
      console.error('❌ Failed to get contract data:', error)
      throw error
    }
  }

  async simulateTransaction(params: TransactionParams): Promise<any> {
    try {
      console.log(`🧪 Simulating transaction: ${params.method}`)
      
      const transaction = await this.buildTransaction(params)
      const server = new SorobanRpc.Server(this.config.rpcUrl)
      
      const result = await server.simulateTransaction(transaction)
      
      console.log(`✅ Transaction simulation completed`)
      return result
    } catch (error) {
      console.error('❌ Failed to simulate transaction:', error)
      throw error
    }
  }

  isConnected(): boolean {
    return this.address !== null && this.contractId !== null
  }

  disconnect(): void {
    this.address = null
    this.contractId = null
    console.log('🔌 Wallet disconnected')
  }
}

// Factory function to create PasskeyService instances
export function createPasskeyService(config: PasskeyConfig): PasskeyService {
  return new PasskeyService(config)
}

// Utility function to get default Stellar configuration
export function getDefaultStellarConfig(): PasskeyConfig {
  return {
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
    networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    factoryContractId: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || 'CCWJFJ7YQHZ3QH2GQYQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
  }
}
