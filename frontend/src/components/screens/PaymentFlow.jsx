import React, { useMemo, useState } from "react";
import { useBank } from "../../context/BankContext";
import { BILL_CATEGORIES, RECHARGE_PLANS } from "../../lib/mockData";
import {
  Send,
  FileText,
  Smartphone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Home,
  RotateCcw,
  Receipt,
} from "lucide-react";

/* ---------------- Unlock (PIN gate for opening any option) ---------------- */
export const UnlockScreen = () => {
  const { submitUnlock, goBack } = useBank();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const res = submitUnlock(pin);
    if (!res.ok) {
      setError(res.error);
      setPin("");
    }
  };

  return (
    <div className="vb-card flex flex-col gap-6 max-w-md mx-auto w-full" data-testid="unlock-screen">
      <div className="flex items-center gap-3">
        <ShieldCheck size={30} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <h2 className="vb-heading">Enter your payment PIN</h2>
      </div>
      <p className="vb-subtext" style={{ color: "var(--vb-muted)" }}>
        For your security, please enter your payment PIN to continue.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <input
          data-testid="unlock-pin-input"
          type="password"
          inputMode="numeric"
          maxLength={4}
          className="vb-input text-center tracking-[0.5em] text-3xl"
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          autoFocus
        />

        {error && (
          <div
            className="flex items-center gap-3 rounded-2xl p-4 border-2"
            style={{ borderColor: "var(--vb-error)", backgroundColor: "var(--vb-error-bg)" }}
            data-testid="unlock-error"
            role="alert"
          >
            <XCircle size={26} strokeWidth={2.5} style={{ color: "var(--vb-error)" }} />
            <p className="vb-subtext font-bold" style={{ color: "var(--vb-error)" }}>{error}</p>
          </div>
        )}

        <button type="submit" className="vb-btn vb-btn-primary" disabled={pin.length < 4} data-testid="unlock-continue-btn">
          Continue
        </button>
        <button type="button" className="vb-btn vb-btn-secondary" onClick={goBack} data-testid="unlock-cancel-btn">
          Cancel
        </button>
        <p className="text-center text-base" style={{ color: "var(--vb-muted)" }}>
          Demo payment PIN: <span className="font-bold">5678</span>
        </p>
      </form>
    </div>
  );
};

