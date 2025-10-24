#!/bin/bash

echo "========================================"
echo "🧹 Cleaning Up Stuck KERIA Processes"
echo "========================================"
echo ""

echo "Restarting KERIA containers to clear stuck processes..."

# Restart the containers
docker restart keria-buyer keria-seller

echo "Waiting for containers to restart..."
sleep 5

echo ""
echo "Checking if KERIA is responsive..."
docker exec keria-buyer ps aux | grep keria

echo ""
echo "✅ Cleanup complete!"
echo "Now you can run the setup script again."
