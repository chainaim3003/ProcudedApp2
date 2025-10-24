# vLEI Identity Setup - Naming Convention Changes

## 📋 Complete Naming Changes Reference

This document outlines all naming changes from the previous version to the new version.

---

## 🏢 Organizational Identities

### Old Names → New Names

| Component | Old Name | New Name |
|-----------|----------|----------|
| **Buyer Organization** |
| KLI name | `techcorp` | `buyerorg` |
| Alias | `techcorp-le` | `buyerorg-le` |
| Config file | `techcorp-config.json` | `buyerorg-config.json` |
| Registry | `techcorp-registry` | `buyerorg-registry` |
| **Seller Organization** |
| KLI name | `supplierco` | `sellerorg` |
| Alias | `supplierco-le` | `sellerorg-le` |
| Config file | `supplierco-config.json` | `sellerorg-config.json` |
| Registry | `supplierco-registry` | `sellerorg-registry` |

---

## 👤 Agent Identities

| Component | Old Name | New Name |
|-----------|----------|----------|
| **Buyer Agent** |
| KLI name | `buyer-agent` | `buyer-agent` *(unchanged)* |
| Alias | `buyer-agent-id` | `buyer-agent-id` *(unchanged)* |
| Config file | `buyer-agent-config.json` | `buyer-agent-config.json` *(unchanged)* |
| **Seller Agent** |
| KLI name | `seller-agent` | `seller-agent` *(unchanged)* |
| Alias | `seller-agent-id` | `seller-agent-id` *(unchanged)* |
| Config file | `seller-agent-config.json` | `seller-agent-config.json` *(unchanged)* |

---

## 📁 File and Export Changes

### Configuration Files

| Old Filename | New Filename |
|--------------|--------------|
| `techcorp-config.json` | `buyerorg-config.json` |
| `supplierco-config.json` | `sellerorg-config.json` |

### Exported Credentials

| Type | Filename | Description |
|------|----------|-------------|
| Buyer ECR | `app/config/buyer-ecr.json` | *(unchanged)* |
| Seller ECR | `app/config/seller-ecr.json` | *(unchanged)* |
| Identities | `app/config/identities.json` | *(unchanged)* |

---

## 🔧 KLI Command Examples

### Before (Old Names)

```bash
# Buyer organization
kli init --name techcorp --salt 0ABC... --nopasscode
kli incept --name techcorp --alias techcorp-le --file techcorp-config.json
kli vc registry incept --name techcorp --alias techcorp-le --registry-name techcorp-registry

# Seller organization
kli init --name supplierco --salt 0XYZ... --nopasscode
kli incept --name supplierco --alias supplierco-le --file supplierco-config.json
kli vc registry incept --name supplierco --alias supplierco-le --registry-name supplierco-registry
```

### After (New Names)

```bash
# Buyer organization
kli init --name buyerorg --salt 0ABC... --nopasscode
kli incept --name buyerorg --alias buyerorg-le --file buyerorg-config.json
kli vc registry incept --name buyerorg --alias buyerorg-le --registry-name buyerorg-registry

# Seller organization
kli init --name sellerorg --salt 0XYZ... --nopasscode
kli incept --name sellerorg --alias sellerorg-le --file sellerorg-config.json
kli vc registry incept --name sellerorg --alias sellerorg-le --registry-name sellerorg-registry
```

---

## 🗂️ Environment Variables and AIDs

### Variable Name Changes

| Old Variable | New Variable |
|--------------|--------------|
| `TECHCORP_AID` | `BUYERORG_AID` |
| `SUPPLIERCO_AID` | `SELLERORG_AID` |
| `TECHCORP_OOBI` | `BUYERORG_OOBI` |
| `SUPPLIERCO_OOBI` | `SELLERORG_OOBI` |

---

## 📊 identities.json Structure Comparison

### Before

```json
{
  "buyerOrg": {
    "aid": "$TECHCORP_AID",
    "name": "TechCorp Inc."
  },
  "sellerOrg": {
    "aid": "$SUPPLIERCO_AID",
    "name": "SupplierCo LLC"
  }
}
```

