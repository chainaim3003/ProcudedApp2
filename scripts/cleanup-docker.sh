#!/bin/bash

echo "========================================"
echo "🧹 Docker Cleanup Script"
echo "========================================"
echo ""

# Stop all running containers
echo "1️⃣ Stopping all containers..."
docker compose down 2>/dev/null

# Remove old named containers
echo ""
echo "2️⃣ Removing old containers..."
OLD_CONTAINERS="keria-techcorp keria-supplierco witness2 witness3"
for container in $OLD_CONTAINERS; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
        echo "  Removing: $container"
        docker rm -f $container 2>/dev/null
    else
        echo "  ✓ Already removed: $container"
    fi
done

# Remove any orphaned containers
echo ""
echo "3️⃣ Cleaning up orphaned containers..."
docker container prune -f

# List remaining containers
echo ""
echo "4️⃣ Current containers:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "========================================"
echo "✅ Cleanup Complete!"
echo ""
echo "Now run: docker compose up -d"
echo "========================================"
