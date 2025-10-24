#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const identitiesPath = join(__dirname, '../app/config/identities.json');
const identities = JSON.parse(readFileSync(identitiesPath, 'utf-8'));

const BUYER_KERIA = 'http://127.0.0.1:3901';
const SELLER_KERIA = 'http://127.0.0.1:3904';

const app = express();
app.use(cors());
app.use(express.json());

async function checkKERIA(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    // Try root endpoint
    const response = await fetch(`${url}/`, {
      signal: controller.signal,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'KERI-Identity-API'
      }
    });
    
    clearTimeout(timeout);
    
    // 401 Unauthorized means the server IS responding (just needs auth)
    // This counts as "online" for our health check
    const isOnline = response.status >= 200 && response.status < 500;
    
    return { 
      online: isOnline, 
      status: response.status, 
      url: url,
      message: response.status === 401 ? 'Server online (requires auth)' : 'Server online'
    };
  } catch (error) {
    return { 
      online: false, 
      error: error.message, 
      url: url 
    };
  }
}

function verifyKERIFormat(aid) {
  return /^E[A-Za-z0-9]{44}$/.test(aid);
}

app.get('/api/identities', (req, res) => {
  res.json({
    success: true,
    data: {
      buyer: {
        org: {
          aid: identities.buyerOrg.aid,
          prefix: identities.buyerOrg.aid,
          name: identities.buyerOrg.name,
          verified: verifyKERIFormat(identities.buyerOrg.aid),
          keriaUrl: identities.buyerOrg.keriaEndpoint
        },
        agent: {
          aid: identities.buyerAgent.aid,
          prefix: identities.buyerAgent.aid,
          name: identities.buyerAgent.name,
          verified: verifyKERIFormat(identities.buyerAgent.aid),
          keriaUrl: identities.buyerAgent.keriaEndpoint
        }
      },
      seller: {
        org: {
          aid: identities.sellerOrg.aid,
          prefix: identities.sellerOrg.aid,
          name: identities.sellerOrg.name,
          verified: verifyKERIFormat(identities.sellerOrg.aid),
          keriaUrl: identities.sellerOrg.keriaEndpoint
        },
        agent: {
          aid: identities.sellerAgent.aid,
          prefix: identities.sellerAgent.aid,
          name: identities.sellerAgent.name,
          verified: verifyKERIFormat(identities.sellerAgent.aid),
          keriaUrl: identities.sellerAgent.keriaEndpoint
        }
      }
    }
  });
});

app.get('/api/identities/verify', async (req, res) => {
  try {
    console.log('\nÌ¥ç Checking KERIA connectivity...');
    
    const [buyerStatus, sellerStatus] = await Promise.all([
      checkKERIA(BUYER_KERIA),
      checkKERIA(SELLER_KERIA)
    ]);

    console.log('Buyer:', buyerStatus.online ? `‚úÖ ONLINE (${buyerStatus.status})` : '‚ùå OFFLINE');
    console.log('Seller:', sellerStatus.online ? `‚úÖ ONLINE (${sellerStatus.status})` : '‚ùå OFFLINE');

    res.json({
      success: buyerStatus.online && sellerStatus.online,
      infrastructure: { buyer: buyerStatus, seller: sellerStatus },
      identities: {
        buyer: {
          org: verifyKERIFormat(identities.buyerOrg.aid),
          agent: verifyKERIFormat(identities.buyerAgent.aid)
        },
        seller: {
          org: verifyKERIFormat(identities.sellerOrg.aid),
          agent: verifyKERIFormat(identities.sellerAgent.aid)
        }
      }
    });
  } catch (error) {
    console.error('‚ùå Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/identities/:role/:type', (req, res) => {
  const { role, type } = req.params;

  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Role must be buyer or seller' });
  }

  if (!['org', 'agent'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Type must be org or agent' });
  }

  const key = role + (type === 'org' ? 'Org' : 'Agent');
  const identity = identities[key];

  res.json({
    success: true,
    data: {
      aid: identity.aid,
      name: identity.name,
      role,
      type,
      verified: verifyKERIFormat(identity.aid),
      keriaUrl: identity.keriaEndpoint
    }
  });
});

app.post('/api/transactions/metadata', (req, res) => {
  const { role, transactionType } = req.body;

  if (!role || !transactionType) {
    return res.status(400).json({ success: false, error: 'role and transactionType are required' });
  }

  if (!['buyer', 'seller'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Role must be buyer or seller' });
  }

  const key = role + 'Agent';
  const identity = identities[key];

  res.json({
    success: true,
    data: {
      keri_aid: identity.aid,
      keri_name: identity.name,
      role: role,
      transaction_type: transactionType,
      timestamp: new Date().toISOString(),
      keria_url: identity.keriaEndpoint,
      verified: verifyKERIFormat(identity.aid)
    }
  });
});

app.get('/api/health', async (req, res) => {
  const [buyerStatus, sellerStatus] = await Promise.all([
    checkKERIA(BUYER_KERIA),
    checkKERIA(SELLER_KERIA)
  ]);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    keria: { buyer: buyerStatus, seller: sellerStatus },
    identities_loaded: true,
    total_identities: 4
  });
});

const PORT = process.env.IDENTITY_API_PORT || 4000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('Ì∫Ä KERI Identity API Server');
  console.log('='.repeat(60));
  console.log(`\n‚úÖ Server: http://localhost:${PORT}`);
  console.log(`\nÌ¥ê KERIA Endpoints:`);
  console.log(`   Buyer:  ${BUYER_KERIA}`);
  console.log(`   Seller: ${SELLER_KERIA}`);
  console.log('\nÌ≤° Ready! Click "Verify All" in the UI');
  console.log('='.repeat(60) + '\n');
});
