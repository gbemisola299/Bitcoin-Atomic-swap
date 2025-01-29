# Bitcoin-Stacks Atomic Swap Contract

A smart contract that enables trustless atomic swaps between Bitcoin (BTC) and Stacks tokens (STX).

## Overview

This contract implements Hash Time Locked Contract (HTLC) functionality to enable secure cross-chain trading between the Bitcoin and Stacks blockchains. The swap process is atomic, meaning either both parties receive their traded assets, or neither does.

## Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) for local development and testing
- [Stacks CLI](https://github.com/blockstack/stacks.js) for contract deployment
- Access to testnet STX via [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
- [Hiro Wallet](https://wallet.hiro.so/) for contract interaction

## Project Structure

```
atomic-swap-project/
├── Clarinet.toml
├── contracts/
│   └── atomic-swap.clar
└── tests/
    └── atomic-swap_test.ts
```

## Contract Functions

### initialize-swap
Initializes a new atomic swap with specified parameters:
- Hash lock (32-byte buffer)
- Deadline (block height)
- Amount of STX to swap
- Recipient address

### claim-with-secret
Claims locked funds by providing the secret that matches the hash lock:
- Secret (32-byte buffer)

### refund
Refunds locked funds to the original sender if the deadline has passed.

## Testing

Run the test suite:
```bash
clarinet test
```

## Deployment

1. Generate testnet keys:
```bash
stx make_keychain -t
```

2. Deploy contract:
```bash
stx deploy_contract atomic-swap.clar <your_testnet_address>/atomic-swap -t
```

## Usage Flow

1. STX Holder:
   - Initializes swap with hash of secret
   - Locks STX in contract

2. BTC Holder:
   - Verifies STX lock
   - Creates corresponding BTC HTLC
   - Locks BTC

3. Completion:
   - BTC holder reveals secret to claim STX
   - STX holder uses revealed secret to claim BTC

## Security Considerations

- Always verify contract deployment address
- Test with small amounts first
- Monitor transactions on [Stacks Explorer](https://explorer.stacks.co/?chain=testnet)
- Keep private keys secure
- Check deadlines before initializing swaps

## Technical Details

- Block height is used for timelock functionality
- SHA256 is used for hash locks
- Contract state resets after successful claim or refund
- Principal-based authentication for operations