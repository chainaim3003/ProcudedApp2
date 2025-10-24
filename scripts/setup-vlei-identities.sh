#!/bin/bash

# Configuration parameters (with defaults)
BUYER_ORG_NAME="${1:-BuyerCorp Inc.}"
BUYER_AGENT_NAME="${2:-Buyer Procurement Agent}"
SELLER_ORG_NAME="${3:-SellerCorp LLC}"
SELLER_AGENT_NAME="${4:-Seller Sales Agent}"

echo "========================================"
echo "🔐 vLEI Identity Setup Script (Docker)"
echo "========================================"
echo "Buyer Organization: $BUYER_ORG_NAME"
echo "Buyer Agent: $BUYER_AGENT_NAME"
echo "Seller Organization: $SELLER_ORG_NAME"
echo "Seller Agent: $SELLER_AGENT_NAME"
echo "========================================"
echo ""

# Step 1: Create organizational identities
echo "1️⃣ Creating organizational identities..."

# Create buyerorg
echo "Creating buyer organization..."
docker exec keria-buyer sh -c "kli init --name buyerorg --salt 0AByMNhtL5_M7zy7RKrE5KmL --nopasscode --config-dir /usr/local/var/keri 2>&1"
echo "Incepting buyer organization..."
docker exec keria-buyer sh -c "echo '' | kli incept --name buyerorg --alias buyerorg-le 2>&1"

sleep 2

# Create sellerorg
echo "Creating seller organization..."
docker exec keria-seller sh -c "kli init --name sellerorg --salt 0AByMNhtL5_M7zy7RKrE5KmM --nopasscode --config-dir /usr/local/var/keri 2>&1"
echo "Incepting seller organization..."
docker exec keria-seller sh -c "echo '' | kli incept --name sellerorg --alias sellerorg-le 2>&1"

sleep 2

# Step 2: Create agent identities
echo ""
echo "2️⃣ Creating agent identities..."

# Create buyer-agent
echo "Creating buyer agent..."
docker exec keria-buyer sh -c "kli init --name buyer-agent --salt 0AByMNhtL5_M7zy7RKrE5KmN --nopasscode --config-dir /usr/local/var/keri 2>&1"
echo "Incepting buyer agent..."
docker exec keria-buyer sh -c "echo '' | kli incept --name buyer-agent --alias buyer-agent-id 2>&1"

sleep 2

# Create seller-agent
echo "Creating seller agent..."
docker exec keria-seller sh -c "kli init --name seller-agent --salt 0AByMNhtL5_M7zy7RKrE5KmO --nopasscode --config-dir /usr/local/var/keri 2>&1"
echo "Incepting seller agent..."
docker exec keria-seller sh -c "echo '' | kli incept --name seller-agent --alias seller-agent-id 2>&1"

sleep 2

# Step 3: Get AIDs
echo ""
echo "3️⃣ Retrieving AIDs..."
BUYERORG_AID=$(docker exec keria-buyer kli status --name buyerorg --alias buyerorg-le 2>/dev/null | grep "Identifier:" | awk '{print $2}')
SELLERORG_AID=$(docker exec keria-seller kli status --name sellerorg --alias sellerorg-le 2>/dev/null | grep "Identifier:" | awk '{print $2}')
BUYER_AGENT_AID=$(docker exec keria-buyer kli status --name buyer-agent --alias buyer-agent-id 2>/dev/null | grep "Identifier:" | awk '{print $2}')
SELLER_AGENT_AID=$(docker exec keria-seller kli status --name seller-agent --alias seller-agent-id 2>/dev/null | grep "Identifier:" | awk '{print $2}')

echo "Buyer Org AID: $BUYERORG_AID"
echo "Seller Org AID: $SELLERORG_AID"
echo "Buyer Agent AID: $BUYER_AGENT_AID"
echo "Seller Agent AID: $SELLER_AGENT_AID"

# Check if AIDs were created successfully
if [ -z "$BUYERORG_AID" ] || [ -z "$SELLERORG_AID" ] || [ -z "$BUYER_AGENT_AID" ] || [ -z "$SELLER_AGENT_AID" ]; then
    echo ""
    echo "❌ ERROR: Failed to create one or more identities"
    echo ""
    echo "Checking what identities exist..."
    echo "Buyer container:"
    docker exec keria-buyer kli list 2>&1
    echo ""
    echo "Seller container:"
    docker exec keria-seller kli list 2>&1
    exit 1
fi

# Step 4: Export configuration
echo ""
echo "4️⃣ Creating configuration files..."

mkdir -p ../app/config

# Create identities configuration
cat > ../app/config/identities.json <<EOF
{
  "buyerOrg": {
    "aid": "$BUYERORG_AID",
    "name": "$BUYER_ORG_NAME",
    "container": "keria-buyer",
    "ports": "3901-3903"
  },
  "buyerAgent": {
    "aid": "$BUYER_AGENT_AID",
    "name": "$BUYER_AGENT_NAME",
    "container": "keria-buyer"
  },
  "sellerOrg": {
    "aid": "$SELLERORG_AID",
    "name": "$SELLER_ORG_NAME",
    "container": "keria-seller",
    "ports": "3904-3906"
  },
  "sellerAgent": {
    "aid": "$SELLER_AGENT_AID",
    "name": "$SELLER_AGENT_NAME",
    "container": "keria-seller"
  },
  "mode": "development",
  "verified": false,
  "note": "Self-signed identities - not production vLEI"
}
EOF

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo ""
echo "📋 Summary:"
echo "  Buyer Org (buyerorg): $BUYERORG_AID"
echo "  Buyer Agent: $BUYER_AGENT_AID"
echo "  Seller Org (sellerorg): $SELLERORG_AID"
echo "  Seller Agent: $SELLER_AGENT_AID"
echo ""
echo "📁 Configuration exported to:"
echo "  - app/config/identities.json"
echo ""
echo "🔧 KERIA Endpoints:"
echo "  - Buyer: http://localhost:3901"
echo "  - Seller: http://localhost:3904"
echo ""
echo "ℹ️  Note: This is a development setup without GLEIF credentials"
echo "   For production vLEI, you'll need proper GLEIF QVI integration"
echo ""
echo "🚀 You can now use these AIDs in your application!"
echo "========================================"
