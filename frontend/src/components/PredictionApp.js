/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { connectWallet, signTx } from "../freighter.js";
import * as StellarSdk from "@stellar/stellar-sdk";

const CONTRACT_ID = "CDNC4IUTQGIB32QKMI7MPILQFEWNALBMIUYQSRK2ZFHAJITKAEKQZMEX";
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const ALICE = "GBG3W7PXLJTJJRTL7KSORWALYZPISUBDBOBPIBVEDDBNOGHTABBQ5CBO";

const server = new StellarSdk.rpc.Server(RPC_URL);

const D = {
  appBg: "linear-gradient(145deg,#141414,#1f1f1f,#191919)",
  navBg: "rgba(20,20,20,0.8)", navBorder: "1px solid rgba(255,255,255,0.07)",
  logo: "#e8e8e8", heroTitle: "#f2f2f2", heroSub: "rgba(255,255,255,0.35)",
  statsBg: "rgba(255,255,255,0.05)", statsBorder: "1px solid rgba(255,255,255,0.08)",
  statNum: "#e8e8e8", statLabel: "rgba(255,255,255,0.3)", statDiv: "rgba(255,255,255,0.07)",
  secLabel: "rgba(255,255,255,0.28)",
  cardBg: "rgba(255,255,255,0.05)", cardBorder: "1px solid rgba(255,255,255,0.09)",
  cardShadow: "0 16px 48px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06)",
  cardTitle: "#f2f2f2", cardDesc: "rgba(255,255,255,0.4)",
  sboxBg: "rgba(255,255,255,0.06)", sboxBorder: "rgba(255,255,255,0.09)", sboxNum: "#d4d4d4", sboxLabel: "rgba(255,255,255,0.28)",
  progBg: "rgba(255,255,255,0.07)", progHigher: "rgba(255,255,255,0.4)", progLower: "rgba(255,255,255,0.2)",
  badgeBg: "rgba(255,255,255,0.07)", badgeBorder: "rgba(255,255,255,0.14)", badgeColor: "#ccc",
  doneBg: "rgba(180,180,180,0.1)", doneBorder: "rgba(180,180,180,0.22)", doneColor: "#aaa",
  higherBg: "rgba(255,255,255,0.1)", higherBorder: "rgba(255,255,255,0.18)", higherColor: "#fff",
  lowerBg: "rgba(255,255,255,0.07)", lowerBorder: "rgba(255,255,255,0.12)", lowerColor: "#ccc",
  resolveBg: "rgba(255,255,255,0.06)", resolveBorder: "rgba(255,255,255,0.1)", resolveColor: "#bbb",
  themeBg: "rgba(255,255,255,0.07)", themeBorder: "1px solid rgba(255,255,255,0.12)", themeColor: "#ccc",
  walletBg: "rgba(255,255,255,0.1)", walletBorder: "1px solid rgba(255,255,255,0.18)", walletColor: "#fff",
  launchBg: "rgba(255,255,255,0.1)", launchBorder: "1px solid rgba(255,255,255,0.18)", launchColor: "#fff",
  inputBg: "rgba(255,255,255,0.06)", inputBorder: "1px solid rgba(255,255,255,0.1)", inputColor: "#f1f1f1",
  resolvedText: "rgba(190,190,190,0.5)",
};

