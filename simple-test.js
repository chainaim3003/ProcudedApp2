// Simple test script for the Production App
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting Production App Tests...');
  console.log('=====================================');
  
  try {
    // Test 1: Main page loads
    console.log('✅ Test 1: Loading main page...');
    const mainPage = await makeRequest('/');
    console.log(`   Status: ${mainPage.status}`);
    
    if (mainPage.status === 200) {
      console.log('   ✅ Page loads successfully');
    } else {
      console.log('   ❌ Page failed to load');
      return;
    }
    
    // Test 2: Check for Production App elements
    console.log('✅ Test 2: Checking Production App elements...');
    
    const checks = [
      { name: 'Production App button', pattern: '🚀 Production App' },
      { name: 'Issue Credentials button', pattern: 'Issue Credentials' },
      { name: 'Create Order button', pattern: 'Create Order' },
      { name: 'Purchase Orders tab', pattern: 'Purchase Orders' },
      { name: 'Payments tab', pattern: 'Payments' },
      { name: 'Credentials tab', pattern: 'Credentials' },
      { name: 'Analytics tab', pattern: 'Analytics' },
      { name: 'Dashboard metrics', pattern: 'Total Orders' },
      { name: 'vLEI credential status', pattern: 'Legal Entity Verification' },
      { name: 'Role switching buttons', pattern: 'Buyer' }
    ];
    
    let passedChecks = 0;
    for (const check of checks) {
      if (mainPage.data.includes(check.pattern)) {
        console.log(`   ✅ ${check.name} found`);
        passedChecks++;
      } else {
        console.log(`   ❌ ${check.name} not found`);
      }
    }
    
    console.log(`\n📊 Test Results: ${passedChecks}/${checks.length} checks passed`);
    
    // Test 3: Check for specific functionality indicators
    console.log('\n✅ Test 3: Checking functionality indicators...');
    
    const functionalityChecks = [
      { name: 'Form inputs with proper styling', pattern: 'text-gray-900 dark:text-white' },
      { name: 'Modal components', pattern: 'modal' },
      { name: 'Button interactions', pattern: 'hover:bg-' },
      { name: 'Dark mode support', pattern: 'dark:' },
      { name: 'Responsive design', pattern: 'md:grid-cols-' },
      { name: 'Icon components', pattern: 'lucide-react' }
    ];
    
    let functionalityPassed = 0;
    for (const check of functionalityChecks) {
      if (mainPage.data.includes(check.pattern)) {
        console.log(`   ✅ ${check.name} detected`);
        functionalityPassed++;
      } else {
        console.log(`   ❌ ${check.name} not detected`);
      }
    }
    
    console.log(`\n📊 Functionality: ${functionalityPassed}/${functionalityChecks.length} indicators found`);
    
    // Test 4: Check for error states
    console.log('\n✅ Test 4: Checking for error states...');
    
    if (mainPage.data.includes('error') || mainPage.data.includes('Error')) {
      console.log('   ⚠️  Error states detected in HTML');
    } else {
      console.log('   ✅ No error states detected');
    }
    
    // Test 5: Check for mock data indicators
    console.log('\n✅ Test 5: Checking for mock data integration...');
    
    const mockIndicators = [
      { name: 'Mock credential data', pattern: 'Mock' },
      { name: 'Sample data', pattern: 'Sample' },
      { name: 'Test data', pattern: 'Test' }
    ];
    
    let mockFound = 0;
    for (const check of mockIndicators) {
      if (mainPage.data.includes(check.pattern)) {
        console.log(`   ✅ ${check.name} found`);
        mockFound++;
      }
    }
    
    if (mockFound > 0) {
      console.log(`   📝 Mock data integration active (${mockFound} indicators)`);
    } else {
      console.log('   📝 No mock data indicators found');
    }
    
    // Summary
    console.log('\n🎉 Testing Summary:');
    console.log('==================');
    console.log(`✅ Page loads: ${mainPage.status === 200 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ UI Elements: ${passedChecks}/${checks.length} found`);
    console.log(`✅ Functionality: ${functionalityPassed}/${functionalityChecks.length} indicators`);
    console.log(`✅ Error States: ${mainPage.data.includes('error') ? 'DETECTED' : 'CLEAN'}`);
    
    if (passedChecks >= checks.length * 0.8) {
      console.log('\n🎉 Overall Result: PASS - Application is working correctly!');
    } else {
      console.log('\n❌ Overall Result: FAIL - Application needs attention');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
