import React from "react";
import { useBank } from "../context/BankContext";
import { AppHeader } from "./AppHeader";
import { CommandBar } from "./CommandBar";
import { VolumeX } from "lucide-react";
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
  ProcessingScreen,
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
  processing: ProcessingScreen,
  success: SuccessScreen,
  failure: FailureScreen,
};

// Command bar is hidden on focused / secure screens.
const HIDE_COMMAND_BAR = new Set(["pin", "unlock", "processing", "success", "failure", "review"]);

// Small side "mute / stop" button: instantly stops any voice output and
// voice listening. Shown only in voice and voice+text modes.
const StopVoiceButton = () => {
  const { mode, cancelSpeak, stopListening, listening, speaking } = useBank();
  if (mode !== "voice" && mode !== "voice-text") return null;

  const active = listening || speaking;
  const onStop = () => {
    cancelSpeak();
    stopListening();
  };

  return (
    <button
      data-testid="stop-voice-btn"
      onClick={onStop}
      aria-label="Stop voice — mute listening and speaking"
      title="Stop voice (mute)"
      className="fixed right-4 bottom-6 md:bottom-8 z-30 flex flex-col items-center justify-center gap-1 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full text-white shadow-lg transition-transform active:scale-95"
      style={{ backgroundColor: active ? "var(--vb-error)" : "var(--vb-blue-dark)" }}
    >
      <VolumeX size={28} strokeWidth={2.5} />
      <span className="text-[11px] md:text-xs font-bold leading-none">Stop</span>
    </button>
  );
};

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
      <StopVoiceButton />
    </div>
  );
};
