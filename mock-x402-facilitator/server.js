const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Mock payment requirements endpoint
app.post('/payment-requirements', (req, res) => {
  const { resource } = req.body;
  
  console.log(`📋 Payment requirements requested for: ${resource}`);
  
  // Return 402 Payment Required with headers
  res.status(402)
     .header('X-PAYMENT-SCHEME', 'exact')
     .header('X-PAYMENT-NETWORK', 'stellar')
     .header('X-PAYMENT-TOKEN', 'USDC')
     .header('X-PAYMENT-AMOUNT', '1000000') // 1 USDC in micro units
     .header('X-PAYMENT-RECIPIENT', 'GSELLER123456789')
     .header('X-PAYMENT-VALID-UNTIL', (Date.now() + 300000).toString())
     .json({
       error: 'Payment Required',
       requirements: {
         scheme: 'exact',
         network: 'stellar',
         token: 'USDC',
         amount: 1000000,
         recipient: 'GSELLER123456789',
         validUntil: Date.now() + 300000
       }
     });
});

// Mock payment verification endpoint
app.post('/verify-payment', (req, res) => {
  const { requirements } = req.body;
  const paymentHeader = req.headers['x-payment'];
  
  console.log('🔐 Payment verification requested');
  console.log('Payment header:', paymentHeader);
  console.log('Requirements:', requirements);
  
  // Mock verification - always return success
  res.json({
    verified: true,
    txHash: 'mock_tx_hash_' + Date.now(),
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`🎯 Mock X402 Facilitator running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /payment-requirements`);
  console.log(`   POST /verify-payment`);
});
