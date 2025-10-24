# 🚀 Phase 2: vLEI Integration Guide

## Overview

Phase 2 replaces the mock implementations from Phase 1 with real vLEI infrastructure using KERIA agents, actual Passkey-Kit integration, and on-chain credential verification.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PHASE 2 FRONTEND                                │
│  (React + TypeScript + Real Passkey-Kit + Real Signify-TS)         │
└───────────────┬─────────────────────────────────┬──────────────────┘
                │                                 │
    ┌───────────▼──────────┐         ┌───────────▼──────────┐
    │  BUYER SMART WALLET  │         │ SELLER SMART WALLET  │
    │  (Real Passkey-Kit)  │         │  (Real Passkey-Kit)  │
    │  + Real vLEI         │         │  + Real vLEI         │
    └───────────┬──────────┘         └───────────┬──────────┘
                │                                 │
    ┌───────────▼──────────┐         ┌───────────▼──────────┐
    │   KERIA AGENT        │         │   KERIA AGENT        │
    │   (TechCorp)         │         │   (SupplierCo)       │
    └───────────┬──────────┘         └───────────┬──────────┘
                │                                 │
                └───────────┬─────────────────────┘
                            │
                ┌───────────▼──────────────────────┐
                │    STELLAR NETWORK (Testnet)     │
                │  - Smart Contract Wallets        │
                │  - Procurement Smart Contracts   │
                │  - On-chain Credential Verification │
                └───────────┬──────────────────────┘
                            │
                ┌───────────▼──────────────────────┐
                │  REAL vLEI CREDENTIAL SYSTEM     │
                │  - KERIA Agents                  │
                │  - QVI Credentials (GLEIF)       │
                │  - OOR Credentials               │
                │  - ECR Credentials               │
                └──────────────────────────────────┘
```

## 🛠️ Technology Stack

### New in Phase 2
- **Real Passkey-Kit**: Actual biometric authentication
- **Real Signify-TS**: vLEI credential management
- **KERIA Agents**: Multi-tenant credential infrastructure
- **On-chain Verification**: Smart contract credential validation
- **Docker Infrastructure**: Containerized KERIA deployment

### Infrastructure
- **KERIA Agents**: TechCorp, SupplierCo, GLEIF QVI
- **Witness Network**: 3 witness nodes for credential verification
- **Redis**: State management for KERIA agents
- **Docker Compose**: Orchestrated deployment

## 📦 Installation & Setup

### 1. Prerequisites
```bash
# Required software
- Docker & Docker Compose
- Node.js 18+
- Rust (for smart contracts)
- Git
```

### 2. Setup Phase 2
```bash
# Run the Phase 2 setup script
./scripts/setup-phase2.sh

# This will:
# - Install dependencies
# - Start KERIA infrastructure
# - Build smart contracts
# - Verify services
```

### 3. Environment Configuration
```bash
# Copy Phase 2 environment template
cp env.phase2.example .env.local

# Update with your configuration
# Key settings:
NEXT_PUBLIC_PHASE2_MODE=true
NEXT_PUBLIC_VLEI_ENABLED=true
NEXT_PUBLIC_PASSKEY_ENABLED=true
```

## 🚀 Usage

### 1. Start the Application
```bash
# Start KERIA infrastructure
docker-compose up -d

# Start the application
npm run dev

# Open browser
open http://localhost:3000
```

### 2. Initialize vLEI Infrastructure
1. Click "Phase 2: vLEI Integration" tab
2. Click "Initialize vLEI Infrastructure"
3. Wait for KERIA agents to connect
4. Wait for credentials to be issued

### 3. Connect Wallet
1. Click "Connect as Buyer (TechCorp)" or "Connect as Seller (SupplierCo)"
2. Use your device's biometric authentication (Face ID, Touch ID, etc.)
3. Verify vLEI credentials are loaded

### 4. Create Purchase Order
1. Click "Create Purchase Order"
2. Fill in details (amount will be validated against ECR spending limit)
3. Submit transaction (signed with passkey)
4. Smart contract verifies credentials on-chain

## 🔐 Security Features

### Real Passkey Authentication
- **Biometric Security**: Face ID, Touch ID, Windows Hello
- **Hardware Security**: Secure Enclave, TPM
- **Phishing Resistant**: Domain-bound credentials
- **No Private Keys**: Keys never leave device

### Real vLEI Credentials
- **Cryptographic Proofs**: ECDSA signatures
- **Immutable Audit Trail**: KEL (Key Event Log)
- **Witness Network**: Distributed verification
- **Revocation Support**: Credentials can be revoked

### On-chain Verification
- **Smart Contract Validation**: Credentials verified on-chain
- **Spending Limits**: Enforced by ECR credentials
- **Authorization Checks**: All operations require valid credentials
- **Audit Trail**: All transactions recorded on blockchain

## 📊 KERIA Services

### Service Endpoints
- **TechCorp Agent**: http://localhost:3901
- **SupplierCo Agent**: http://localhost:3904
- **GLEIF QVI Agent**: http://localhost:3906
- **Redis**: localhost:6379

### Service Management
```bash
# View service status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] KERIA agents start successfully
- [ ] vLEI infrastructure initializes
- [ ] Credentials are issued (QVI, OOR, ECR)
- [ ] Passkey authentication works
- [ ] Wallet connects with real credentials
- [ ] Purchase order creation with credential verification
- [ ] On-chain credential validation
- [ ] Role switching maintains credentials
- [ ] Transaction signing with passkey

