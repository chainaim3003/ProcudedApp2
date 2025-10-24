#!/bin/bash

echo "========================================"
echo "🔍 KERIA Diagnostic Script"
echo "========================================"
echo ""

echo "1️⃣ Checking Docker containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "2️⃣ Testing KERIA buyer connection..."
docker exec keria-buyer kli version 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ KLI is available in keria-buyer"
else
    echo "❌ KLI not working in keria-buyer"
fi
echo ""

echo "3️⃣ Testing KERIA seller connection..."
docker exec keria-seller kli version 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ KLI is available in keria-seller"
else
    echo "❌ KLI not working in keria-seller"
fi
echo ""

echo "4️⃣ Checking KERIA buyer logs (last 20 lines)..."
docker logs keria-buyer --tail 20
echo ""

echo "5️⃣ Checking KERIA seller logs (last 20 lines)..."
docker logs keria-seller --tail 20
echo ""

echo "6️⃣ Testing simple KLI command..."
echo "Trying to list existing identities in buyer..."
docker exec keria-buyer kli list 2>/dev/null || echo "No identities yet or command failed"
echo ""

echo "========================================"
echo "Diagnostic complete!"
echo "========================================"
