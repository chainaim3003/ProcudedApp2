#!/usr/bin/env node

// Test script to verify Phase 1 MVP setup
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Stellar Procurement dApp - Phase 1 Setup');
console.log('==================================================');

const tests = [
  {
    name: 'Package.json exists',
    test: () => fs.existsSync('package.json'),
    fix: 'Run: npm init'
  },
  {
    name: 'Node modules installed',
    test: () => fs.existsSync('node_modules'),
    fix: 'Run: npm install'
  },
  {
    name: 'Next.js config exists',
    test: () => fs.existsSync('next.config.js'),
    fix: 'Create next.config.js file'
  },
  {
    name: 'TypeScript config exists',
    test: () => fs.existsSync('tsconfig.json'),
    fix: 'Create tsconfig.json file'
  },
  {
    name: 'Tailwind config exists',
    test: () => fs.existsSync('tailwind.config.js'),
    fix: 'Create tailwind.config.js file'
  },
  {
    name: 'App directory exists',
    test: () => fs.existsSync('app'),
    fix: 'Create app directory structure'
  },
  {
    name: 'Components directory exists',
    test: () => fs.existsSync('components'),
    fix: 'Create components directory'
  },
  {
    name: 'Contexts directory exists',
    test: () => fs.existsSync('contexts'),
    fix: 'Create contexts directory'
  },
  {
    name: 'Smart contract exists',
    test: () => fs.existsSync('contracts/procurement/src/lib.rs'),
    fix: 'Create smart contract files'
  },
  {
    name: 'Environment example exists',
    test: () => fs.existsSync('env.example'),
    fix: 'Create env.example file'
  }
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  try {
    if (test.test()) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Fix: ${test.fix}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} (Error: ${error.message})`);
    failed++;
  }
});

console.log('\n📊 Test Results:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Your Phase 1 MVP is ready to run.');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000');
  console.log('3. Follow the Quick Start Guide');
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues above.');
  console.log('\nFor help, check the README.md or run the setup script:');
  console.log('./scripts/setup.sh');
}

process.exit(failed > 0 ? 1 : 0);
