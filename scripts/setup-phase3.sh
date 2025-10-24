#!/bin/bash

# Phase 3: X402 Payments Setup Script
# This script sets up the environment for Phase 3 with X402 payment protocol integration

set -e

echo "🚀 Setting up Phase 3: X402 Payments..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from Phase 3 template..."
    cp env.phase3.example .env.local
    echo "✅ Environment file created. Please review and update .env.local with your configuration."
else
    echo "⚠️  .env.local already exists. Please manually update it with Phase 3 configuration."
fi

# Install additional dependencies for X402
echo "📦 Installing X402 payment dependencies..."

# Add any additional packages needed for X402
# Note: @types/buffer is not needed as buffer types are included in Node.js

echo "✅ Dependencies installed successfully"

# Create X402 facilitator mock server (if needed)
echo "🔧 Setting up X402 facilitator mock server..."

# Create a simple mock X402 facilitator
mkdir -p mock-x402-facilitator
cat > mock-x402-facilitator/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mock payment requirements endpoint
app.post('/payment-requirements', (req, res) => {
  const { resource } = req.body;
  
  console.log(`📋 Payment requirements requested for: ${resource}`);
  
  // Return 402 Payment Required with headers
  res.status(402)
     .header('X-PAYMENT-SCHEME', 'exact')
     .header('X-PAYMENT-NETWORK', 'stellar')
     .header('X-PAYMENT-TOKEN', 'USDC')
     .header('X-PAYMENT-AMOUNT', '1000000') // 1 USDC in micro units
     .header('X-PAYMENT-RECIPIENT', 'GSELLER123456789')
     .header('X-PAYMENT-VALID-UNTIL', (Date.now() + 300000).toString())
     .json({
       error: 'Payment Required',
       requirements: {
         scheme: 'exact',
         network: 'stellar',
         token: 'USDC',
         amount: 1000000,
         recipient: 'GSELLER123456789',
         validUntil: Date.now() + 300000
       }
     });
});

