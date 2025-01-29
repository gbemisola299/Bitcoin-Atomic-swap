import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that atomic swap can be initialized",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const alice = accounts.get('wallet_1')!;
        const amount = 1000;
        const hash = '0x1234567890123456789012345678901234567890123456789012345678901234';
        
        let block = chain.mineBlock([
            Tx.contractCall('atomic-swap', 'initialize-swap', [
                types.buff(hash),
                types.uint(100), // deadline
                types.uint(amount),
                types.principal(alice.address)
            ], deployer.address)
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        assertEquals(block.receipts[0].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure that swap can be claimed with correct secret",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const alice = accounts.get('wallet_1')!;
        const secret = '0x1234567890123456789012345678901234567890123456789012345678901234';
        const hash = types.buff(secret); // In real test, this would be sha256 of secret
        const amount = 1000;
        
        let block = chain.mineBlock([
            // First initialize the swap
            Tx.contractCall('atomic-swap', 'initialize-swap', [
                hash,
                types.uint(100),
                types.uint(amount),
                types.principal(alice.address)
            ], deployer.address),
            
            // Then claim with secret
            Tx.contractCall('atomic-swap', 'claim-with-secret', [
                types.buff(secret)
            ], alice.address)
        ]);
        
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[1].result, '(ok true)');
    }
});

Clarinet.test({
    name: "Ensure that refund works after timeout",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const alice = accounts.get('wallet_1')!;
        const hash = '0x1234567890123456789012345678901234567890123456789012345678901234';
        const amount = 1000;
        
        let block = chain.mineBlock([
            // Initialize swap
            Tx.contractCall('atomic-swap', 'initialize-swap', [
                types.buff(hash),
                types.uint(10), // short deadline
                types.uint(amount),
                types.principal(alice.address)
            ], deployer.address)
        ]);

         // Mine blocks to pass deadline
         chain.mineEmptyBlockUntil(12);
        
         let refundBlock = chain.mineBlock([
             Tx.contractCall('atomic-swap', 'refund', [], deployer.address)
         ]);
         
         assertEquals(refundBlock.receipts[0].result, '(ok true)');
     }
 });