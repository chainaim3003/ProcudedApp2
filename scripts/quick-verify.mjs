import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n========================================');
console.log('Ì¥ê KERI IDENTITY VERIFICATION');
console.log('========================================\n');

try {
  const identitiesPath = join(__dirname, '../app/config/identities.json');
  const identities = JSON.parse(readFileSync(identitiesPath, 'utf-8'));
  
  console.log('‚úÖ Identities loaded successfully!\n');
  
  console.log('Ì±§ Buyer Organization:');
  console.log('   AID:', identities.buyerOrg.aid);
  console.log('   Name:', identities.buyerOrg.name);
  console.log('   KERIA:', identities.buyerOrg.keriaEndpoint);
  
  console.log('\nÌ±§ Buyer Agent:');
  console.log('   AID:', identities.buyerAgent.aid);
  console.log('   Name:', identities.buyerAgent.name);
  
  console.log('\nÌø™ Seller Organization:');
  console.log('   AID:', identities.sellerOrg.aid);
  console.log('   Name:', identities.sellerOrg.name);
  console.log('   KERIA:', identities.sellerOrg.keriaEndpoint);
  
  console.log('\nÌø™ Seller Agent:');
  console.log('   AID:', identities.sellerAgent.aid);
  console.log('   Name:', identities.sellerAgent.name);
  
  // Corrected KERI format: E + 44 chars = 45 total
  const pattern = /^E[A-Za-z0-9]{44}$/;
  const allAIDs = [
    identities.buyerOrg.aid,
    identities.buyerAgent.aid,
    identities.sellerOrg.aid,
    identities.sellerAgent.aid
  ];
  
  const allValid = allAIDs.every(aid => pattern.test(aid));
  
  console.log('\n========================================');
  console.log('Ì≥ä VALIDATION RESULTS');
  console.log('========================================');
  
  allAIDs.forEach((aid, index) => {
    const names = ['Buyer Org', 'Buyer Agent', 'Seller Org', 'Seller Agent'];
    const isValid = pattern.test(aid);
    console.log(`${isValid ? '‚úÖ' : '‚ùå'} ${names[index]}: ${isValid ? 'VALID' : 'INVALID'}`);
  });
  
  console.log('\n========================================');
  if (allValid) {
    console.log('‚úÖ ALL IDENTITIES VALID!');
    console.log('‚úÖ KERI format verified (E + 44 chars)');
    console.log('‚úÖ Ready for Stellar dApp integration');
  } else {
    console.log('‚ùå Some identities have invalid format');
  }
  
  console.log('\nÌ∫Ä NEXT STEPS:');
  console.log('   1. Use in dApp: app/services/keri-identity-service.js');
  console.log('   2. Documentation: KERI-QUICK-START.md');
  console.log('========================================\n');
  
} catch (error) {
  console.log('‚ùå Error:', error.message);
}
