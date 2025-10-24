#!/bin/bash

# Stellar Procurement dApp - Phase 2 Setup Script
# This script sets up the vLEI infrastructure using KERIA agents

set -e

echo "🚀 Setting up Stellar Procurement dApp - Phase 2: vLEI Integration"
echo "=================================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p keria-configs
mkdir -p logs
mkdir -p data

# Copy KERIA configuration files to Docker volumes
echo "📋 Setting up KERIA configurations..."
cp keria-configs/*.yaml data/ 2>/dev/null || echo "⚠️  KERIA config files not found, will be created by containers"

# Start KERIA infrastructure
echo "🐳 Starting KERIA infrastructure..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for KERIA services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test KERIA endpoints
echo "🧪 Testing KERIA endpoints..."
for port in 3901 3904 3906; do
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ KERIA service on port $port is healthy"
    else
        echo "⚠️  KERIA service on port $port is not responding"
    fi
done

# Build smart contract
echo "🔨 Building smart contract..."
cd contracts/procurement
cargo build --target wasm32-unknown-unknown --release
cd ../..

echo ""
echo "🎉 Phase 2 setup complete!"
echo ""
echo "KERIA Services:"
echo "  - TechCorp Agent: http://localhost:3901"
echo "  - SupplierCo Agent: http://localhost:3904"
echo "  - GLEIF QVI Agent: http://localhost:3906"
echo "  - Redis: localhost:6379"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. The app will now use real vLEI credentials and Passkey-Kit"
echo ""
echo "To stop KERIA services: docker-compose down"
echo "To view logs: docker-compose logs -f"
echo ""
echo "Happy coding! 🚀"
