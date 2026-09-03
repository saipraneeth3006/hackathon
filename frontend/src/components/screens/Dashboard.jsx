import React from "react";
import { useBank } from "../../context/BankContext";
import {
  Wallet,
  ReceiptText,
  Send,
  FileText,
  Smartphone,
  Users,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";

export const Dashboard = () => {
  const { runIntent } = useBank();

  const actions = [
    { testId: "action-check-balance", Icon: Wallet, label: "Check Balance", onClick: () => runIntent({ action: "check_balance" }) },
    { testId: "action-transactions", Icon: ReceiptText, label: "Recent Transactions", onClick: () => runIntent({ action: "recent_transactions" }) },
    { testId: "action-send-money", Icon: Send, label: "Send Money", onClick: () => runIntent({ action: "send_money" }) },
    { testId: "action-pay-bills", Icon: FileText, label: "Pay Bills", onClick: () => runIntent({ action: "pay_bill" }) },
    { testId: "action-recharge", Icon: Smartphone, label: "Mobile Recharge", onClick: () => runIntent({ action: "mobile_recharge" }) },
    { testId: "action-beneficiaries", Icon: Users, label: "Beneficiaries", onClick: () => runIntent({ action: "show_beneficiaries" }) },
    { testId: "action-notifications", Icon: Bell, label: "Notifications", onClick: () => runIntent({ action: "show_notifications" }) },
    { testId: "action-settings", Icon: Settings, label: "Settings", onClick: () => runIntent({ action: "settings" }) },
    { testId: "action-help", Icon: HelpCircle, label: "Help", onClick: () => runIntent({ action: "help" }) },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="dashboard-screen">
      <div>
        <p className="text-lg md:text-xl font-medium" style={{ color: "var(--vb-muted)" }}>
          Welcome back
        </p>
        <h2 className="vb-heading mt-1">What would you like to do?</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {actions.map(({ testId, Icon, label, onClick }) => (
          <button key={testId} data-testid={testId} onClick={onClick} className="vb-action-card">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-2xl"
              style={{ backgroundColor: "var(--vb-surface-2)" }}
            >
              <Icon size={34} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
            </div>
            <span className="text-xl md:text-2xl font-bold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