const L = {
  appBg: "linear-gradient(145deg,#f5f5f5,#ececec,#f0f0f0)",
  navBg: "rgba(255,255,255,0.85)", navBorder: "1px solid rgba(0,0,0,0.07)",
  logo: "#111", heroTitle: "#111", heroSub: "rgba(0,0,0,0.4)",
  statsBg: "#ffffff", statsBorder: "1px solid #e0e0e0",
  statNum: "#111", statLabel: "rgba(0,0,0,0.38)", statDiv: "#e8e8e8",
  secLabel: "rgba(0,0,0,0.3)",
  cardBg: "#ffffff", cardBorder: "1px solid #e4e4e4",
  cardShadow: "0 4px 24px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
  cardTitle: "#111", cardDesc: "rgba(0,0,0,0.5)",
  sboxBg: "#f7f7f7", sboxBorder: "#e8e8e8", sboxNum: "#111", sboxLabel: "rgba(0,0,0,0.38)",
  progBg: "#ebebeb", progHigher: "#111", progLower: "#bbb",
  badgeBg: "#f4f4f4", badgeBorder: "#ddd", badgeColor: "#444",
  doneBg: "#f4f4f4", doneBorder: "#ddd", doneColor: "#444",
  higherBg: "#111", higherBorder: "#111", higherColor: "#fff",
  lowerBg: "#f0f0f0", lowerBorder: "#ddd", lowerColor: "#333",
  resolveBg: "#f7f7f7", resolveBorder: "#e0e0e0", resolveColor: "#555",
  themeBg: "#f0f0f0", themeBorder: "1px solid #ddd", themeColor: "#111",
  walletBg: "#111", walletBorder: "1px solid #111", walletColor: "#fff",
  launchBg: "#111", launchBorder: "1px solid #111", launchColor: "#fff",
  inputBg: "#ffffff", inputBorder: "1px solid #e2e2e2", inputColor: "#111",
  resolvedText: "rgba(0,0,0,0.38)",
};