### Test Scenarios

#### Scenario 1: Complete vLEI Flow
1. Initialize vLEI infrastructure
2. Verify all credentials are issued
3. Connect as buyer with passkey
4. Create PO (verify spending limit enforcement)
5. Switch to seller role
6. Accept PO (verify credential chain)
7. Complete transaction flow

#### Scenario 2: Credential Verification
1. View credential verification panel
2. Verify QVI → OOR → ECR chain
3. Check spending limits and authorities
4. Test credential revocation (if implemented)

#### Scenario 3: Security Testing
1. Test with invalid credentials
2. Test spending limit enforcement
3. Test passkey authentication failure
4. Test network connectivity issues

## 🔧 Development

### Key Components

#### VLEIService (`lib/vlei-service.ts`)
- Manages KERIA agent connections
- Issues and verifies credentials
- Handles credential chains

#### PasskeyService (`lib/passkey-service.ts`)
- Real Passkey-Kit integration
- Smart wallet operations
- Transaction signing and submission

#### VLEIContext (`contexts/VLEIContext.tsx`)
- vLEI state management
- Credential lifecycle
- Service coordination

#### PasskeyWalletContext (`contexts/PasskeyWalletContext.tsx`)
- Real wallet management
- Passkey authentication
- Transaction execution

### Smart Contract Updates
- Added credential verification functions
- On-chain spending limit enforcement
- Credential status checking
- Enhanced event logging

## 🐛 Troubleshooting

### Common Issues

#### KERIA Agents Not Starting
```bash
# Check Docker status
docker ps

# Check logs
docker-compose logs keria-techcorp

# Restart services
docker-compose down && docker-compose up -d
```

#### Passkey Authentication Fails
- Ensure device supports WebAuthn
- Check browser compatibility
- Verify HTTPS (required for passkeys)
- Check browser permissions

#### Credential Verification Fails
- Verify KERIA agents are running
- Check network connectivity
- Verify credential schemas
- Check witness network status

#### Smart Contract Errors
- Verify contract deployment
- Check transaction parameters
- Verify credential SAIDs
- Check spending limits

### Debug Tools
- **Debug Panel**: Real-time state monitoring
- **Console Logs**: Detailed operation logging
- **Docker Logs**: KERIA agent logs
- **Network Tab**: API call monitoring

## 📈 Performance

### Optimization Tips
- Use Redis for KERIA state management
- Implement credential caching
- Optimize witness network queries
- Use connection pooling

### Monitoring
- KERIA agent health checks
- Credential verification metrics
- Transaction success rates
- Passkey authentication times

## 🔄 Migration from Phase 1

### Data Migration
- Purchase orders remain compatible
- Wallet states need re-initialization
- Credentials need to be re-issued
- localStorage data can be preserved

### Code Changes
- Replace mock services with real implementations
- Update context providers
- Add credential verification logic
- Update smart contract calls

## 🚀 Next Steps (Phase 3)

### Planned Features
- X402 payment protocol integration
- Real USDC settlement
- Invoice reconciliation
- Advanced dispute resolution

### Infrastructure Improvements
- Production KERIA deployment
- Witness network scaling
- Credential registry optimization
- Performance monitoring

---

## 📚 Resources

### Documentation
- [KERIA Documentation](https://github.com/WebOfTrust/keria)
- [Passkey-Kit Documentation](https://github.com/kalepail/passkey-kit)
- [vLEI Training](https://github.com/GLEIF-IT/vlei-trainings)
- [Stellar Smart Contracts](https://developers.stellar.org/docs/smart-contracts)

### Community
- **Stellar Discord**: #passkeys channel
- **WebOfTrust Discord**: KERI/vLEI discussions
- **GitHub Issues**: Report bugs and feature requests

---

**Phase 2 Status**: ✅ Complete and Ready for Testing

The vLEI integration provides a production-ready foundation for verifiable organizational credentials with real biometric authentication and on-chain verification.
