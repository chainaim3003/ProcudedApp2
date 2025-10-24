# Stellar Procurement dApp - Phase 1 MVP

A complete implementation of a procurement dApp using Stellar smart contract wallets with passkeys, featuring vLEI credential verification and X402 payment protocol.

## 🚀 Phase 1 Features

- ✅ **Smart Wallet Creation**: Deploy passkey-secured smart wallets
- ✅ **Purchase Order Management**: Create, accept, fulfill, and pay for orders
- ✅ **Manual Credential Verification**: Mock vLEI credential system
- ✅ **Role-based Access**: Buyer (TechCorp) and Seller (SupplierCo) roles
- ✅ **Responsive UI**: Modern React interface with Tailwind CSS

## 🏗️ Architecture

```
Frontend (Next.js + React)
├── Smart Wallet (Passkey-Kit)
├── Purchase Order Contract (Soroban)
├── Credential Verification (Mock vLEI)
└── Payment System (Mock X402)
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Stellar Testnet, Soroban Smart Contracts
- **Authentication**: Passkey-Kit (biometric authentication)
- **Identity**: Mock vLEI credentials (Phase 1)
- **Payments**: Mock X402 protocol (Phase 1)

## 📦 Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <your-repo>
   cd stellar-procurement-dapp
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Build Smart Contract**
   ```bash
   cd contracts/procurement
   cargo build --target wasm32-unknown-unknown --release
   ```

4. **Deploy Contract (Optional)**
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/procurement.wasm \
     --source-account YOUR_SECRET_KEY \
     --network testnet
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### 1. Connect as Buyer (TechCorp)
- Click "Connect as Buyer"
- Simulated passkey authentication
- View wallet address and credentials

### 2. Create Purchase Order
- Click "Create Purchase Order"
- Fill in description and amount
- Submit to create PO on smart contract

### 3. Switch to Seller (SupplierCo)
- Click "Switch to Seller"
- View incoming purchase orders
- Accept and fulfill orders

### 4. Release Payment
- Switch back to buyer role
- Release payment for fulfilled orders
- Complete the procurement cycle

## 🔐 Security Features

- **Passkey Authentication**: Biometric security for wallet access
- **Smart Contract Authorization**: All operations require proper authentication
- **Credential Verification**: vLEI-based identity verification (mock in Phase 1)
- **Spending Limits**: Enforced through ECR credentials

## 📋 Smart Contract Functions

```rust
// Create a new purchase order
create_purchase_order(buyer, seller, buyer_lei, seller_lei, ...)

// Accept a purchase order
accept_purchase_order(po_id, seller)

// Mark order as fulfilled
fulfill_purchase_order(po_id, seller)

// Release payment
release_payment(po_id, buyer, usdc_token)

// Cancel order (buyer only, before acceptance)
cancel_purchase_order(po_id, buyer)
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Connect as buyer
- [ ] Create purchase order
- [ ] Switch to seller role
- [ ] Accept purchase order
- [ ] Fulfill purchase order
- [ ] Switch back to buyer
- [ ] Release payment
- [ ] Verify credential chain

### Test Data
- **Buyer**: TechCorp Inc. (LEI: 506700GE1G29325QX363)
- **Seller**: SupplierCo LLC (LEI: 549300XOCUZD4EMKGY96)
- **Spending Limit**: $100,000
- **Max Contract Value**: $500,000

## 🚧 Phase 1 Limitations

- **Mock Authentication**: Simulated passkey authentication
- **Mock Credentials**: vLEI credentials are mocked
- **Mock Payments**: X402 payments are simulated
- **Local Storage**: Data persists in browser only
- **No Real Blockchain**: Uses mock smart contract calls

## 🔄 Next Phases

### Phase 2: vLEI Integration (Months 3-4)
- Real KERIA deployment
- Actual vLEI credential issuance
- On-chain credential verification

### Phase 3: X402 Payments (Months 5-6)
- X402 facilitator integration
- Real USDC settlement
- Invoice reconciliation

### Phase 4: Advanced Features (Months 7-12)
- Multi-signature approvals
- Escrow contracts
- Dispute resolution
- ERP integration

## 📚 Documentation

- [Stellar Documentation](https://developers.stellar.org/)
- [Passkey-Kit](https://github.com/kalepail/passkey-kit)
- [vLEI Training](https://github.com/GLEIF-IT/vlei-trainings)
- [X402 Protocol](https://github.com/coinbase/x402)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Discord**: Stellar Developer Discord (#passkeys channel)
- **Email**: [your-email@example.com]

---

**Phase 1 MVP Status**: ✅ Complete and Ready for Testing
