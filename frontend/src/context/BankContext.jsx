import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSpeech } from "../hooks/useSpeech";
import { parseCommand } from "../lib/commandParser";
import {
  DEMO_APP_PASSWORD,
  DEMO_PAYMENT_PIN,
  INITIAL_BALANCE,
  INITIAL_BENEFICIARIES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from "../lib/mockData";
import { formatMoney, speakMoney, nowText, genTxnId } from "../lib/format";

const BankContext = createContext(null);
export const useBank = () => useContext(BankContext);

const FONT_SCALES = { normal: "100%", large: "118%", xlarge: "138%" };

// Builds a full spoken description of a screen so voice-mode users hear the
// whole screen when it opens, not just command responses.
function buildScreenSpeech(screen, d) {
  const {
    balance,
    transactions = [],
    beneficiaries = [],
    notifications = [],
    pendingPayment: p,
    paymentResult: r,
    failure: f,
  } = d;
  switch (screen) {
    case "dashboard":
      return `You are on the DevoicePay home screen. You can say: check my balance, show recent transactions, send money, pay bills, or recharge mobile. Speak or type your command.`;
    case "balance":
      return `Your available balance is ${speakMoney(balance)}.`;
    case "transactions": {
      const lines = transactions
        .slice(0, 4)
        .map(
          (t) =>
            `${t.description}, ${speakMoney(t.amount)}, ${t.type === "credit" ? "credit" : "debit"}, ${t.status}`
        )
        .join(". ");
      return `Here are your recent transactions. ${lines}.`;
    }
    case "beneficiaries":
      return `Your saved beneficiaries are ${beneficiaries
        .map((b) => b.name)
        .join(", ")}. Choose one to send money.`;
    case "notifications": {
      const lines = notifications.slice(0, 4).map((n) => n.text).join(" ");
      return `You have ${notifications.length} notifications. ${lines}`;
    }
    case "help":
      return "Here is what you can say. Check my balance. Show recent transactions. Send five hundred rupees to Rahul. Pay my electricity bill. Recharge my mobile. Say cancel to stop, or go back to return.";
    case "settings":
      return "Settings. Here you can change the text size, turn on high contrast, or log out.";
    case "send-money":
      return "Send money. Please choose who to send to, and enter the amount.";
    case "bill-pay":
      return "Pay bills. Please choose which bill you want to pay.";
    case "recharge":
      return "Mobile recharge. Please enter the mobile number and choose a recharge plan.";
    case "review": {
      if (!p) return "Review payment.";
      const s =
        p.type === "transfer"
          ? `You are about to send ${speakMoney(p.amount)} to ${p.recipient}.`
          : p.type === "bill"
          ? `You are about to pay ${speakMoney(p.amount)} for your ${p.label} bill.`
          : `You are about to recharge ${p.number} with ${speakMoney(p.amount)}.`;
      return `Review payment. ${s} Tap confirm to continue, or cancel to stop. This will need your payment PIN.`;
    }
    case "pin":
      return "Please enter your four digit payment PIN, then tap Pay Now.";
    case "unlock":
      return "For your security, please enter your payment PIN to continue.";
    case "processing":
      return "Your payment is being processed. Please wait.";
    case "success": {
      if (!r) return "Payment successful.";
      const verb =
        r.type === "transfer"
          ? "sent successfully"
          : r.type === "bill"
          ? "paid successfully"
          : "recharge successful";
      return `Payment successful. ${speakMoney(r.amount)} ${verb}. Transaction I D ${r.txnId}. You can tap Done to return home.`;
    }
    case "failure":
      return `Payment failed. ${f?.reason || ""}. ${f?.message || ""}`;
    default:
      return "";
  }
}

export function BankProvider({ children }) {
  const speech = useSpeech();

  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState(null); // 'voice' | 'text' | 'voice-text'
  const [fontScale, setFontScale] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);

  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [beneficiaries] = useState(INITIAL_BENEFICIARIES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const [screenStack, setScreenStack] = useState(["dashboard"]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [pendingIntent, setPendingIntent] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [failure, setFailure] = useState(null);

  const [recognizedText, setRecognizedText] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [processing, setProcessing] = useState(false);

  const screen = screenStack[screenStack.length - 1];

  // Refs to avoid stale closures inside callbacks.
  const modeRef = useRef(mode);
  const balanceRef = useRef(balance);
  const pendingRef = useRef(pendingPayment);
  const pendingIntentRef = useRef(pendingIntent);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { pendingRef.current = pendingPayment; }, [pendingPayment]);
  useEffect(() => { pendingIntentRef.current = pendingIntent; }, [pendingIntent]);

  // Apply font scale + high contrast to the document root.
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALES[fontScale];
  }, [fontScale]);
  useEffect(() => {
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast]);

  const { speak, cancelSpeak } = speech;

  const announce = useCallback((text) => {
    // Display-only. Speaking is handled by the per-screen auto-read below so
    // voice users hear the full screen, not just short confirmations.
    setLastResponse(text);
  }, []);

  // Auto-read the whole screen aloud when it opens, in voice modes only.
  useEffect(() => {
    if (!authed) return;
    if (mode !== "voice" && mode !== "voice-text") return;
    const text = buildScreenSpeech(screen, {
      balance,
      transactions,
      beneficiaries,
      notifications,
      pendingPayment,
      paymentResult,
      failure,
    });
    if (text) speak(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode, authed]);

  const replay = useCallback(() => {
    if (lastResponse) speak(lastResponse);
  }, [lastResponse, speak]);

  // ---- Navigation (stack based) ----
  const navigate = useCallback((target) => {
    setScreenStack((stack) =>
      stack[stack.length - 1] === target ? stack : [...stack, target]
    );
  }, []);
  const goBack = useCallback(() => {
    cancelSpeak();
    setScreenStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, [cancelSpeak]);
  const resetToDashboard = useCallback(() => {
    cancelSpeak();
    setScreenStack(["dashboard"]);
    setPendingPayment(null);
  }, [cancelSpeak]);

  // ---- Auth ----
  const login = useCallback((password) => password === DEMO_APP_PASSWORD, []);
  const doLogin = useCallback((password) => {
    if (password === DEMO_APP_PASSWORD) {
      setAuthed(true);
      return true;
    }
    return false;
  }, []);
  const chooseMode = useCallback((m) => {
    setMode(m);
    setScreenStack(["dashboard"]);
  }, []);
  const changeMode = useCallback(() => {
    cancelSpeak();
    setMode(null);
    setScreenStack(["dashboard"]);
    setPendingPayment(null);
    setPendingIntent(null);
    setRecognizedText("");
    setLastResponse("");
  }, [cancelSpeak]);
  const logout = useCallback(() => {
    cancelSpeak();
    setAuthed(false);
    setMode(null);
    setScreenStack(["dashboard"]);
    setPendingPayment(null);
    setRecognizedText("");
    setLastResponse("");
  }, [cancelSpeak]);

  // ---- Command routing ----
  // Every feature/option must be unlocked with the payment PIN before it opens.
  const GATED_ACTIONS = React.useMemo(
    () =>
      new Set([
        "check_balance",
        "recent_transactions",
        "send_money",
        "pay_bill",
        "mobile_recharge",
        "show_beneficiaries",
        "show_notifications",
        "settings",
        "help",
      ]),
    []
  );

  const requestUnlock = useCallback(
    (intent) => {
      setPendingIntent(intent);
      navigate("unlock");
      announce("Please enter your payment PIN to continue.");
    },
    [navigate, announce]
  );

  const runIntent = useCallback(
    (intent, opts = {}) => {
      const action = intent?.action || "unknown";

      if (GATED_ACTIONS.has(action) && !opts.unlocked) {
        requestUnlock(intent);
        return;
      }

      switch (action) {
        case "check_balance":
          navigate("balance");
          announce(`Your available balance is ${speakMoney(balanceRef.current)}.`);
          break;
        case "recent_transactions":
          navigate("transactions");
          announce("Here are your recent transactions.");
          break;
        case "send_money": {
          const recipient = intent.recipient || null;
          const amount = intent.amount || null;
          if (recipient && amount) {
            setPendingPayment({ type: "transfer", recipient, amount });
            navigate("review");
            announce(
              `You are about to send ${speakMoney(amount)} to ${recipient}. Please confirm to continue.`
            );
          } else {
            setPendingPayment({ type: "transfer", recipient, amount });
            navigate("send-money");
            announce("Who would you like to send money to, and how much?");
          }
          break;
        }
        case "pay_bill":
          setPendingPayment({ type: "bill", bill_type: intent.bill_type || null });
          navigate("bill-pay");
          announce("Please choose a bill to pay.");
          break;
        case "mobile_recharge":
          setPendingPayment({ type: "recharge", amount: intent.amount || null });
          navigate("recharge");
          announce("Let's recharge your mobile. Please enter the number and amount.");
          break;
        case "show_beneficiaries":
          navigate("beneficiaries");
          announce("Here are your saved beneficiaries.");
          break;
        case "show_notifications":
          navigate("notifications");
          announce("Here are your notifications.");
          break;
        case "settings":
          navigate("settings");
          announce("Here are your settings.");
          break;
        case "go_back":
          goBack();
          break;
        case "cancel":
          resetToDashboard();
          announce("Cancelled. You are back at the home screen.");
          break;
        case "help":
          navigate("help");
          announce("Here is what you can say. For example, check my balance, or send money to Rahul.");
          break;
        case "logout":
          logout();
          break;
        default: {
          const msg = "I didn't understand that. Please try again.";
          announce(msg);
          if (modeRef.current !== "text") speak(msg);
        }
      }
    },
    [GATED_ACTIONS, requestUnlock, announce, navigate, goBack, resetToDashboard, logout, speak]
  );

  // Called by the unlock PIN screen after a correct payment PIN.
  const submitUnlock = useCallback(
    (pin) => {
      if (pin !== DEMO_PAYMENT_PIN) {
        return { ok: false, error: "Incorrect payment PIN. Please try again." };
      }
      const intent = pendingIntentRef.current;
      setPendingIntent(null);
      goBack(); // remove the unlock screen from the stack
      if (intent) runIntent(intent, { unlocked: true });
      return { ok: true };
    },
    [goBack, runIntent]
  );

  const handleCommand = useCallback(
    async (raw) => {
      const text = (raw || "").trim();
      if (!text) return;
      setRecognizedText(text);
      setProcessing(true);
      try {
        const intent = await parseCommand(text);
        runIntent(intent);
      } finally {
        setProcessing(false);
      }
    },
    [runIntent]
  );

  // ---- Payment execution ----
  const verifyPin = useCallback(
    (pin) => {
      if (pin !== DEMO_PAYMENT_PIN) {
        return { ok: false, error: "Incorrect payment PIN. Please try again." };
      }
      const p = pendingRef.current;
      const amt = Number(p?.amount || 0);
      if (!p || amt <= 0) {
        return { ok: false, error: "Please enter a valid amount." };
      }
      if (amt > balanceRef.current) {
        const f = {
          reason: "Insufficient Balance",
          message: "You do not have enough balance for this payment.",
        };
        setFailure(f);
        navigate("failure");
        announce(`Payment failed. ${f.reason}. ${f.message}`);
        return { ok: true };
      }

      const txnId = genTxnId();
      const dt = nowText();
      let description = "Payment";
      let status = "Successful";
      let notifText = "Payment completed successfully.";
      let toLine = "";
      let spoken = "";

      if (p.type === "transfer") {
        description = p.recipient;
        status = "Sent";
        toLine = `To: ${p.recipient}`;
        notifText = `${formatMoney(amt)} sent successfully to ${p.recipient}.`;
        spoken = `Payment successful. ${speakMoney(amt)} sent to ${p.recipient}. Transaction I D ${txnId}.`;
      } else if (p.type === "bill") {
        description = `${p.provider} (${p.label} Bill)`;
        status = "Paid";
        toLine = `${p.label} Bill · ${p.provider}`;
        notifText = `${p.label} bill payment completed.`;
        spoken = `Payment successful. ${speakMoney(amt)} paid for your ${p.label} bill. Transaction I D ${txnId}.`;
      } else if (p.type === "recharge") {
        description = "Mobile Recharge";
        status = "Successful";
        toLine = `Mobile: ${p.number}`;
        notifText = `Mobile recharge of ${formatMoney(amt)} successful.`;
        spoken = `Recharge successful. ${speakMoney(amt)} recharge done for ${p.number}. Transaction I D ${txnId}.`;
      }

      setBalance((b) => b - amt);
      setTransactions((list) => [
        { id: txnId, date: dt.split(",")[0], description, amount: amt, type: "debit", status },
        ...list,
      ]);
      setNotifications((list) => [{ id: txnId, text: notifText, time: dt }, ...list]);

      setPaymentResult({ type: p.type, amount: amt, txnId, datetime: dt, toLine, status });
      navigate("processing");
      announce(spoken);
      return { ok: true };
    },
    [announce, navigate]
  );

  const value = {
    // speech
    ...speech,
    speak,
    announce,
    replay,
    // auth + mode
    authed,
    mode,
    doLogin,
    login,
    chooseMode,
    changeMode,
    logout,
    // a11y prefs
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    // data
    balance,
    transactions,
    beneficiaries,
    notifications,
    formatMoney,
    // navigation
    screen,
    screenStack,
    navigate,
    goBack,
    resetToDashboard,
    canGoBack: screenStack.length > 1,
    // payment
    pendingPayment,
    setPendingPayment,
    paymentResult,
    failure,
    setFailure,
    verifyPin,
    submitUnlock,
    // commands
    recognizedText,
    setRecognizedText,
    lastResponse,
    processing,
    runIntent,
    handleCommand,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}
