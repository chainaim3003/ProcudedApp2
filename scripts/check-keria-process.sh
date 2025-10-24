#!/bin/bash

echo "Checking KERIA container process..."
docker exec keria-buyer ps aux

echo ""
echo "Checking if KERIA agent is running..."
docker exec keria-buyer sh -c "curl -s http://localhost:3901/spec.yaml | head -20"

echo ""
echo "Checking KERIA environment..."
docker exec keria-buyer env | grep KERI

echo ""
echo "Testing direct curl to buyer KERIA..."
curl -s http://localhost:3901/spec.yaml | head -20
