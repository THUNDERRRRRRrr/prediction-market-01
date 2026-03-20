/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { connectWallet, signTx } from "../freighter.js";
import * as StellarSdk from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDNC4IUTQGIB32QKMI7MPILQFEWNALBMIUYQSRK2ZFHAJITKAEKQZMEX";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const ALICE = "GBG3W7PXLJTJJRTL7KSORWALYZPISUBDBOBPIBVEDDBNOGHTABBQ5CBO";

const server = new StellarSdk.rpc.Server(RPC_URL);

function PredictionApp() {
  const [wallet, setWallet] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [asset, setAsset] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(ALICE);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call("get_markets"))
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
        const result = StellarSdk.scValToNative(sim.result.retval);
        setMarkets(result);
      }
    } catch (e) {
      console.error("Error loading markets:", e);
    }
  };

  const handleConnect = async () => {
    const address = await connectWallet();
    setWallet(address);
  };

  const handleCreateMarket = async () => {
    if (!wallet) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(wallet);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          "create_market",
          StellarSdk.nativeToScVal(asset, { type: "string" }),
          StellarSdk.nativeToScVal(BigInt(parseFloat(targetPrice) * 100), { type: "i128" }),
          StellarSdk.nativeToScVal(BigInt(1000), { type: "u64" }),
        ))
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);

      setAsset(""); setTargetPrice("");
      setTimeout(loadMarkets, 3000);
      alert("Market created!");
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleBet = async (marketId, predictHigher) => {
    if (!wallet) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(wallet);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          "place_bet",
          StellarSdk.nativeToScVal(marketId, { type: "u32" }),
          StellarSdk.nativeToScVal(wallet, { type: "address" }),
          StellarSdk.nativeToScVal(BigInt(parseFloat(betAmount) * 10_000_000), { type: "i128" }),
          StellarSdk.xdr.ScVal.scvBool(predictHigher),
        ))
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);

      setTimeout(loadMarkets, 3000);
      alert(`Bet placed — ${predictHigher ? "📈 Higher" : "📉 Lower"}!`);
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleResolve = async (marketId, wentHigher) => {
    if (!wallet) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(wallet);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call(
          "resolve_market",
          StellarSdk.nativeToScVal(marketId, { type: "u32" }),
          StellarSdk.xdr.ScVal.scvBool(wentHigher),
        ))
        .setTimeout(30)
        .build();

      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);

      setTimeout(loadMarkets, 3000);
      alert("Market resolved!");
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h1>📈 Crypto Prediction Market</h1>
      <p style={{ color: "gray" }}>Powered by Stellar & Soroban</p>

      <div style={{ marginBottom: "30px" }}>
        {!wallet ? (
          <button onClick={handleConnect} style={btnStyle("#6366f1")}>
            Connect Freighter Wallet
          </button>
        ) : (
          <p>✅ Connected: <code>{wallet.slice(0, 10)}...{wallet.slice(-6)}</code></p>
        )}
      </div>

      <div style={cardStyle}>
        <h2>Create Market</h2>
        <input placeholder="Asset (e.g. BTC)" value={asset} onChange={e => setAsset(e.target.value)} style={inputStyle} />
        <input placeholder="Target Price (USD)" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} style={inputStyle} type="number" />
        <button onClick={handleCreateMarket} disabled={loading} style={btnStyle("#6366f1")}>
          {loading ? "Creating..." : "Create Market"}
        </button>
      </div>

      <h2>Active Markets</h2>
      {markets.length === 0 ? (
        <p>No markets yet. Create one!</p>
      ) : (
        markets.map((m, i) => (
          <div key={i} style={cardStyle}>
            <h3>{m.asset} Price Market #{m.id}</h3>
            <p>🎯 Target: ${(Number(m.target_price) / 100).toFixed(2)}</p>
            <p>📈 Higher pool: {(Number(m.total_higher) / 10_000_000).toFixed(2)} XLM</p>
            <p>📉 Lower pool: {(Number(m.total_lower) / 10_000_000).toFixed(2)} XLM</p>
            <p>🏁 Status: {m.resolved ? `Resolved — ${m.winner_higher ? "📈 Higher won" : "📉 Lower won"}` : "Open"}</p>

            {!m.resolved && (
              <>
                <input
                  placeholder="Bet amount (XLM)"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  style={inputStyle}
                  type="number"
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleBet(m.id, true)} disabled={loading} style={btnStyle("#22c55e")}>
                    📈 Bet Higher
                  </button>
                  <button onClick={() => handleBet(m.id, false)} disabled={loading} style={btnStyle("#ef4444")}>
                    📉 Bet Lower
                  </button>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => handleResolve(m.id, true)} disabled={loading} style={btnStyle("#f59e0b")}>
                    Resolve — Higher ✅
                  </button>
                  <button onClick={() => handleResolve(m.id, false)} disabled={loading} style={btnStyle("#8b5cf6")}>
                    Resolve — Lower ✅
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "20px",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  boxSizing: "border-box",
};

const btnStyle = (color) => ({
  background: color,
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "16px",
});

export default PredictionApp;