import React from "react";
import { useBank } from "../context/BankContext";
import { AppHeader } from "./AppHeader";
import { CommandBar } from "./CommandBar";
import { Dashboard } from "./screens/Dashboard";
import {
  BalanceScreen,
  TransactionsScreen,
  BeneficiariesScreen,
  NotificationsScreen,
  HelpScreen,
  SettingsScreen,
} from "./screens/InfoScreens";
import {
  SendMoneyScreen,
  BillPayScreen,
  RechargeScreen,
  ReviewScreen,
  PinScreen,
  SuccessScreen,
  FailureScreen,
  UnlockScreen,
} from "./screens/PaymentFlow";

const SCREENS = {
  dashboard: Dashboard,
  balance: BalanceScreen,
  transactions: TransactionsScreen,
  beneficiaries: BeneficiariesScreen,
  notifications: NotificationsScreen,
  help: HelpScreen,
  settings: SettingsScreen,
  "send-money": SendMoneyScreen,
  "bill-pay": BillPayScreen,
  recharge: RechargeScreen,
  review: ReviewScreen,
  pin: PinScreen,
  unlock: UnlockScreen,
  success: SuccessScreen,
  failure: FailureScreen,
};

// Command bar is hidden on focused / secure screens.
const HIDE_COMMAND_BAR = new Set(["pin", "unlock", "success", "failure", "review"]);

export const BankApp = () => {
  const { screen } = useBank();
  const ScreenComponent = SCREENS[screen] || Dashboard;
  const showCommandBar = !HIDE_COMMAND_BAR.has(screen);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--vb-bg)" }}>
      <AppHeader />
      <main className="vb-page flex flex-col gap-6">
        {showCommandBar && <CommandBar />}
        <ScreenComponent />
      </main>
    </div>
  );
};
