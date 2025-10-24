# Docker Compose Migration Guide - Generic Buyer/Seller Naming

## 📋 Summary of Changes

Your docker-compose.yml has been updated with generic buyer/seller naming conventions.

### Old Names → New Names

| Component | Old Name | New Name |
|-----------|----------|----------|
| **Buyer KERIA Service** |
| Service name | `keria-techcorp` | `keria-buyer` |
| Container name | `keria-techcorp` | `keria-buyer` |
| Volume | `keria_techcorp_data` | `keria_buyer_data` |
| **Seller KERIA Service** |
| Service name | `keria-supplierco` | `keria-seller` |
| Container name | `keria-supplierco` | `keria-seller` |
| Volume | `keria_supplierco_data` | `keria_seller_data` |

### Additional Improvements

- Added `restart: unless-stopped` to all services for better reliability
- Added `driver: local` to volumes for explicit configuration
- Updated comments to be more generic

---

## 🔄 Migration Steps

### Step 1: Stop Current Containers

```bash
cd C:\SATHYA\CHAINAIM3003\mcp-servers\stellarboston\Stellar-Smart Contract-Wallets-1

# Stop all containers
docker compose down
```

**Important:** This will stop but **NOT delete** your existing data. Your volumes (`keria_techcorp_data` and `keria_supplierco_data`) are preserved.

### Step 2: Start New Containers

```bash
# Start with new naming
docker compose up -d
```

This will create:
- New containers: `keria-buyer`, `keria-seller`
- New volumes: `keria_buyer_data`, `keria_seller_data`
- Keep existing: `witness1`, `keria-redis`

### Step 3: Run Setup Script

Now run the identity setup script with the new naming:

```bash
cd scripts

# Run setup
bash setup-vlei-identities.sh

# Or with custom names
bash setup-vlei-identities.sh "Acme Corp" "John Buyer" "Supplier Ltd" "Jane Seller"
```

### Step 4: Verify

```bash
# Verify identities
bash verify-vlei-identities.sh

# Check containers are running
docker ps
```

---

## ⚠️ Important Notes

### About Your Old Data

Your old KERIA data in `keria_techcorp_data` and `keria_supplierco_data` volumes is **still preserved** but won't be used by the new containers. The new containers will start fresh with `keria_buyer_data` and `keria_seller_data`.

### If You Need Old Data

If you have important identities in the old volumes, you have two options:

**Option A: Keep using old containers (for now)**

```bash
# Restore old docker-compose.yml
cp docker-compose.yml.backup-old-naming docker-compose.yml

# Start old containers
docker compose up -d
```

**Option B: Migrate data from old volumes**

This is more complex and involves copying data between volumes. Let me know if you need help with this.

---

## 🧹 Cleanup Old Resources (Optional)

After you've confirmed the new setup works and you don't need the old data:

```bash
# Remove old volumes
docker volume rm stellar-smartcontract-wallets-1_keria_techcorp_data
docker volume rm stellar-smartcontract-wallets-1_keria_supplierco_data

# Remove old backup file (if no longer needed)
rm docker-compose.yml.backup-old-naming
```

---

## 🔧 Port Mapping Reference

| Service | Internal Ports | External Ports | Purpose |
|---------|---------------|----------------|---------|
| keria-buyer | 3901-3903 | 3901-3903 | Buyer KERIA agent |
| keria-seller | 3901-3903 | 3904-3906 | Seller KERIA agent |
| witness1 | 3901-3903 | 3907-3909 | Witness node |
| redis | 6379 | 6379 | State management |

---

## ✅ Verification Checklist

After migration, verify:

- [ ] All containers are running: `docker ps`
- [ ] No errors in logs: `docker compose logs`
- [ ] Buyer KERIA accessible: `curl http://localhost:3901`
- [ ] Seller KERIA accessible: `curl http://localhost:3904`
- [ ] Setup script runs successfully
- [ ] Credentials exported to `app/config/`
- [ ] Application can connect to new KERIA instances

---

## 🆘 Troubleshooting

### If containers won't start:

```bash
# Check for port conflicts
docker compose ps
netstat -ano | findstr "3901"

# View logs
docker compose logs keria-buyer
docker compose logs keria-seller
```

### If you see orphan container warnings:

```bash
# Remove orphaned containers
docker compose down --remove-orphans
```

### To completely start fresh:

```bash
# Stop and remove everything (including volumes)
docker compose down -v

# Start fresh
docker compose up -d
```

---

## 📞 Need Help?

- Check logs: `docker compose logs -f`
- Restart specific service: `docker compose restart keria-buyer`
- Full restart: `docker compose down && docker compose up -d`

---

*Backup created: `docker-compose.yml.backup-old-naming`*
*Last updated: October 24, 2025*