export default function PredictionApp() {
  const [dark, setDark] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [asset, setAsset] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const t = dark ? D : L;

  useEffect(() => { loadMarkets(); }, []);

  const loadMarkets = async () => {
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(ALICE);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100", networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(contract.call("get_markets")).setTimeout(30).build();
      const sim = await server.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationSuccess(sim)) {
        setMarkets(StellarSdk.scValToNative(sim.result.retval));
      }
    } catch (e) { console.error("Error loading markets:", e); }
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
        fee: "100", networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(contract.call(
        "create_market",
        StellarSdk.nativeToScVal(asset, { type: "string" }),
        StellarSdk.nativeToScVal(BigInt(parseFloat(targetPrice) * 100), { type: "i128" }),
        StellarSdk.nativeToScVal(BigInt(1000), { type: "u64" }),
      )).setTimeout(30).build();
      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);
      setAsset(""); setTargetPrice("");
      setTimeout(loadMarkets, 3000);
      alert("Market created!");
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const handleBet = async (marketId, predictHigher) => {
    if (!wallet) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(wallet);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100", networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(contract.call(
        "place_bet",
        StellarSdk.nativeToScVal(marketId, { type: "u32" }),
        StellarSdk.nativeToScVal(wallet, { type: "address" }),
        StellarSdk.nativeToScVal(BigInt(parseFloat(betAmount) * 10_000_000), { type: "i128" }),
        StellarSdk.xdr.ScVal.scvBool(predictHigher),
      )).setTimeout(30).build();
      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);
      setTimeout(loadMarkets, 3000);
      alert(`Bet placed — ${predictHigher ? "Higher" : "Lower"}!`);
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const handleResolve = async (marketId, wentHigher) => {
    if (!wallet) return alert("Connect wallet first!");
    setLoading(true);
    try {
      const contract = new StellarSdk.Contract(CONTRACT_ID);
      const account = await server.getAccount(wallet);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: "100", networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(contract.call(
        "resolve_market",
        StellarSdk.nativeToScVal(marketId, { type: "u32" }),
        StellarSdk.xdr.ScVal.scvBool(wentHigher),
      )).setTimeout(30).build();
      const sim = await server.simulateTransaction(tx);
      const prepTx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
      const signed = await signTx(prepTx.toXDR());
      const finalTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
      await server.sendTransaction(finalTx);
      setTimeout(loadMarkets, 3000);
      alert("Market resolved!");
    } catch (e) { alert("Error: " + e.message); }
    setLoading(false);
  };

  const inputStyle = {
    display: "block", width: "100%", padding: "15px 20px", marginBottom: "12px",
    borderRadius: "14px", border: t.inputBorder, background: t.inputBg,
    color: t.inputColor, fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.2s",
  };

  const btn = (bg, border, color, extra = {}) => ({
    background: bg, border: `1px solid ${border}`, borderRadius: "14px",
    padding: "13px 20px", cursor: "pointer", color, fontSize: "14px",
    fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s", ...extra,
  });

  return (
    <div style={{ minHeight: "100vh", background: t.appBg, fontFamily: "'Sora','Segoe UI',sans-serif", transition: "all 0.4s", paddingBottom: "60px" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 36px", background: t.navBg, backdropFilter: "blur(24px)", borderBottom: t.navBorder, position: "sticky", top: 0, zIndex: 100, transition: "all 0.4s" }}>
        <div style={{ fontSize: "21px", fontWeight: 800, letterSpacing: "-0.5px", color: t.logo }}>◈ PredictChain</div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={() => setDark(!dark)} style={{ background: t.themeBg, border: t.themeBorder, borderRadius: "50px", padding: "9px 18px", cursor: "pointer", color: t.themeColor, fontSize: "12px", fontWeight: 700, fontFamily: "inherit" }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
          {!wallet ? (
            <button onClick={handleConnect} style={{ background: t.walletBg, border: t.walletBorder, borderRadius: "50px", padding: "9px 20px", cursor: "pointer", color: t.walletColor, fontSize: "12px", fontWeight: 700, fontFamily: "inherit" }}>
              Connect Wallet
            </button>
          ) : (
            <div style={{ background: dark ? "rgba(120,120,120,0.12)" : "#f0f0f0", border: dark ? "1px solid rgba(120,120,120,0.2)" : "1px solid #ddd", borderRadius: "50px", padding: "9px 20px", color: dark ? "#bbb" : "#333", fontSize: "12px", fontWeight: 700 }}>
              ● {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "52px 20px 38px" }}>
        <div style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "10px", color: t.heroTitle }}>Predict the Market</div>
        <div style={{ fontSize: "15px", color: t.heroSub }}>Decentralized crypto price predictions on Stellar & Soroban</div>
        <div style={{ display: "inline-flex", marginTop: "28px", borderRadius: "20px", padding: "18px 36px", background: t.statsBg, border: t.statsBorder }}>
          {[["Markets", markets.length], ["Active", markets.filter(m => !m.resolved).length], ["Resolved", markets.filter(m => m.resolved).length]].map(([label, val], i, arr) => (
            <div key={label} style={{ textAlign: "center", padding: "0 28px", borderRight: i < arr.length - 1 ? `1px solid ${t.statDiv}` : "none" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: t.statNum }}>{val}</div>
              <div style={{ fontSize: "10px", color: t.statLabel, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "3px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>

        {/* Create Market */}
        <div style={{ background: t.cardBg, backdropFilter: "blur(24px)", border: t.cardBorder, borderRadius: "28px", padding: "36px 40px", marginBottom: "32px", boxShadow: t.cardShadow, transition: "all 0.3s" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: t.secLabel, marginBottom: "22px" }}>Create a Market</div>
          <input style={inputStyle} placeholder="Asset (e.g. BTC, ETH, XLM)" value={asset} onChange={e => setAsset(e.target.value)} />
          <input style={inputStyle} placeholder="Target Price (USD)" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} type="number" />
          <button onClick={handleCreateMarket} disabled={loading} style={{ width: "100%", background: t.launchBg, border: t.launchBorder, borderRadius: "14px", padding: "16px", color: t.launchColor, fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "4px" }}>
            {loading ? "Creating..." : "Create Market →"}
          </button>
        </div>

        {/* Markets */}
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: t.secLabel, marginBottom: "20px" }}>Active Markets</div>

        {markets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: t.secLabel, fontSize: "15px" }}>
            No markets yet — create the first one!
          </div>
        ) : markets.map((m, i) => {
          const total = Number(m.total_higher) + Number(m.total_lower);
          const higherPct = total > 0 ? (Number(m.total_higher) / total) * 100 : 50;
          const lowerPct = 100 - higherPct;

          return (
            <div key={i} style={{ background: t.cardBg, backdropFilter: "blur(24px)", border: t.cardBorder, borderRadius: "28px", padding: "34px 38px", marginBottom: "24px", boxShadow: t.cardShadow, transition: "all 0.3s" }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: t.cardTitle, letterSpacing: "-0.4px" }}>{m.asset} Price Market #{m.id}</div>
                <span style={{ background: m.resolved ? t.doneBg : t.badgeBg, border: `1px solid ${m.resolved ? t.doneBorder : t.badgeBorder}`, borderRadius: "50px", padding: "5px 14px", fontSize: "10px", fontWeight: 700, color: m.resolved ? t.doneColor : t.badgeColor, letterSpacing: "1.5px", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {m.resolved ? "RESOLVED" : "OPEN"}
                </span>
              </div>
              <div style={{ fontSize: "14px", color: t.cardDesc, marginBottom: "22px" }}>
                Target: ${(Number(m.target_price) / 100).toFixed(2)} USD
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                {[
                  ["Target Price", `$${(Number(m.target_price) / 100).toFixed(2)}`],
                  ["Higher Pool", `${(Number(m.total_higher) / 10_000_000).toFixed(2)} XLM`],
                  ["Lower Pool", `${(Number(m.total_lower) / 10_000_000).toFixed(2)} XLM`],
                ].map(([label, val]) => (
                  <div key={label} style={{ flex: 1, background: t.sboxBg, border: `1px solid ${t.sboxBorder}`, borderRadius: "18px", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: t.sboxLabel, marginBottom: "5px", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: t.sboxNum }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar — higher vs lower */}
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: t.secLabel, fontWeight: 600 }}>Higher {higherPct.toFixed(0)}%</span>
                <span style={{ fontSize: "11px", color: t.secLabel, fontWeight: 600 }}>Lower {lowerPct.toFixed(0)}%</span>
              </div>
              <div style={{ height: "7px", background: t.progBg, borderRadius: "50px", marginBottom: "22px", overflow: "hidden", display: "flex" }}>
                <div style={{ height: "100%", width: `${higherPct}%`, background: t.progHigher, borderRadius: "50px 0 0 50px", transition: "width 0.6s ease" }} />
                <div style={{ height: "100%", width: `${lowerPct}%`, background: t.progLower, borderRadius: "0 50px 50px 0", transition: "width 0.6s ease" }} />
              </div>

              {m.resolved ? (
                <div style={{ textAlign: "center", padding: "12px", color: t.resolvedText, fontWeight: 600, fontSize: "13px", letterSpacing: "0.5px" }}>
                  ✓ Resolved — {m.winner_higher ? "Higher won" : "Lower won"}
                </div>
              ) : (
                <>
                  {/* Bet input */}
                  <input style={{ ...inputStyle, marginBottom: "14px" }} placeholder="Bet amount (XLM)" value={betAmount} onChange={e => setBetAmount(e.target.value)} type="number" />

                  {/* Bet buttons */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <button onClick={() => handleBet(m.id, true)} disabled={loading} style={btn(t.higherBg, t.higherBorder, t.higherColor, { flex: 1 })}>
                      ↑ Bet Higher
                    </button>
                    <button onClick={() => handleBet(m.id, false)} disabled={loading} style={btn(t.lowerBg, t.lowerBorder, t.lowerColor, { flex: 1 })}>
                      ↓ Bet Lower
                    </button>
                  </div>

                  {/* Resolve buttons */}
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleResolve(m.id, true)} disabled={loading} style={btn(t.resolveBg, t.resolveBorder, t.resolveColor, { flex: 1, fontSize: "12px" })}>
                      Resolve — Higher ✓
                    </button>
                    <button onClick={() => handleResolve(m.id, false)} disabled={loading} style={btn(t.resolveBg, t.resolveBorder, t.resolveColor, { flex: 1, fontSize: "12px" })}>
                      Resolve — Lower ✓
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
