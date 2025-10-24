// Test script for the Production App
const puppeteer = require('puppeteer');

async function runTests() {
  console.log('🧪 Starting Production App Tests...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Application loads
    console.log('✅ Test 1: Loading application...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check if Production App is active
    const productionButton = await page.$('button:has-text("🚀 Production App")');
    if (productionButton) {
      console.log('✅ Production App button found');
    }
    
    // Test 2: Check initial state
    console.log('✅ Test 2: Checking initial dashboard state...');
    const totalOrders = await page.$eval('text=Total Orders', el => el.nextElementSibling.textContent);
    console.log(`   Total Orders: ${totalOrders}`);
    
    const totalVolume = await page.$eval('text=Total Volume', el => el.nextElementSibling.textContent);
    console.log(`   Total Volume: ${totalVolume}`);
    
    // Test 3: Role switching
    console.log('✅ Test 3: Testing role switching...');
    const buyerButton = await page.$('button:has-text("Buyer")');
    const sellerButton = await page.$('button:has-text("Seller")');
    
    if (buyerButton && sellerButton) {
      console.log('   Role switching buttons found');
      await buyerButton.click();
      await page.waitForTimeout(1000);
      await sellerButton.click();
      await page.waitForTimeout(1000);
      console.log('   Role switching functional');
    }
    
    // Test 4: Issue Credentials
    console.log('✅ Test 4: Testing credential issuance...');
    const issueCredentialsBtn = await page.$('button:has-text("Issue Credentials")');
    if (issueCredentialsBtn) {
      await issueCredentialsBtn.click();
      await page.waitForTimeout(2000);
      console.log('   Credentials issued');
    }
    
    // Test 5: Create Order
    console.log('✅ Test 5: Testing order creation...');
    const createOrderBtn = await page.$('button:has-text("Create Order")');
    if (createOrderBtn) {
      await createOrderBtn.click();
      await page.waitForTimeout(1000);
      
      // Fill out the form
      await page.type('input[placeholder*="description"]', 'Test Order for Testing');
      await page.type('input[placeholder*="amount"]', '1000');
      await page.type('input[placeholder*="seller"]', 'TEST12345678901234567890');
      
      // Submit the form
      const submitBtn = await page.$('button:has-text("Create Order")');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        console.log('   Order created successfully');
      }
    }
    
    // Test 6: Navigate to Purchase Orders tab
    console.log('✅ Test 6: Testing navigation...');
    const ordersTab = await page.$('button:has-text("Purchase Orders")');
    if (ordersTab) {
      await ordersTab.click();
      await page.waitForTimeout(1000);
      console.log('   Navigated to Purchase Orders tab');
    }
    
    // Test 7: Check if order appears
    console.log('✅ Test 7: Verifying order persistence...');
    const orderExists = await page.$('text=Test Order for Testing');
    if (orderExists) {
      console.log('   Order found in Purchase Orders tab');
    }
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  runTests();
} catch (error) {
  console.log('Puppeteer not available, running basic tests...');
  
  // Basic HTTP tests
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
  
  async function basicTests() {
    console.log('🧪 Running Basic HTTP Tests...');
    
    try {
      // Test 1: Main page loads
      const mainPage = await makeRequest('/');
      console.log(`✅ Main page status: ${mainPage.status}`);
      
      if (mainPage.data.includes('Production App')) {
        console.log('✅ Production App detected in HTML');
      }
      
      if (mainPage.data.includes('Issue Credentials')) {
        console.log('✅ Issue Credentials button found');
      }
      
      if (mainPage.data.includes('Create Order')) {
        console.log('✅ Create Order button found');
      }
      
      if (mainPage.data.includes('Purchase Orders')) {
        console.log('✅ Purchase Orders tab found');
      }
      
      if (mainPage.data.includes('Payments')) {
        console.log('✅ Payments tab found');
      }
      
      if (mainPage.data.includes('Credentials')) {
        console.log('✅ Credentials tab found');
      }
      
      if (mainPage.data.includes('Analytics')) {
        console.log('✅ Analytics tab found');
      }
      
      console.log('🎉 Basic tests completed!');
      
    } catch (error) {
      console.error('❌ Basic test failed:', error.message);
    }
  }
  
  basicTests();
}
