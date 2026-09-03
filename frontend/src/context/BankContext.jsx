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
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { pendingRef.current = pendingPayment; }, [pendingPayment]);

  // Apply font scale + high contrast to the document root.
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SCALES[fontScale];
  }, [fontScale]);
  useEffect(() => {
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast]);

  const { speak, cancelSpeak } = speech;

  const announce = useCallback(
    (text) => {
      setLastResponse(text);
      if (modeRef.current !== "text") speak(text);
    },
    [speak]
  );

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
  const runIntent = useCallback(
    (intent) => {
      const action = intent?.action || "unknown";
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
        default:
          announce("I didn't understand that. Please try again.");
      }
    },
    [announce, navigate, goBack, resetToDashboard, logout]
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
      navigate("success");
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