### After

```json
{
  "buyerOrg": {
    "aid": "$BUYERORG_AID",
    "name": "BuyerCorp Inc."
  },
  "sellerOrg": {
    "aid": "$SELLERORG_AID",
    "name": "SellerCorp LLC"
  }
}
```

*Note: The JSON keys remain the same (`buyerOrg`, `sellerOrg`), only the AIDs and display names changed.*

---

## 🔍 Quick Search-and-Replace Guide

If you need to update existing code or documentation:

| Find | Replace With |
|------|--------------|
| `techcorp` | `buyerorg` |
| `techcorp-le` | `buyerorg-le` |
| `techcorp-config.json` | `buyerorg-config.json` |
| `techcorp-registry` | `buyerorg-registry` |
| `TECHCORP_AID` | `BUYERORG_AID` |
| `TECHCORP_OOBI` | `BUYERORG_OOBI` |
| `supplierco` | `sellerorg` |
| `supplierco-le` | `sellerorg-le` |
| `supplierco-config.json` | `sellerorg-config.json` |
| `supplierco-registry` | `sellerorg-registry` |
| `SUPPLIERCO_AID` | `SELLERORG_AID` |
| `SUPPLIERCO_OOBI` | `SELLERORG_OOBI` |

---

## 🚀 Usage Examples

### Running the New Setup Script

```bash
# Navigate to the project root
cd C:\SATHYA\CHAINAIM3003\mcp-servers\stellarboston\Stellar-Smart Contract-Wallets-1

# Navigate to scripts directory
cd scripts

# Make scripts executable (if on Linux/Mac/WSL)
chmod +x setup-vlei-identities.sh verify-vlei-identities.sh

# Run with default names
./setup-vlei-identities.sh

# Or with custom names (in this order: buyer org, buyer agent, seller org, seller agent)
./setup-vlei-identities.sh "Acme Corp" "John Buyer" "Supplier Ltd" "Jane Seller"
```

### Verifying the Setup

```bash
# From the scripts directory
./verify-vlei-identities.sh
```

### Checking Individual Identities

```bash
# Check buyer organization
kli status --name buyerorg --alias buyerorg-le

# Check seller organization
kli status --name sellerorg --alias sellerorg-le

# List credentials
kli vc list --name buyerorg --alias buyerorg-le --issued
kli vc list --name sellerorg --alias sellerorg-le --issued
```

---

## 📝 Key Points

1. **Consistency**: All buyer-related items now use `buyerorg` prefix
2. **Consistency**: All seller-related items now use `sellerorg` prefix
3. **Clarity**: Names are more intuitive and self-documenting
4. **Compatibility**: JSON export structure remains compatible with existing code
5. **Flexibility**: Script accepts custom names as parameters
6. **Location**: Scripts should be run from `scripts/` directory
7. **Output**: Credentials are exported to `app/config/` directory

---

## 🛠️ Troubleshooting

### If you see errors about missing identities:

```bash
# The old names don't exist anymore, use:
kli status --name buyerorg --alias buyerorg-le     # Not techcorp
kli status --name sellerorg --alias sellerorg-le   # Not supplierco
```

### If credentials fail to issue:

```bash
# Verify registries exist with new names
kli vc registry list --name buyerorg --alias buyerorg-le
kli vc registry list --name sellerorg --alias sellerorg-le
```

### If KERIA is not running:

```bash
# From project root
npm run keria:start
# or
docker-compose up -d
```

---

## ✅ Migration Checklist

- [x] Scripts created in `scripts/` directory
- [x] Scripts updated to export to `app/config/` directory
- [ ] Make scripts executable
- [ ] Update documentation and comments
- [ ] Update environment variables
- [ ] Update any hardcoded references in existing code
- [ ] Test credential issuance with new names
- [ ] Verify OOBI resolution works
- [ ] Test frontend integration with new config files

---

*Last updated: October 24, 2025*
