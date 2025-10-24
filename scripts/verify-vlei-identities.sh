#!/bin/bash

echo "========================================"
echo "🔍 vLEI Identity Verification Script"
echo "========================================"
echo ""

# Function to check if an identity exists
check_identity() {
    local name=$1
    local alias=$2
    
    echo "Checking $name (alias: $alias)..."
    
    if kli status --name "$name" --alias "$alias" 2>/dev/null | grep -q "Identifier:"; then
        local aid=$(kli status --name "$name" --alias "$alias" | grep "Identifier:" | awk '{print $2}')
        echo "  ✅ Found: $aid"
        return 0
    else
        echo "  ❌ Not found"
        return 1
    fi
}

# Function to check credentials
check_credentials() {
    local name=$1
    local alias=$2
    
    echo "Checking credentials for $name..."
    
    local issued=$(kli vc list --name "$name" --alias "$alias" --issued 2>/dev/null | wc -l)
    local received=$(kli vc list --name "$name" --alias "$alias" --received 2>/dev/null | wc -l)
    
    if [ "$issued" -gt 0 ] || [ "$received" -gt 0 ]; then
        echo "  ✅ Issued: $issued, Received: $received"
        return 0
    else
        echo "  ❌ No credentials found"
        return 1
    fi
}

# Verify organizational identities
echo "1️⃣ Organizational Identities"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_identity "buyerorg" "buyerorg-le"
check_identity "sellerorg" "sellerorg-le"
echo ""

# Verify agent identities
echo "2️⃣ Agent Identities"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_identity "buyer-agent" "buyer-agent-id"
check_identity "seller-agent" "seller-agent-id"
echo ""

# Verify credentials
echo "3️⃣ Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_credentials "buyerorg" "buyerorg-le"
check_credentials "sellerorg" "sellerorg-le"
echo ""

# Check exported files
echo "4️⃣ Exported Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
files=(
    "../app/config/buyer-ecr.json"
    "../app/config/seller-ecr.json"
    "../app/config/identities.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done
echo ""

# Display identities.json if it exists
if [ -f "../app/config/identities.json" ]; then
    echo "5️⃣ Identities Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat ../app/config/identities.json | jq '.' 2>/dev/null || cat ../app/config/identities.json
    echo ""
fi

echo "========================================"
echo "✅ Verification Complete!"
echo "========================================"
