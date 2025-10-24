# 🚀 Quick Start Guide - Phase 1 MVP

Get your Stellar Procurement dApp running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Modern web browser with WebAuthn support
- Basic understanding of blockchain concepts

## 🏃‍♂️ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to: http://localhost:3000

## 🎯 Test the Complete Flow

### Step 1: Connect as Buyer
1. Click **"Connect as Buyer (TechCorp)"**
2. Wait for simulated passkey authentication
3. Verify wallet address and credentials are displayed

### Step 2: Create Purchase Order
1. Click **"Create Purchase Order"**
2. Fill in:
   - Description: "Software Development Services"
   - Amount: 5000 (USD)
3. Click **"Create Purchase Order"**
4. Wait for transaction confirmation

### Step 3: Switch to Seller
1. Click **"Switch to Seller (SupplierCo)"**
2. Wait for role switch
3. Verify you can see the incoming purchase order

### Step 4: Accept Order
1. Click **"Accept Order"** on the purchase order
2. Wait for transaction confirmation
3. Verify status changed to "Accepted"

### Step 5: Fulfill Order
1. Click **"Mark as Fulfilled"**
2. Wait for transaction confirmation
3. Verify status changed to "Fulfilled"

### Step 6: Release Payment
1. Click **"Switch to Buyer (TechCorp)"**
2. Click **"Release Payment"** on the fulfilled order
3. Wait for payment processing
4. Verify status changed to "Paid"

## ✅ Success Criteria

- [ ] Can connect as both buyer and seller
- [ ] Can create purchase orders
- [ ] Can accept and fulfill orders
- [ ] Can release payments
- [ ] Credential verification works
- [ ] UI is responsive and intuitive

## 🐛 Troubleshooting

### Common Issues

**"Wallet not connected"**
- Refresh the page and try connecting again
- Check browser console for errors

**"Transaction failed"**
- This is normal in Phase 1 (mock transactions)
- Check the browser console for simulation logs

**"Passkey authentication failed"**
- Phase 1 uses mock authentication
- Real passkeys will be implemented in Phase 2

### Browser Compatibility

- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 14+
- ✅ Edge 79+

## 📱 Mobile Testing

The app is fully responsive and works on mobile devices:
- Touch-friendly interface
- Responsive design
- Mobile-optimized forms

## 🔧 Development Mode

In development mode, you'll see:
- Mock transaction delays (1-3 seconds)
- Console logs for debugging
- Simulated blockchain interactions
- Local storage persistence

## 🚀 Next Steps

Once Phase 1 is working:
1. **Phase 2**: Real vLEI integration
2. **Phase 3**: X402 payment protocol
3. **Phase 4**: Advanced features

## 📞 Support

- Check the main README.md for detailed documentation
- Review the smart contract code in `contracts/`
- Examine the React components in `components/`

---

**Happy Testing! 🎉**
