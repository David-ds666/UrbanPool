import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Wallet.css';

export default function Wallet() {
  const { user, addNotification } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [validationError, setValidationError] = useState("");
  const [statusMessage, setStatusMessage] = useState(null);
  const [totalAdded, setTotalAdded] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [referenceId, setReferenceId] = useState("");
  const [referenceError, setReferenceError] = useState("");

  const walletKey = `urbanpool_wallet_${user?.uid || user?.userId || 'guest'}`;

  const getLocalWallet = () => {
    try {
      return JSON.parse(localStorage.getItem(walletKey) || '{"balance":0,"transactions":[],"totalAdded":0,"totalSpent":0}');
    } catch { return { balance: 0, transactions: [], totalAdded: 0, totalSpent: 0 }; }
  };

  const saveLocalWallet = (bal, txs, added, spent) => {
    localStorage.setItem(walletKey, JSON.stringify({ balance: bal, transactions: txs, totalAdded: added || 0, totalSpent: spent || 0 }));
  };

  const fetchWallet = async () => {
    const local = getLocalWallet();
    setBalance(local.balance);
    setTransactions(local.transactions);
    setTotalAdded(local.totalAdded || 0);
    setTotalSpent(local.totalSpent || 0);

    try {
      const userId = user?.uid || user?.userId || "mock_user_1";
      const res = await fetch(`http://localhost:5001/api/wallet/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const bal = data.balance || 0;
        const txs = data.transactions || [];
        const added = data.totalAdded || 0;
        const spent = data.totalSpent || 0;
        setBalance(bal);
        setTransactions(txs);
        setTotalAdded(added);
        setTotalSpent(spent);
        saveLocalWallet(bal, txs, added, spent);
      }
    } catch {
      // Silently use local data — backend offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  // Client-side validation
  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (!value || value === "") {
      setValidationError("");
      return false;
    }
    if (isNaN(num) || num <= 0) {
      setValidationError("Please enter a valid amount");
      return false;
    }
    if (num < 10) {
      setValidationError("Minimum amount is ₹10");
      return false;
    }
    if (num > 10000) {
      setValidationError("Maximum amount is ₹10,000");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAddAmount(val);
    validateAmount(val);
  };

  const handleQuickAdd = (amt) => {
    setAddAmount(amt.toString());
    setValidationError("");
  };

  // Reference ID config per payment method
  const REF_CONFIG = {
    upi:        { label: 'UTR / Reference Number', placeholder: 'e.g. 427198304712 (12-digit UTR)', pattern: /^[A-Z0-9]{10,22}$/i, hint: 'Enter the UTR from your UPI app (PhonePe, GPay, Paytm, etc.)' },
    card:       { label: 'Bank Auth Code',          placeholder: 'e.g. A38291 (6-char code)',       pattern: /^[A-Z0-9]{6}$/i,       hint: 'Enter the 6-character authorization code from your bank OTP / SMS.' },
    netbanking: { label: 'Bank Reference Number',   placeholder: 'e.g. HDFC202500841293',           pattern: /^[A-Z0-9]{8,22}$/i,   hint: 'Enter the reference number from your bank transfer confirmation.' },
  };

  const validateReference = (val) => {
    const cfg = REF_CONFIG[paymentMethod];
    if (!val || val.trim() === '') {
      setReferenceError('Please enter the reference / UTR number from your payment app.');
      return false;
    }
    if (!cfg.pattern.test(val.trim())) {
      setReferenceError(`Invalid format. ${cfg.hint}`);
      return false;
    }
    setReferenceError('');
    return true;
  };

  const handleReferenceChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/\s/g, '');
    setReferenceId(val);
    if (val) validateReference(val);
    else setReferenceError('');
  };

  const generateLocalTxnId = () => 'TXN' + Math.floor(10000 + Math.random() * 90000);

  const handleAddMoney = async () => {
    const amountToAdd = parseFloat(addAmount);
    if (!validateAmount(addAmount)) return;
    if (!validateReference(referenceId)) return;

    setIsProcessing(true);
    setStatusMessage(null);

    const methodLabel = paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'card' ? 'Card' : 'Net Banking';
    const userId = user?.uid || user?.userId || 'mock_user_1';

    // ── Try backend ──
    try {
      const res = await fetch('http://localhost:5001/api/wallet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: amountToAdd, paymentMethod: methodLabel, referenceId: referenceId.trim() })
      });

      const data = await res.json();

      // ── 400 / 500: Server-side validation error (daily limit, bad input, etc.) ──
      if (res.status === 400 || res.status === 500) {
        setStatusMessage({ type: 'error', text: data.error || 'Server error. Please try again.', txnId: '' });
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 6000);
        return;
      }

      // ── 402: Payment processed but DECLINED by bank/gateway ──
      if (res.status === 402) {
        // Add a failed transaction entry to the list immediately
        const failedTx = {
          id: Date.now(),
          transactionId: data.transactionId,
          type: 'addition',
          amount: amountToAdd,
          paymentMethod: methodLabel,
          description: `Payment declined — ${data.reason}`,
          createdAt: new Date().toISOString(),
          status: 'failed'
        };
        setTransactions(prev => [failedTx, ...prev]);

        setStatusMessage({
          type: 'error',
          text: data.message || 'Payment declined by bank.',
          txnId: data.transactionId
        });
        addNotification({
          type: 'info',
          title: 'Payment Declined ❌',
          message: `₹${amountToAdd} via ${methodLabel} was declined. Txn: ${data.transactionId}`,
        });
        // Do NOT clear the input — let user retry with the same amount
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 7000);
        return;
      }

      // ── 200: Payment SUCCESS ──
      if (res.ok && data.success) {
        // Use balance returned directly from backend — no extra fetch needed
        const newBalance = parseFloat(data.balance);
        const newTx = data.transaction || {
          id: Date.now(),
          transactionId: data.transactionId,
          type: 'addition',
          amount: amountToAdd,
          paymentMethod: methodLabel,
          description: `₹${amountToAdd} added via ${methodLabel}`,
          createdAt: new Date().toISOString(),
          status: 'completed'
        };

        setBalance(newBalance);
        setTotalAdded(prev => prev + amountToAdd);
        setTransactions(prev => [newTx, ...prev]);

        // Sync localStorage
        const local = getLocalWallet();
        saveLocalWallet(newBalance, [newTx, ...local.transactions], (local.totalAdded || 0) + amountToAdd, local.totalSpent || 0);

        setStatusMessage({ type: 'success', text: data.message || 'Payment successful!', txnId: data.transactionId });
        addNotification({
          type: 'addition',
          title: 'Money Added! 💰',
          message: `₹${amountToAdd} added to wallet. Txn: ${data.transactionId}`,
        });
        setAddAmount('');
        setReferenceId('');
        setReferenceError('');
        setIsProcessing(false);
        setTimeout(() => setStatusMessage(null), 5000);
        return;
      }

    } catch {
      // ── Backend offline — simulate locally ──
      console.warn('Backend offline — simulating payment locally');
      const txnId = generateLocalTxnId();

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      // 80% success rate
      const success = Math.random() < 0.8;
      const local = getLocalWallet();

      const OFFLINE_DECLINE = [
        'Network timeout. Please check your connection.',
        'Transaction could not be verified. Try again.',
        'Payment gateway unreachable. Please retry in a moment.',
      ];
      const declineReason = OFFLINE_DECLINE[Math.floor(Math.random() * OFFLINE_DECLINE.length)];

      const newTx = {
        id: Date.now(),
        transactionId: txnId,
        type: 'addition',
        amount: amountToAdd,
        paymentMethod: methodLabel,
        description: success
          ? `₹${amountToAdd} added via ${methodLabel}`
          : `Payment declined — ${declineReason}`,
        createdAt: new Date().toISOString(),
        status: success ? 'completed' : 'failed'
      };

      const newBalance = success ? local.balance + amountToAdd : local.balance;
      const newAdded = success ? (local.totalAdded || 0) + amountToAdd : (local.totalAdded || 0);
      const newTxs = [newTx, ...local.transactions];

      setBalance(newBalance);
      setTotalAdded(newAdded);
      setTransactions(newTxs);
      saveLocalWallet(newBalance, newTxs, newAdded, local.totalSpent || 0);

      if (success) {
        setStatusMessage({ type: 'success', text: `₹${amountToAdd} added successfully!`, txnId });
        addNotification({ type: 'addition', title: 'Money Added! 💰', message: `₹${amountToAdd} added. Txn: ${txnId}` });
        setAddAmount('');
        setReferenceId('');
        setReferenceError('');
      } else {
        setStatusMessage({ type: 'error', text: declineReason, txnId });
        addNotification({ type: 'info', title: 'Payment Declined ❌', message: `₹${amountToAdd} declined. Txn: ${txnId}` });
        // Do NOT clear amount — let user retry
      }
    }

    setIsProcessing(false);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const getMethodLabel = (method) => {
    if (!method) return '—';
    return method;
  };

  return (
    <div className="wallet-container">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="wallet-processing-overlay">
          <div className="wallet-processing-modal">
            <div className="processing-spinner"></div>
            <h3>Processing payment...</h3>
            <p>Please wait while we verify your transaction</p>
            <div className="processing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      )}

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-info">
          <label>Available Balance</label>
          <h1>₹{balance.toFixed(2)}</h1>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`wallet-status-banner ${statusMessage.type}`}>
          <div className="status-icon">{statusMessage.type === 'success' ? '✅' : '❌'}</div>
          <div className="status-content">
            <p className="status-text">{statusMessage.text}</p>
            {statusMessage.txnId && <p className="status-txn">Transaction ID: <strong>{statusMessage.txnId}</strong></p>}
          </div>
          <button className="status-close" onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* Wallet Summary */}
      <div className="wallet-summary">
        <div className="summary-item added">
          <span className="summary-icon">↓</span>
          <div>
            <span className="summary-label">Total Added</span>
            <span className="summary-value">₹{totalAdded.toFixed(0)}</span>
          </div>
        </div>
        <div className="summary-item spent">
          <span className="summary-icon">↑</span>
          <div>
            <span className="summary-label">Total Spent</span>
            <span className="summary-value">₹{totalSpent.toFixed(0)}</span>
          </div>
        </div>
        <div className="summary-item balance-summary">
          <span className="summary-icon">◉</span>
          <div>
            <span className="summary-label">Current Balance</span>
            <span className="summary-value">₹{balance.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Add Money Card */}
      <div className="add-money-card">
        <h3>Add Money to Wallet</h3>
        
        <div className="add-money-input-group">
          <span className="currency-symbol">₹</span>
          <input 
            type="number" 
            placeholder="Enter amount (₹10 – ₹10,000)" 
            value={addAmount}
            onChange={handleAmountChange}
            className={`amount-input ${validationError ? 'input-error' : ''}`}
            disabled={isProcessing}
            min="10"
            max="10000"
          />
          <button 
            className="add-money-btn" 
            onClick={handleAddMoney}
            disabled={isProcessing || !!validationError || !addAmount || !referenceId || !!referenceError}
          >
            {isProcessing ? 'Processing...' : 'Verify & Add'}
          </button>
        </div>

        {validationError && <p className="validation-error">{validationError}</p>}
        
        <div className="quick-add-group">
          {[100, 500, 1000, 2000].map(amt => (
            <button 
              key={amt}
              onClick={() => handleQuickAdd(amt)}
              className="quick-add-btn"
              disabled={isProcessing}
            >
              + ₹{amt}
            </button>
          ))}
        </div>

        <div className="payment-method-group">
          <span className="method-label">Method:</span>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} disabled={isProcessing} /> UPI / QR
          </label>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} disabled={isProcessing} /> Card
          </label>
          <label className="method-option">
            <input type="radio" checked={paymentMethod === 'netbanking'} onChange={() => setPaymentMethod('netbanking')} disabled={isProcessing} /> Net Banking
          </label>
        </div>

        {paymentMethod === 'upi' && (
          <div className="upi-section">
            <div className="qr-wrapper">
                <img src="/qr-payment.jpg" alt="Scan to pay" className="qr-image"
                     onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="qr-fallback">
                  QR Code
                </div>
            </div>
            <div className="upi-info">
              <span className="upi-pay-text">
                {addAmount && parseFloat(addAmount) > 0 ? `Scan to pay ₹${addAmount}` : 'Enter amount to pay'}
              </span>
              <span className="upi-id">UPI ID: <strong>davindersinghpb108@okicici</strong></span>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="payment-form-section">
            <p className="form-section-title">Enter your card details</p>
            <input type="text" placeholder="0000 0000 0000 0000" className="payment-form-input" disabled={isProcessing} />
            <div className="card-row">
               <input type="text" placeholder="MM/YY" className="payment-form-input half" disabled={isProcessing} />
               <input type="password" placeholder="CVV" className="payment-form-input half" disabled={isProcessing} />
            </div>
          </div>
        )}

        {paymentMethod === 'netbanking' && (
           <div className="payment-form-section">
             <p className="form-section-title">Select your bank</p>
             <select className="payment-form-select" disabled={isProcessing}>
                <option value="">Select Bank...</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
             </select>
           </div>
        )}

        {/* ── Reference / UTR Verification ── */}
        <div className="ref-verify-block">
          <div className="ref-verify-header">
            <span className="ref-verify-icon">🔐</span>
            <div>
              <p className="ref-verify-title">{REF_CONFIG[paymentMethod].label}</p>
              <p className="ref-verify-hint">{REF_CONFIG[paymentMethod].hint}</p>
            </div>
          </div>
          <input
            id="wallet-ref-input"
            type="text"
            className={`ref-verify-input ${referenceError ? 'input-error' : referenceId && !referenceError ? 'input-valid' : ''}`}
            placeholder={REF_CONFIG[paymentMethod].placeholder}
            value={referenceId}
            onChange={handleReferenceChange}
            disabled={isProcessing}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
          />
          {referenceError && <p className="ref-verify-error">{referenceError}</p>}
          {referenceId && !referenceError && (
            <p className="ref-verify-ok">✓ Reference number looks valid</p>
          )}
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="history-section">
        <h2>Transaction History</h2>
        {loading ? (
          <p style={{padding: '20px', textAlign: 'center'}}>Loading ledger...</p>
        ) : transactions.length === 0 ? (
          <p style={{padding: '20px', textAlign: 'center'}}>No transactions yet.</p>
        ) : (
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th>Ref No.</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className={`tx-row ${tx.status === 'failed' ? 'tx-failed-row' : ''}`}>
                    <td className="txn-id-cell">{tx.transactionId || '—'}</td>
                    <td>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="tx-desc-cell">
                        <span className={`tx-type-badge ${tx.type}`}>
                          {tx.type === 'addition' ? '↓ Credit' : tx.type === 'bonus' ? '★ Bonus' : '↑ Debit'}
                        </span>
                        <span className="tx-desc-text">{tx.description}</span>
                      </div>
                    </td>
                    <td>{getMethodLabel(tx.paymentMethod)}</td>
                    <td className="txn-ref-cell">{tx.referenceId || tx.bankRef || '—'}</td>
                    <td className={`tx-amount-cell ${tx.type}`}>
                      {tx.type === 'addition' || tx.type === 'bonus' ? '+' : '-'} ₹{tx.amount}
                    </td>
                    <td>
                      <span className={`tx-status-badge ${tx.status}`}>
                        {tx.status === 'completed' ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Referral Banner */}
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
