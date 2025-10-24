# vLEI Integration Guide

## Current Setup Status

✅ **Configuration Created**: Identity configuration exported to `identities.json`
⚠️ **Development Mode**: Using simulated AIDs for development
❌ **Not Production Ready**: Real KERI identities need to be created via signify-ts

## Next Steps for Real Integration

### Option 1: Use Signify-TS (Recommended)

```typescript
import { Signify } from 'signify-ts';

// Connect to KERIA
const client = new Signify({
  url: 'http://localhost:3901',
  bootUrl: 'http://localhost:3902'
});

await client.boot();
await client.connect();

// Create identifier
const result = await client.identifiers().create('buyerorg');
const aid = result.i; // This is the real AID

// Update identities.json with real AID
```

### Option 2: Use KERIA HTTP API Directly

See: https://weboftrust.github.io/keria/

### Option 3: Continue with Mock for Development

Your current setup is perfect for:
- Building UI/UX
- Testing business logic
- Development and demos

Just add checks in your code:
```typescript
if (config.setup.mode === 'development') {
  // Use mock verification
  return mockVerify(aid);
}
```

## Development Workflow

1. **Build your app** with current mock identities
2. **Test all features** without real KERI
3. **Add signify-ts** when ready for real identities
4. **Switch mode** from 'development' to 'production'

## Resources

- Signify-TS: https://github.com/WebOfTrust/signify-ts
- KERIA Docs: https://weboftrust.github.io/keria/
- vLEI Ecosystem: https://www.gleif.org/en/vlei/introducing-the-vlei
