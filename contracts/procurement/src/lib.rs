#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec, token, Map};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum PurchaseOrderStatus {
    Created,
    Accepted,
    Fulfilled,
    Paid,
    Disputed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct PurchaseOrder {
    pub id: u64,
    pub buyer: Address,
    pub seller: Address,
    pub buyer_lei: String,
    pub seller_lei: String,
    pub buyer_vlei_aid: String,
    pub seller_vlei_aid: String,
    pub description: String,
    pub amount: i128,  // Amount in USDC (7 decimals)
    pub status: PurchaseOrderStatus,
    pub created_at: u64,
    pub fulfilled_at: Option<u64>,
}

#[contract]
pub struct ProcurementContract;

#[contractimpl]
impl ProcurementContract {
    /// Create a purchase order (buyer initiates) with vLEI credential verification
    pub fn create_purchase_order(
        env: Env,
        buyer: Address,
        seller: Address,
        buyer_lei: String,
        seller_lei: String,
        buyer_vlei_aid: String,
        seller_vlei_aid: String,
        description: String,
        amount: i128,
        buyer_ecr_credential: String,  // ECR credential SAID for verification
        buyer_spending_limit: i128,   // Spending limit from ECR credential
    ) -> u64 {
        buyer.require_auth();

        // Verify spending limit from ECR credential
        if amount > buyer_spending_limit {
            panic!("Amount exceeds spending limit from ECR credential");
        }

        // In a real implementation, you would verify the ECR credential here
        // by checking its signature and ensuring it's valid
        Self::verify_ecr_credential(&env, &buyer_ecr_credential, &buyer_vlei_aid);

        let po_id = Self::get_next_po_id(&env);

        let po = PurchaseOrder {
            id: po_id,
            buyer: buyer.clone(),
            seller: seller.clone(),
            buyer_lei,
            seller_lei,
            buyer_vlei_aid,
            seller_vlei_aid,
            description,
            amount,
            status: PurchaseOrderStatus::Created,
            created_at: env.ledger().timestamp(),
            fulfilled_at: None,
        };

        env.storage().persistent().set(&po_id, &po);

        env.events().publish(
            (String::from_str(&env, "po_created"),),
            (po_id, buyer, seller, amount, buyer_ecr_credential),
        );

        po_id
    }

    /// Seller accepts the purchase order
    pub fn accept_purchase_order(env: Env, po_id: u64, seller: Address) {
        seller.require_auth();

        let mut po: PurchaseOrder = env.storage().persistent().get(&po_id)
            .expect("Purchase order not found");

        assert_eq!(po.seller, seller, "Only seller can accept");
        assert_eq!(po.status, PurchaseOrderStatus::Created, "PO already processed");

        po.status = PurchaseOrderStatus::Accepted;
        env.storage().persistent().set(&po_id, &po);

        env.events().publish(
            (String::from_str(&env, "po_accepted"),),
            (po_id, seller),
        );
    }

    /// Seller marks order as fulfilled
    pub fn fulfill_purchase_order(env: Env, po_id: u64, seller: Address) {
        seller.require_auth();

        let mut po: PurchaseOrder = env.storage().persistent().get(&po_id)
            .expect("Purchase order not found");

        assert_eq!(po.seller, seller, "Only seller can fulfill");
        assert_eq!(po.status, PurchaseOrderStatus::Accepted, "PO not accepted");

        po.status = PurchaseOrderStatus::Fulfilled;
        po.fulfilled_at = Some(env.ledger().timestamp());
        env.storage().persistent().set(&po_id, &po);

        env.events().publish(
            (String::from_str(&env, "po_fulfilled"),),
            (po_id, seller),
        );
    }

    /// Buyer releases payment (Phase 1: simplified without X402)
    pub fn release_payment(
        env: Env,
        po_id: u64,
        buyer: Address,
        usdc_token: Address,
    ) {
        buyer.require_auth();

        let mut po: PurchaseOrder = env.storage().persistent().get(&po_id)
            .expect("Purchase order not found");

        assert_eq!(po.buyer, buyer, "Only buyer can release payment");
        assert_eq!(po.status, PurchaseOrderStatus::Fulfilled, "PO not fulfilled");

        // Transfer USDC from buyer to seller
        let client = token::Client::new(&env, &usdc_token);
        client.transfer(&buyer, &po.seller, &po.amount);

        po.status = PurchaseOrderStatus::Paid;
        env.storage().persistent().set(&po_id, &po);

        env.events().publish(
            (String::from_str(&env, "po_paid"),),
            (po_id, buyer, po.seller.clone(), po.amount),
        );
    }

    /// Get purchase order details
    pub fn get_purchase_order(env: Env, po_id: u64) -> PurchaseOrder {
        env.storage().persistent().get(&po_id)
            .expect("Purchase order not found")
    }

    /// Get all purchase orders for a user (buyer or seller)
    pub fn get_user_purchase_orders(env: Env, user: Address) -> Vec<u64> {
        let mut po_ids: Vec<u64> = Vec::new(&env);
        
        // In a real implementation, you'd maintain an index
        // For Phase 1, we'll return a simple list
        // This is a simplified version - in production you'd want proper indexing
        
        po_ids
    }

    /// Cancel a purchase order (buyer only, before acceptance)
    pub fn cancel_purchase_order(env: Env, po_id: u64, buyer: Address) {
        buyer.require_auth();

        let mut po: PurchaseOrder = env.storage().persistent().get(&po_id)
            .expect("Purchase order not found");

        assert_eq!(po.buyer, buyer, "Only buyer can cancel");
        assert_eq!(po.status, PurchaseOrderStatus::Created, "PO already processed");

        po.status = PurchaseOrderStatus::Cancelled;
        env.storage().persistent().set(&po_id, &po);

        env.events().publish(
            (String::from_str(&env, "po_cancelled"),),
            (po_id, buyer),
        );
    }

    /// Verify ECR credential (simplified for Phase 2)
    /// In a real implementation, this would verify the credential signature
    /// and check against a registry of valid credentials
    fn verify_ecr_credential(env: &Env, credential_said: &String, aid: &String) {
        // For Phase 2, we'll do basic validation
        // In production, this would:
        // 1. Verify the credential signature
        // 2. Check the credential hasn't been revoked
        // 3. Validate the credential chain (ECR -> OOR -> QVI)
        // 4. Check the credential is still valid (not expired)
        
        // Basic validation - ensure credential SAID is not empty
        if credential_said.len() == 0 {
            panic!("Invalid ECR credential SAID");
        }
        
        // Basic validation - ensure AID is not empty
        if aid.len() == 0 {
            panic!("Invalid vLEI AID");
        }
        
        // In a real implementation, you would store a registry of valid credentials
        // and check against it here
        
        // For now, we'll just log the verification
        env.events().publish(
            (String::from_str(env, "credential_verified"),),
            (credential_said.clone(), aid.clone()),
        );
    }

    /// Get credential verification status
    pub fn get_credential_status(env: Env, credential_said: String) -> bool {
        // In a real implementation, this would check against a registry
        // For Phase 2, we'll return true for valid-looking credentials
        credential_said.len() > 0
    }

    // Helper function
    fn get_next_po_id(env: &Env) -> u64 {
        let counter_key = String::from_str(env, "po_counter");
        let current: u64 = env.storage().persistent().get(&counter_key).unwrap_or(0);
        let next = current + 1;
        env.storage().persistent().set(&counter_key, &next);
        next
    }
}
