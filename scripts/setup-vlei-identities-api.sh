#!/bin/bash

# Configuration parameters (with defaults)
BUYER_ORG_NAME="${1:-BuyerCorp Inc.}"
BUYER_AGENT_NAME="${2:-Buyer Procurement Agent}"
SELLER_ORG_NAME="${3:-SellerCorp LLC}"
SELLER_AGENT_NAME="${4:-Seller Sales Agent}"

echo "========================================"
echo "🔐 vLEI Identity Setup Script (HTTP API)"
echo "========================================"
echo "Buyer Organization: $BUYER_ORG_NAME"
echo "Buyer Agent: $BUYER_AGENT_NAME"
echo "Seller Organization: $SELLER_ORG_NAME"
echo "Seller Agent: $SELLER_AGENT_NAME"
echo "========================================"
echo ""

# Check if KERIA is responding
echo "Checking KERIA connectivity..."
if ! curl -s http://localhost:3901 > /dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to KERIA buyer on port 3901"
    echo "Make sure Docker containers are running: docker ps"
    exit 1
fi

if ! curl -s http://localhost:3904 > /dev/null 2>&1; then
    echo "❌ ERROR: Cannot connect to KERIA seller on port 3904"
    echo "Make sure Docker containers are running: docker ps"
    exit 1
fi

echo "✅ KERIA containers are responding"
echo ""

# Generate random AIDs for demonstration
# In a real setup, these would be created through KERIA API
echo "1️⃣ Generating identity configurations..."

BUYERORG_AID="E$(openssl rand -hex 22 | cut -c1-43)"
BUYER_AGENT_AID="E$(openssl rand -hex 22 | cut -c1-43)"
SELLERORG_AID="E$(openssl rand -hex 22 | cut -c1-43)"
SELLER_AGENT_AID="E$(openssl rand -hex 22 | cut -c1-43)"

echo "Buyer Org AID: $BUYERORG_AID"
echo "Buyer Agent AID: $BUYER_AGENT_AID"
echo "Seller Org AID: $SELLERORG_AID"
echo "Seller Agent AID: $SELLER_AGENT_AID"
echo ""

# Note about this approach
echo "⚠️  NOTE: Using simulated AIDs for development"
echo "   For production, integrate with signify-ts to create real KERI identities"
echo ""

# Export configuration
echo "2️⃣ Creating configuration files..."

mkdir -p ../app/config

# Create identities configuration
cat > ../app/config/identities.json <<EOF
{
  "buyerOrg": {
    "aid": "$BUYERORG_AID",
    "name": "$BUYER_ORG_NAME",
    "keriaEndpoint": "http://localhost:3901",
    "container": "keria-buyer"
  },
  "buyerAgent": {
    "aid": "$BUYER_AGENT_AID",
    "name": "$BUYER_AGENT_NAME",
    "keriaEndpoint": "http://localhost:3901"
  },
  "sellerOrg": {
    "aid": "$SELLERORG_AID",
    "name": "$SELLER_ORG_NAME",
    "keriaEndpoint": "http://localhost:3904",
    "container": "keria-seller"
  },
  "sellerAgent": {
    "aid": "$SELLER_AGENT_AID",
    "name": "$SELLER_AGENT_NAME",
    "keriaEndpoint": "http://localhost:3904"
  },
  "setup": {
    "mode": "development",
    "method": "simulated",
    "verified": false,
    "note": "Development identities - not production vLEI. Use signify-ts for real KERI identities."
  }
}
EOF

# Create a README for next steps
cat > ../app/config/INTEGRATION-GUIDE.md <<EOF
# vLEI Integration Guide

## Current Setup Status

✅ **Configuration Created**: Identity configuration exported to \`identities.json\`
⚠️ **Development Mode**: Using simulated AIDs for development
❌ **Not Production Ready**: Real KERI identities need to be created via signify-ts

## Next Steps for Real Integration

### Option 1: Use Signify-TS (Recommended)

\`\`\`typescript
import { Signify } from 'signify-ts';

// Connect to KERIA
const client = new Signify({
  url: 'http://localhost:3901',
  bootUrl: 'http://localhost:3902'
});

await client.boot();
await client.connect();

// Create identifier
const result = await client.identifiers().create('buyerorg');
const aid = result.i; // This is the real AID

// Update identities.json with real AID
\`\`\`

### Option 2: Use KERIA HTTP API Directly

See: https://weboftrust.github.io/keria/

### Option 3: Continue with Mock for Development

Your current setup is perfect for:
- Building UI/UX
- Testing business logic
- Development and demos

Just add checks in your code:
\`\`\`typescript
if (config.setup.mode === 'development') {
  // Use mock verification
  return mockVerify(aid);
}
\`\`\`

## Development Workflow

1. **Build your app** with current mock identities
2. **Test all features** without real KERI
3. **Add signify-ts** when ready for real identities
4. **Switch mode** from 'development' to 'production'

## Resources

- Signify-TS: https://github.com/WebOfTrust/signify-ts
- KERIA Docs: https://weboftrust.github.io/keria/
- vLEI Ecosystem: https://www.gleif.org/en/vlei/introducing-the-vlei
EOF

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo ""
echo "📋 Identity Configuration:"
echo "  Buyer Org: $BUYERORG_AID"
echo "  Buyer Agent: $BUYER_AGENT_AID"
echo "  Seller Org: $SELLERORG_AID"
echo "  Seller Agent: $SELLER_AGENT_AID"
echo ""
echo "📁 Files Created:"
echo "  - app/config/identities.json"
echo "  - app/config/INTEGRATION-GUIDE.md"
echo ""
echo "🔧 KERIA Endpoints:"
echo "  - Buyer: http://localhost:3901"
echo "  - Seller: http://localhost:3904"
echo ""
echo "📚 Next Steps:"
echo "  1. Review: cat ../app/config/INTEGRATION-GUIDE.md"
echo "  2. Start building your app with these identities"
echo "  3. Integrate signify-ts when ready for real KERI"
echo ""
echo "⚠️  Development Mode: These are simulated AIDs for development"
echo "   For production, integrate with signify-ts library"
echo "========================================"
