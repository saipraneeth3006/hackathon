import React from "react";
import { useBank } from "../../context/BankContext";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Bell,
  Send,
  Volume2,
  Type,
  Contrast,
  LogOut,
  CheckCircle2,
} from "lucide-react";

const ScreenTitle = ({ icon: Icon, children, testId }) => (
  <div className="flex items-center gap-3 mb-2" data-testid={testId}>
    <div
      className="flex items-center justify-center w-12 h-12 rounded-xl"
      style={{ backgroundColor: "var(--vb-surface-2)" }}
    >
      <Icon size={28} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
    </div>
    <h2 className="vb-heading">{children}</h2>
  </div>
);

const DemoBadge = () => (
  <span
    className="inline-block rounded-lg px-3 py-1 text-sm font-bold border-2"
    style={{ borderColor: "var(--vb-border)", color: "var(--vb-muted)" }}
  >
    Demo data · Prototype
  </span>
);

export const BalanceScreen = () => {
  const { balance, formatMoney, replay } = useBank();
  return (
    <div className="vb-card flex flex-col gap-5" data-testid="balance-screen">
      <ScreenTitle icon={Wallet} testId="balance-screen-title">Available Balance</ScreenTitle>
      <div
        className="rounded-2xl p-8 text-white text-center"
        style={{ backgroundColor: "var(--vb-blue)" }}
      >
        <p className="text-lg font-medium opacity-90">Your available balance is</p>
        <p className="text-4xl md:text-5xl font-extrabold mt-2" data-testid="balance-amount">
          {formatMoney(balance)}
        </p>
      </div>
      <button className="vb-btn vb-btn-secondary" onClick={replay} data-testid="balance-hear-btn">
        <Volume2 size={26} strokeWidth={2.5} /> Hear balance again
      </button>
      <DemoBadge />
    </div>
  );
};

export const TransactionsScreen = () => {
  const { transactions, formatMoney } = useBank();
  return (
    <div className="vb-card flex flex-col gap-5" data-testid="transactions-screen">
      <ScreenTitle icon={Wallet} testId="transactions-screen-title">Recent Transactions</ScreenTitle>
      <div className="flex flex-col gap-3">
        {transactions.map((t) => {
          const credit = t.type === "credit";
          return (
            <div
              key={t.id}
              className="rounded-2xl p-4 md:p-5 border-2 flex items-center justify-between gap-4"
              style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}
              data-testid={`transaction-${t.id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: credit ? "var(--vb-success-bg)" : "var(--vb-surface-2)" }}
                >
                  {credit ? (
                    <ArrowDownLeft size={26} strokeWidth={2.5} style={{ color: "var(--vb-success)" }} />
                  ) : (
                    <ArrowUpRight size={26} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold truncate">{t.description}</p>
                  <p className="vb-subtext text-base" style={{ color: "var(--vb-muted)" }}>
                    {t.date} · {t.status}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-xl md:text-2xl font-extrabold"
                  style={{ color: credit ? "var(--vb-success)" : "var(--vb-text)" }}
                >
                  {credit ? "+" : "−"}
                  {formatMoney(t.amount)}
                </p>
                <p className="text-base font-bold" style={{ color: "var(--vb-muted)" }}>
                  {credit ? "Credit" : "Debit"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <DemoBadge />
    </div>
  );
};

export const BeneficiariesScreen = () => {
  const { beneficiaries, setPendingPayment, navigate, announce } = useBank();
  const send = (b) => {
    setPendingPayment({ type: "transfer", recipient: b.name, amount: null });
    navigate("send-money");
    announce(`Sending money to ${b.name}. Please enter the amount.`);
  };
  return (
    <div className="vb-card flex flex-col gap-5" data-testid="beneficiaries-screen">
      <ScreenTitle icon={Users} testId="beneficiaries-screen-title">Beneficiaries</ScreenTitle>
      <div className="flex flex-col gap-3">
        {beneficiaries.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl p-4 md:p-5 border-2 flex items-center justify-between gap-4 flex-wrap"
            style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}
            data-testid={`beneficiary-${b.id}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full text-white text-xl font-bold"
                style={{ backgroundColor: "var(--vb-blue)" }}
              >
                {b.name.charAt(0)}
              </div>
              <div>
                <p className="text-xl font-bold">{b.name}</p>
                <p className="vb-subtext text-base" style={{ color: "var(--vb-muted)" }}>
                  {b.bank}
                </p>
              </div>
            </div>
            <button
              className="vb-btn vb-btn-secondary w-auto px-5"
              onClick={() => send(b)}
              data-testid={`beneficiary-send-${b.id}`}
            >
              <Send size={22} strokeWidth={2.5} /> Send Money
            </button>
          </div>
        ))}
      </div>
      <DemoBadge />
    </div>
  );
};

export const NotificationsScreen = () => {
  const { notifications } = useBank();
  return (
    <div className="vb-card flex flex-col gap-5" data-testid="notifications-screen">
      <ScreenTitle icon={Bell} testId="notifications-screen-title">Notifications</ScreenTitle>
      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="rounded-2xl p-4 md:p-5 border-2 flex items-start gap-3"
            style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}
            data-testid={`notification-${n.id}`}
          >
            <CheckCircle2 size={26} strokeWidth={2.5} style={{ color: "var(--vb-success)" }} className="shrink-0 mt-1" />
            <div>
              <p className="text-lg md:text-xl font-bold">{n.text}</p>
              <p className="text-base" style={{ color: "var(--vb-muted)" }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
      <DemoBadge />
    </div>
  );
};

export const HelpScreen = () => {
  const { resetToDashboard } = useBank();
  const commands = [
    "Check my balance",
    "Show recent transactions",
    "Send ₹500 to Rahul",
    "Pay my electricity bill",
    "Recharge my mobile",
    "Show my beneficiaries",
    "Show notifications",
    "Go back",
    "Cancel",
    "Log out",
  ];
  return (
    <div className="vb-card flex flex-col gap-5" data-testid="help-screen">
      <h2 className="vb-heading">Help — What you can say or type</h2>
      <p className="vb-subtext" style={{ color: "var(--vb-muted)" }}>
        Use any of these. You can speak them or type them.
      </p>
      <div className="flex flex-col gap-3">
        {commands.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border-2 flex items-center gap-3"
            style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-surface)" }}
            data-testid={`help-command-${i}`}
          >
            <span className="text-2xl font-extrabold" style={{ color: "var(--vb-blue)" }}>“</span>
            <p className="text-xl font-bold">{c}</p>
          </div>
        ))}
      </div>
      <button className="vb-btn vb-btn-primary" onClick={resetToDashboard} data-testid="help-go-back-btn">
        Go Back
      </button>
    </div>
  );
};

