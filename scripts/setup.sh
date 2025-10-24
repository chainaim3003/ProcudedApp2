#!/bin/bash

# Stellar Procurement dApp - Phase 1 Setup Script
# This script sets up the development environment for Phase 1 MVP

set -e

echo "🚀 Setting up Stellar Procurement dApp - Phase 1 MVP"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Rust is installed (for smart contracts)
if ! command -v cargo &> /dev/null; then
    echo "⚠️  Rust is not installed. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed: $(cargo --version)"
else
    echo "✅ Rust version: $(cargo --version)"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Set up environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp env.example .env.local
    echo "✅ Environment file created. Please review .env.local and update as needed."
else
    echo "✅ Environment file already exists."
fi

# Build smart contract
echo "🔨 Building smart contract..."
cd contracts/procurement
cargo build --target wasm32-unknown-unknown --release
cd ../..

echo "✅ Smart contract built successfully."

# Create necessary directories
mkdir -p .next
mkdir -p public

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For smart contract deployment:"
echo "1. Get a Stellar testnet account with XLM"
echo "2. Update .env.local with your secret key"
echo "3. Run 'npm run contract:deploy' to deploy the contract"
echo ""
echo "Happy coding! 🚀"
