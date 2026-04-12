import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Wallet.css';

export default function Wallet() {
  const { user, addNotification } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [cashbackEarned, setCashbackEarned] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const walletKey = `urbanpool_wallet_${user?.uid || user?.userId || 'guest'}`;

  const getLocalWallet = () => {
    try {
      return JSON.parse(localStorage.getItem(walletKey) || '{"balance":0,"transactions":[]}');
    } catch { return { balance: 0, transactions: [] }; }
  };

  const saveLocalWallet = (bal, txs) => {
    localStorage.setItem(walletKey, JSON.stringify({ balance: bal, transactions: txs }));
  };

  const fetchWallet = async () => {
    // Always load local first for instant display
    const local = getLocalWallet();
    setBalance(local.balance);
    setTransactions(local.transactions);
    calculateStats(local.transactions);

    try {
      const userId = user?.uid || user?.userId || "mock_user_1";
      const res = await fetch(`http://localhost:5001/api/wallet/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const bal = data.balance || 0;
        const txs = data.transactions || [];
        setBalance(bal);
        setTransactions(txs);
        calculateStats(txs);
        saveLocalWallet(bal, txs); // keep local in sync
      }
    } catch {
      // Silently use local data — backend offline
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (txs) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let spent = 0;
    let earned = 0;

    txs.forEach(tx => {
      if (tx.type === 'deduction') {
        const txDate = new Date(tx.createdAt);
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          spent += tx.amount;
        }
      } else if (tx.type === 'bonus') {
        earned += tx.amount;
      }
    });

    setSpentThisMonth(spent);
    setCashbackEarned(earned);
  };

  useEffect(() => {
    // Re-fetch whenever user changes so we always use the correct Firebase UID,
    // not "mock_user_1" which gets set when user is still null on first mount.
    fetchWallet();
  }, [user]);

  const handleAddMoney = async (amount) => {
    const amountToAdd = amount || parseFloat(addAmount);
    if (!amountToAdd || isNaN(amountToAdd) || amountToAdd <= 0) return;
    
    setIsAdding(true);

    let success = false;
    let newBalance = balance;

    // Try backend first
    try {
      const userId = user?.uid || user?.userId || "mock_user_1";
      let methodLabel = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking';
      const res = await fetch(`http://localhost:5001/api/wallet/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: amountToAdd, paymentMethod: methodLabel })
      });
      if (res.ok) {
        success = true;
        fetchWallet(); // refresh from backend
      } else {
        const data = await res.json().catch(() => ({}));
        console.warn("Backend add money error:", data.error);
      }
    } catch {
      console.warn("Backend offline — saving wallet locally");
    }

    // Fallback: save to localStorage
    if (!success) {
      try {
        const local = getLocalWallet();
        newBalance = local.balance + amountToAdd;
        const newTx = {
          id: Date.now(),
          type: 'addition',
          amount: amountToAdd,
          description: `Added via ${paymentMethod.toUpperCase()}`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        };
        const newTxs = [newTx, ...local.transactions];
        saveLocalWallet(newBalance, newTxs);
        setBalance(newBalance);
        setTransactions(newTxs);
        calculateStats(newTxs);
        success = true;
      } catch {
        // ignore
      }
    }

    if (success) {
      setAddAmount("");
      addNotification({
        type: 'addition',
        title: 'Money Added! 💰',
        message: `₹${amountToAdd} has been added to your UrbanPool wallet.`,
      });
    } else {
      addNotification({
        type: 'info',
        title: 'Failed to Add Money',
        message: 'Could not process your request. Please try again.',
      });
    }

    setIsAdding(false);
  };

  return (
    <div className="wallet-container">
      <div className="balance-card">
        <div className="balance-info">
          <label>Available Balance</label>
          <h1>₹{balance.toFixed(2)}</h1>
        </div>
      </div>

      <div className="add-money-card">
        <h3>Add Money to Wallet</h3>
        
        <div className="add-money-input-group">
          <span className="currency-symbol">₹</span>
          <input 
            type="number" 
            placeholder="Enter amount" 
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="amount-input"
          />
          <button 
            className="add-money-btn" 
            onClick={() => handleAddMoney()}
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
        
        <div className="quick-add-group">
          {[100, 500, 1000].map(amt => (
            <button 
              key={amt}
              onClick={() => setAddAmount(amt.toString())}
              className="quick-add-btn"
            >
              + ₹{amt}
            </button>
          ))}
        </div>

        <div className="payment-method-group">
          <span className="method-label">Method:</span>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI / QR
          </label>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card
          </label>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} /> Net Banking
          </label>
        </div>

        {paymentMethod === 'upi' && (
          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: "center" }}>
            <div style={{ border: "2px solid #e2e8f0", padding: "16px", borderRadius: "12px", display: "inline-block", background: "#fff" }}>
                <img src="/qr-payment.jpg" alt="Scan to pay" style={{ width: "120px", height: "120px", objectFit: "contain" }} 
                     onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div style={{ display: "none", width: "120px", height: "120px", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: "8px", fontWeight: "600", color: "#94a3b8" }}>
                  QR Code
                </div>
            </div>
            <div style={{ marginTop: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", display: "block", marginBottom: "4px", color: "#334155" }}>
                Scan to add ₹{addAmount || '0'}
              </span>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: "center" }}>
            <p style={{fontSize: "14px", color: "#64748b", margin: 0, textAlign: "left", fontWeight: "600"}}>Enter your card details</p>
            <input type="text" placeholder="0000 0000 0000 0000" style={{width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} />
            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
               <input type="text" placeholder="MM/YY" style={{width: '50%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} />
               <input type="password" placeholder="CVV" style={{width: '50%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none'}} />
            </div>
          </div>
        )}

        {paymentMethod === 'netbanking' && (
           <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: "left" }}>
             <p style={{fontSize: "14px", color: "#64748b", margin: "0 0 10px 0", fontWeight: "600"}}>Select your bank</p>
             <select style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff'}}>
                <option value="">Select Bank...</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
             </select>
           </div>
        )}
      </div>

      <div className="wallet-stats">
        <div className="stat-item">
          <span className="stat-label">Spent this month</span>
          <span className="stat-value">₹{spentThisMonth.toFixed(0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Cashback/Bonuses</span>
          <span className="stat-value bonus">₹{cashbackEarned.toFixed(0)}</span>
        </div>
      </div>

      <div className="history-section">
        <h2>Transaction History</h2>
        <div className="transaction-list">
          {loading ? <p style={{padding: '20px', textAlign: 'center'}}>Loading ledger...</p> : transactions.length === 0 ? <p style={{padding: '20px', textAlign: 'center'}}>No transactions yet.</p> : transactions.map(tx => (
            <div key={tx.id} className="transaction-item">
              <div className={`tx-icon ${tx.type}`}>
                {tx.type === 'addition' ? '↓' : tx.type === 'bonus' ? '★' : '↑'}
              </div>
              <div className="tx-details">
                <p className="tx-desc">{tx.description}</p>
                <p className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</p>
              </div>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === 'addition' || tx.type === 'bonus' ? '+' : '-'} ₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="referral-banner">
        <div className="banner-content">
          <h3>Refer & Earn</h3>
          <p>Get ₹100 for every friend who takes their first ride!</p>
        </div>
        <button className="invite-btn">Invite Friends</button>
      </div>
    </div>
  );
}