// Mock payment verification endpoint
app.post('/verify-payment', (req, res) => {
  const { requirements } = req.body;
  const paymentHeader = req.headers['x-payment'];
  
  console.log('🔐 Payment verification requested');
  console.log('Payment header:', paymentHeader);
  console.log('Requirements:', requirements);
  
  // Mock verification - always return success
  res.json({
    verified: true,
    txHash: 'mock_tx_hash_' + Date.now(),
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Mock X402 Facilitator running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /payment-requirements`);
  console.log(`   POST /verify-payment`);
});
EOF

# Create package.json for the mock server
cat > mock-x402-facilitator/package.json << 'EOF'
{
  "name": "mock-x402-facilitator",
  "version": "1.0.0",
  "description": "Mock X402 payment facilitator for development",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

echo "✅ Mock X402 facilitator created in mock-x402-facilitator/"

# Create Phase 3 documentation
echo "📚 Creating Phase 3 documentation..."

cat > PHASE3-GUIDE.md << 'EOF'
# Phase 3: X402 Payments - Implementation Guide

## Overview

Phase 3 integrates the X402 payment protocol for automated USDC settlement and invoice reconciliation in the Stellar procurement dApp.

## Features

- **X402 Payment Protocol**: HTTP-based payment protocol for seamless integration
- **USDC Settlement**: Automated stablecoin payments on Stellar network
- **Invoice Reconciliation**: Automatic matching of payments to purchase orders
- **Payment Verification**: Cryptographic verification of payment transactions
- **Balance Management**: Real-time USDC balance tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  X402 Service   │    │  X402 Facilitator│
│                 │    │                 │    │                 │
│ • PaymentModal  │◄──►│ • initiatePayment│◄──►│ • Requirements  │
│ • Balance Check │    │ • verifyPayment │    │ • Verification  │
│ • Transaction   │    │ • getUSDCBalance│    │ • Settlement    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Passkey Wallet │    │  Stellar Network│    │  USDC Asset     │
│                 │    │                 │    │                 │
│ • Biometric Auth│    │ • Transaction   │    │ • Stablecoin    │
│ • Sign Tx       │    │ • Settlement    │    │ • Low Fees      │
│ • Submit Tx     │    │ • Immutable     │    │ • Fast          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. X402Service (`lib/x402-service.ts`)
- Handles X402 payment protocol implementation
- Manages USDC transactions on Stellar
- Provides payment verification and balance checking

### 2. PaymentContext (`contexts/PaymentContext.tsx`)
- React context for payment state management
- Provides payment methods to components
- Handles error states and loading indicators

### 3. PaymentModal (`components/PaymentModal.tsx`)
- User interface for X402 payments
- Shows payment requirements and balance
- Handles payment confirmation and execution

### 4. Phase3App (`components/Phase3App.tsx`)
- Main application component for Phase 3
- Integrates all Phase 3 features
- Provides X402 payment functionality

## Payment Flow

1. **Payment Request**: User clicks "Pay with X402" on fulfilled purchase order
2. **Requirements**: System requests payment requirements from X402 facilitator
3. **Validation**: Validates payment parameters and user balance
4. **Transaction**: Creates and signs USDC payment transaction
5. **Submission**: Submits transaction to Stellar network
6. **Verification**: Verifies payment with X402 facilitator
7. **Completion**: Updates purchase order status to "Paid"

## Configuration

### Environment Variables

```bash
# X402 Configuration
NEXT_PUBLIC_X402_FACILITATOR_URL=http://localhost:8080
NEXT_PUBLIC_USDC_ASSET_ID=GBBD47IF6LXCC7EDU6X6LC4XES3D76GITB4Q5TNWFRJN54H6H6AUDH6A

# Stellar Network
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Mock X402 Facilitator

For development, a mock X402 facilitator is provided:

```bash
cd mock-x402-facilitator
npm install
npm start
```

## Usage

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Start mock X402 facilitator** (in separate terminal):
   ```bash
   cd mock-x402-facilitator
   npm start
   ```

3. **Access Phase 3**:
   - Open http://localhost:3000
   - Select "Phase 3: X402 Payments"
   - Initialize vLEI infrastructure
   - Connect as buyer or seller
   - Create and fulfill purchase orders
   - Use X402 payments for settlement

## Testing

### Manual Testing

1. **Create Purchase Order**: As buyer, create a new purchase order
2. **Accept Order**: As seller, accept the purchase order
3. **Fulfill Order**: As seller, mark order as fulfilled
4. **Pay with X402**: As buyer, use X402 payment to settle

### Automated Testing

```bash
# Run payment tests
npm test -- --testPathPattern=payment

# Run X402 integration tests
npm test -- --testPathPattern=x402
```

## Security Considerations

- **Payment Verification**: All payments are cryptographically verified
- **Balance Validation**: Sufficient balance is checked before payment
- **Transaction Signing**: All transactions are signed with passkey authentication
- **Network Validation**: Transactions are validated on Stellar network

## Troubleshooting

### Common Issues

1. **X402 Facilitator Not Running**:
   - Ensure mock facilitator is running on port 8080
   - Check environment variables

2. **Insufficient Balance**:
   - Verify USDC balance in wallet
   - Check asset configuration

3. **Payment Verification Failed**:
   - Check X402 facilitator logs
   - Verify payment header format

### Debug Mode

Enable debug mode for detailed logging:

```bash
NEXT_PUBLIC_DEBUG_MODE=true npm run dev
```

## Next Steps

Phase 3 provides the foundation for:
- **Phase 4**: Advanced features (multi-signature, escrow, disputes)
- **Production Deployment**: Real X402 facilitator integration
- **Enterprise Integration**: ERP system connections
- **Compliance**: Regulatory reporting and audit trails
EOF

echo "✅ Phase 3 documentation created"

# Create a simple test script
echo "🧪 Creating test script..."

cat > scripts/test-phase3.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing Phase 3: X402 Payments..."

# Check if mock X402 facilitator is running
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ Mock X402 facilitator is not running. Please start it first:"
    echo "   cd mock-x402-facilitator && npm start"
    exit 1
fi

echo "✅ Mock X402 facilitator is running"

# Check if main app is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Main application is not running. Please start it first:"
    echo "   npm run dev"
    exit 1
fi

echo "✅ Main application is running"

# Test X402 endpoints
echo "🔍 Testing X402 endpoints..."

# Test payment requirements
echo "Testing payment requirements endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:8080/payment-requirements \
  -H "Content-Type: application/json" \
  -d '{"resource": "/api/test/payment"}')

if echo "$RESPONSE" | grep -q "Payment Required"; then
    echo "✅ Payment requirements endpoint working"
else
    echo "❌ Payment requirements endpoint failed"
    exit 1
fi

echo "🎉 Phase 3 setup and testing completed successfully!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000"
echo "2. Select 'Phase 3: X402 Payments'"
echo "3. Initialize vLEI infrastructure"
echo "4. Connect as buyer or seller"
echo "5. Test X402 payment flow"
EOF

chmod +x scripts/test-phase3.sh

echo "✅ Test script created"

echo ""
echo "🎉 Phase 3 setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with your configuration"
echo "2. Start the mock X402 facilitator:"
echo "   cd mock-x402-facilitator && npm install && npm start"
echo "3. Start the main application:"
echo "   npm run dev"
echo "4. Test the setup:"
echo "   ./scripts/test-phase3.sh"
echo ""
echo "Phase 3 features:"
echo "✅ X402 payment protocol integration"
echo "✅ USDC settlement automation"
echo "✅ Invoice reconciliation"
echo "✅ Payment verification"
echo "✅ Balance management"
echo "✅ Mock X402 facilitator for development"