/* ---------------- Send Money ---------------- */
export const SendMoneyScreen = () => {
  const { beneficiaries, pendingPayment, setPendingPayment, navigate, announce, formatMoney } = useBank();
  const [recipient, setRecipient] = useState(pendingPayment?.recipient || "");
  const [amount, setAmount] = useState(pendingPayment?.amount ? String(pendingPayment.amount) : "");

  const canContinue = recipient && Number(amount) > 0;
  const onContinue = () => {
    const amt = Number(amount);
    setPendingPayment({ type: "transfer", recipient, amount: amt });
    navigate("review");
    announce(`You are about to send ${formatMoney(amt)} to ${recipient}. Please confirm to continue.`);
  };

  return (
    <div className="vb-card flex flex-col gap-6" data-testid="send-money-screen">
      <div className="flex items-center gap-3">
        <Send size={30} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <h2 className="vb-heading">Send Money</h2>
      </div>

      <div>
        <p className="vb-label">Choose who to send to</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {beneficiaries.map((b) => (
            <button
              key={b.id}
              data-testid={`send-recipient-${b.id}`}
              onClick={() => setRecipient(b.name)}
              className="vb-action-card items-center text-center gap-2 min-h-[120px] justify-center"
              style={{
                borderColor: recipient === b.name ? "var(--vb-blue)" : "var(--vb-border)",
                backgroundColor: recipient === b.name ? "var(--vb-surface-2)" : "var(--vb-surface)",
              }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full text-white text-xl font-bold"
                style={{ backgroundColor: "var(--vb-blue)" }}
              >
                {b.name.charAt(0)}
              </div>
              <span className="text-xl font-bold">{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="vb-label" htmlFor="send-amount">Amount (₹)</label>
        <input
          id="send-amount"
          data-testid="send-amount-input"
          type="number"
          inputMode="numeric"
          className="vb-input"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button
        className="vb-btn vb-btn-primary"
        disabled={!canContinue}
        onClick={onContinue}
        data-testid="send-continue-btn"
      >
        Continue <ArrowRight size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ---------------- Bill Pay ---------------- */
export const BillPayScreen = () => {
  const { pendingPayment, setPendingPayment, navigate, announce, formatMoney } = useBank();
  const preset = pendingPayment?.bill_type || null;
  const [selected, setSelected] = useState(
    preset ? BILL_CATEGORIES.find((c) => c.id === preset) || null : null
  );
  const [amount, setAmount] = useState(
    preset ? String(BILL_CATEGORIES.find((c) => c.id === preset)?.amount || "") : ""
  );

  const pick = (c) => {
    setSelected(c);
    setAmount(String(c.amount));
  };

  const canContinue = selected && Number(amount) > 0;
  const onContinue = () => {
    const amt = Number(amount);
    setPendingPayment({
      type: "bill",
      bill_type: selected.id,
      label: selected.label,
      provider: selected.provider,
      amount: amt,
    });
    navigate("review");
    announce(`You are about to pay ${formatMoney(amt)} for your ${selected.label} bill. Please confirm to continue.`);
  };

  return (
    <div className="vb-card flex flex-col gap-6" data-testid="bill-pay-screen">
      <div className="flex items-center gap-3">
        <FileText size={30} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <h2 className="vb-heading">Pay Bills</h2>
      </div>

      <div>
        <p className="vb-label">Choose a bill</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BILL_CATEGORIES.map((c) => (
            <button
              key={c.id}
              data-testid={`bill-category-${c.id}`}
              onClick={() => pick(c)}
              className="vb-action-card gap-1 min-h-[96px]"
              style={{
                borderColor: selected?.id === c.id ? "var(--vb-blue)" : "var(--vb-border)",
                backgroundColor: selected?.id === c.id ? "var(--vb-surface-2)" : "var(--vb-surface)",
              }}
            >
              <span className="text-xl font-bold">{c.label}</span>
              <span className="vb-subtext text-base" style={{ color: "var(--vb-muted)" }}>{c.provider}</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div>
          <label className="vb-label" htmlFor="bill-amount">Amount (₹)</label>
          <input
            id="bill-amount"
            data-testid="bill-amount-input"
            type="number"
            inputMode="numeric"
            className="vb-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      )}

      <button
        className="vb-btn vb-btn-primary"
        disabled={!canContinue}
        onClick={onContinue}
        data-testid="bill-continue-btn"
      >
        Continue <ArrowRight size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ---------------- Recharge ---------------- */
export const RechargeScreen = () => {
  const { pendingPayment, setPendingPayment, navigate, announce, formatMoney } = useBank();
  const [number, setNumber] = useState("");
  const [plan, setPlan] = useState(null);

  const amount = plan?.amount || 0;
  const canContinue = /^\d{10}$/.test(number) && amount > 0;
  const onContinue = () => {
    setPendingPayment({ type: "recharge", number, amount });
    navigate("review");
    announce(`You are about to recharge ${number} with ${formatMoney(amount)}. Please confirm to continue.`);
  };

  return (
    <div className="vb-card flex flex-col gap-6" data-testid="recharge-screen">
      <div className="flex items-center gap-3">
        <Smartphone size={30} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <h2 className="vb-heading">Mobile Recharge</h2>
      </div>

      <div>
        <label className="vb-label" htmlFor="recharge-number">Mobile Number (10 digits)</label>
        <input
          id="recharge-number"
          data-testid="recharge-number-input"
          type="tel"
          inputMode="numeric"
          className="vb-input"
          placeholder="98XXXXXXXX"
          maxLength={10}
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <div>
        <p className="vb-label">Choose a recharge plan</p>
        <div className="flex flex-col gap-3">
          {RECHARGE_PLANS.map((p) => (
            <button
              key={p.id}
              data-testid={`recharge-plan-${p.id}`}
              onClick={() => setPlan(p)}
              className="vb-action-card gap-1 min-h-[72px]"
              style={{
                borderColor: plan?.id === p.id ? "var(--vb-blue)" : "var(--vb-border)",
                backgroundColor: plan?.id === p.id ? "var(--vb-surface-2)" : "var(--vb-surface)",
              }}
            >
              <span className="text-xl font-bold">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className="vb-btn vb-btn-primary"
        disabled={!canContinue}
        onClick={onContinue}
        data-testid="recharge-continue-btn"
      >
        Continue <ArrowRight size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};

/* ---------------- Review ---------------- */
export const ReviewScreen = () => {
  const { pendingPayment: p, navigate, resetToDashboard, announce, formatMoney } = useBank();

  const rows = useMemo(() => {
    if (!p) return [];
    if (p.type === "transfer")
      return [
        ["Amount", formatMoney(p.amount)],
        ["Recipient", p.recipient],
      ];
    if (p.type === "bill")
      return [
        ["Bill Type", `${p.label} Bill`],
        ["Provider", p.provider],
        ["Amount", formatMoney(p.amount)],
      ];
    return [
      ["Mobile Number", p.number],
      ["Amount", formatMoney(p.amount)],
    ];
  }, [p, formatMoney]);

  if (!p) return null;

  const sentence =
    p.type === "transfer"
      ? `You are about to send ${formatMoney(p.amount)} to ${p.recipient}.`
      : p.type === "bill"
      ? `You are about to pay ${formatMoney(p.amount)} for your ${p.label} bill.`
      : `You are about to recharge ${p.number} with ${formatMoney(p.amount)}.`;

  const onCancel = () => {
    resetToDashboard();
    announce("The payment was cancelled.");
  };

  return (
    <div className="vb-card flex flex-col gap-6" data-testid="review-screen">
      <h2 className="vb-heading">Review Payment</h2>

      <div className="flex flex-col gap-3">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-2xl p-4 border-2"
            style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}
            data-testid={`review-row-${k.toLowerCase().replace(/\s/g, "-")}`}
          >
            <span className="vb-subtext font-bold" style={{ color: "var(--vb-muted)" }}>{k}</span>
            <span className="text-xl md:text-2xl font-extrabold">{v}</span>
          </div>
        ))}
      </div>

      <p className="text-xl font-bold" data-testid="review-sentence">{sentence}</p>

      <div className="flex items-center gap-2 rounded-xl p-3 border-2" style={{ borderColor: "var(--vb-border)", color: "var(--vb-muted)" }}>
        <ShieldCheck size={22} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <span className="text-base font-bold">You will need your payment PIN to authorise this.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="vb-btn vb-btn-primary" onClick={() => navigate("pin")} data-testid="review-confirm-btn">
          <CheckCircle2 size={26} strokeWidth={2.5} /> Confirm
        </button>
        <button className="vb-btn vb-btn-danger" onClick={onCancel} data-testid="review-cancel-btn">
          <XCircle size={26} strokeWidth={2.5} /> Cancel
        </button>
      </div>
    </div>
  );
};

/* ---------------- PIN ---------------- */
export const PinScreen = () => {
  const { verifyPin } = useBank();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const onPay = (e) => {
    e.preventDefault();
    const res = verifyPin(pin);
    if (!res.ok) {
      setError(res.error);
      setPin("");
    }
  };

  return (
    <div className="vb-card flex flex-col gap-6 max-w-md mx-auto w-full" data-testid="pin-screen">
      <div className="flex items-center gap-3">
        <Lock size={30} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
        <h2 className="vb-heading">Enter your payment PIN</h2>
      </div>

      <form onSubmit={onPay} className="flex flex-col gap-5">
        <input
          data-testid="pin-input"
          type="password"
          inputMode="numeric"
          maxLength={4}
          className="vb-input text-center tracking-[0.5em] text-3xl"
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          autoFocus
        />

        {error && (
          <div
            className="flex items-center gap-3 rounded-2xl p-4 border-2"
            style={{ borderColor: "var(--vb-error)", backgroundColor: "var(--vb-error-bg)" }}
            data-testid="pin-error"
            role="alert"
          >
            <XCircle size={26} strokeWidth={2.5} style={{ color: "var(--vb-error)" }} />
            <p className="vb-subtext font-bold" style={{ color: "var(--vb-error)" }}>{error}</p>
          </div>
        )}

        <button type="submit" className="vb-btn vb-btn-primary" disabled={pin.length < 4} data-testid="pin-pay-btn">
          Pay Now
        </button>
        <p className="text-center text-base" style={{ color: "var(--vb-muted)" }}>
          Demo payment PIN: <span className="font-bold">5678</span>
        </p>
      </form>
    </div>
  );
};

/* ---------------- Success ---------------- */
export const SuccessScreen = () => {
  const { paymentResult: r, resetToDashboard, navigate, replay, formatMoney } = useBank();
  if (!r) return null;

  const verb = r.type === "transfer" ? "sent successfully" : r.type === "bill" ? "paid successfully" : "recharge successful";

  const goTransactions = () => {
    resetToDashboard();
    navigate("transactions");
  };

  return (
    <div className="vb-card flex flex-col items-center text-center gap-5 max-w-md mx-auto w-full" data-testid="success-screen">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full"
        style={{ backgroundColor: "var(--vb-success-bg)" }}
      >
        <CheckCircle2 size={72} strokeWidth={2.5} style={{ color: "var(--vb-success)" }} />
      </div>
      <h2 className="vb-heading" style={{ color: "var(--vb-success)" }}>Payment Successful</h2>
      <p className="text-2xl font-extrabold" data-testid="success-amount">
        {formatMoney(r.amount)} {verb}
      </p>

      <div className="w-full flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between rounded-2xl p-4 border-2" style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}>
          <span className="font-bold" style={{ color: "var(--vb-muted)" }}>{r.toLine.split(":")[0] || "Details"}</span>
          <span className="text-lg font-bold text-right">{r.toLine.includes(":") ? r.toLine.split(":").slice(1).join(":").trim() : r.toLine}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl p-4 border-2" style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}>
          <span className="font-bold" style={{ color: "var(--vb-muted)" }}>Transaction ID</span>
          <span className="text-lg font-bold" data-testid="success-txn-id">{r.txnId}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl p-4 border-2" style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}>
          <span className="font-bold" style={{ color: "var(--vb-muted)" }}>Date & Time</span>
          <span className="text-lg font-bold text-right">{r.datetime}</span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3 mt-2">
        <button className="vb-btn vb-btn-primary" onClick={resetToDashboard} data-testid="success-done-btn">
          <Home size={26} strokeWidth={2.5} /> Done
        </button>
        <button className="vb-btn vb-btn-secondary" onClick={goTransactions} data-testid="success-view-txn-btn">
          <Receipt size={24} strokeWidth={2.5} /> View Transaction
        </button>
        <button className="vb-btn vb-btn-secondary" onClick={replay} data-testid="success-replay-btn">
          Hear result again
        </button>
      </div>
    </div>
  );
};

/* ---------------- Failure ---------------- */
export const FailureScreen = () => {
  const { failure, pendingPayment, resetToDashboard, navigate } = useBank();
  const reason = failure?.reason || "Payment Failed";
  const message = failure?.message || "Something went wrong. Please try again.";

  const tryAgain = () => {
    const t = pendingPayment?.type;
    if (t === "bill") navigate("bill-pay");
    else if (t === "recharge") navigate("recharge");
    else navigate("send-money");
  };

  return (
    <div className="vb-card flex flex-col items-center text-center gap-5 max-w-md mx-auto w-full" data-testid="failure-screen">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full"
        style={{ backgroundColor: "var(--vb-error-bg)" }}
      >
        <XCircle size={72} strokeWidth={2.5} style={{ color: "var(--vb-error)" }} />
      </div>
      <h2 className="vb-heading" style={{ color: "var(--vb-error)" }}>Payment Failed</h2>
      <p className="text-2xl font-extrabold" data-testid="failure-reason">{reason}</p>
      <p className="vb-subtext" data-testid="failure-message">{message}</p>

      <div className="w-full flex flex-col gap-3 mt-2">
        <button className="vb-btn vb-btn-primary" onClick={tryAgain} data-testid="failure-try-again-btn">
          <RotateCcw size={26} strokeWidth={2.5} /> Try Again
        </button>
        <button className="vb-btn vb-btn-secondary" onClick={resetToDashboard} data-testid="failure-home-btn">
          <Home size={24} strokeWidth={2.5} /> Go to Home
        </button>
      </div>
    </div>
  );
};