export const SettingsScreen = () => {
  const { fontScale, setFontScale, highContrast, setHighContrast, logout } = useBank();
  const scales = [
    { id: "normal", label: "Normal" },
    { id: "large", label: "Large" },
    { id: "xlarge", label: "Extra Large" },
  ];
  return (
    <div className="vb-card flex flex-col gap-6" data-testid="settings-screen">
      <h2 className="vb-heading">Settings</h2>

      <div>
        <p className="vb-label"><span className="inline-flex items-center gap-2"><Type size={22} strokeWidth={2.5}/> Text Size</span></p>
        <div className="grid grid-cols-3 gap-3">
          {scales.map((s) => (
            <button
              key={s.id}
              data-testid={`settings-font-${s.id}`}
              onClick={() => setFontScale(s.id)}
              className="vb-btn"
              style={{
                backgroundColor: fontScale === s.id ? "var(--vb-blue)" : "var(--vb-bg)",
                color: fontScale === s.id ? "#fff" : "var(--vb-blue-dark)",
                border: "3px solid var(--vb-blue)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="vb-label"><span className="inline-flex items-center gap-2"><Contrast size={22} strokeWidth={2.5}/> High Contrast</span></p>
        <button
          data-testid="settings-contrast-toggle"
          onClick={() => setHighContrast((v) => !v)}
          className="vb-btn"
          style={{
            backgroundColor: highContrast ? "var(--vb-blue)" : "var(--vb-bg)",
            color: highContrast ? "#fff" : "var(--vb-blue-dark)",
            border: "3px solid var(--vb-blue)",
          }}
        >
          High Contrast is {highContrast ? "ON" : "OFF"}
        </button>
      </div>

      <button className="vb-btn vb-btn-danger" onClick={logout} data-testid="settings-logout-btn">
        <LogOut size={26} strokeWidth={2.5} /> Log Out
      </button>
    </div>
  );
};
