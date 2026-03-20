# 🧠 Prediction Market on Stellar (Soroban)

## 📌 Project Description

A decentralized prediction market built using Soroban smart contracts on the Stellar blockchain. Users can create prediction markets for crypto price movements, place bets on outcomes, and resolve markets once the result is known — all on-chain with no middleman.

## ⚙️ What It Does

- Create prediction markets for crypto assets (BTC, ETH, etc.)
- Place bets predicting if price will go Higher or Lower
- Tracks total bets on each side
- Resolve markets with the actual outcome
- All data stored transparently on the Stellar blockchain

## ✨ Features

- 🏗️ Create a new prediction market with target price and deadline
- 📈 Bet Higher or Lower on any market
- 💰 Track total pool on each side
- ✅ Resolve markets with winning outcome
- 🔍 Fetch market data on-chain anytime
- ⚡ Built using Rust + Soroban SDK
- 🌐 Deployed on Stellar Testnet

## 🚀 Deployed Smart Contract

Contract ID: `CDNC4IUTQGIB32QKMI7MPILQFEWNALBMIUYQSRK2ZFHAJITKAEKQZMEX`

👉 [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDNC4IUTQGIB32QKMI7MPILQFEWNALBMIUYQSRK2ZFHAJITKAEKQZMEX)

👉 [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CDNC4IUTQGIB32QKMI7MPILQFEWNALBMIUYQSRK2ZFHAJITKAEKQZMEX)

## 🛠️ Tech Stack

- Rust (Soroban SDK)
- Stellar Blockchain
- Soroban CLI

## 📦 How to Use

### Build
```bash
cargo test
stellar contract build
```

### Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/prediction.wasm \
  --source-account alice \
  --network testnet \
  --alias prediction
```

### Create a Market
```bash
stellar contract invoke \
  --id prediction \
  --source-account alice \
  --network testnet \
  --send=yes \
  -- \
  create_market \
  --asset "BTC" \
  --target_price 5000000 \
  --deadline 1000
```

### Place a Bet
```bash
stellar contract invoke \
  --id prediction \
  --source-account alice \
  --network testnet \
  --send=yes \
  -- \
  place_bet \
  --market_id 0 \
  --bettor $(stellar keys address alice) \
  --amount 100000000 \
  --predict_higher true
```

### Resolve a Market
```bash
stellar contract invoke \
  --id prediction \
  --source-account alice \
  --network testnet \
  --send=yes \
  -- \
  resolve_market \
  --market_id 0 \
  --price_went_higher true
```

## 🔮 Future Improvements

- Token-based betting with real XLM
- Automated oracle-based resolution using real price feeds
- Rewards distribution to winners
- Frontend UI with Freighter wallet integration
- Multi-asset support

## 📄 License

MIT License

<img width="1919" height="905" alt="Screenshot 2026-03-19 143905" src="https://github.com/user-attachments/assets/0a0c2024-fd86-4747-bd42-8955c84f8cbb" />

