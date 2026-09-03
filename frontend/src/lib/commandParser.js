const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Local, offline fallback parser so the demo always works even if the API fails.
export function localParse(raw) {
  const text = (raw || "").toLowerCase().trim();
  const empty = { action: "unknown", amount: null, recipient: null, bill_type: null };
  if (!text) return empty;

  const num = (() => {
    const m = text.match(/(\d[\d,]*)/);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  })();

  if (/\b(log ?out|sign ?out)\b/.test(text)) return { ...empty, action: "logout" };
  if (/\b(cancel|stop|abort)\b/.test(text)) return { ...empty, action: "cancel" };
  if (/\b(go back|back|previous screen|return)\b/.test(text)) return { ...empty, action: "go_back" };
  if (/\b(help|what can i say|commands)\b/.test(text)) return { ...empty, action: "help" };

  if (/\b(balance|how much|money.*have)\b/.test(text)) return { ...empty, action: "check_balance" };
  if (/\b(transaction|history|recent|previous|statement)\b/.test(text))
    return { ...empty, action: "recent_transactions" };
  if (/\b(beneficiar|contacts|payees|recipients)\b/.test(text))
    return { ...empty, action: "show_beneficiaries" };
  if (/\b(notification|alerts|messages)\b/.test(text))
    return { ...empty, action: "show_notifications" };

  if (/\b(recharge|top ?up)\b/.test(text) || /\b(recharge|top ?up)\b.*(mobile|phone|number)/.test(text))
    return { ...empty, action: "mobile_recharge", amount: num };

  if (/\b(bill|pay)\b/.test(text)) {
    let bill_type = null;
    if (/electric/.test(text)) bill_type = "electricity";
    else if (/water/.test(text)) bill_type = "water";
    else if (/internet|broadband|wifi/.test(text)) bill_type = "internet";
    else if (/mobile|phone/.test(text)) bill_type = "mobile";
    if (bill_type || /bill/.test(text)) return { ...empty, action: "pay_bill", bill_type };
  }

  if (/\b(send|transfer|pay|give)\b/.test(text)) {
    const m = text.match(/to\s+([a-z]+)/);
    const recipient = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : null;
    return { ...empty, action: "send_money", amount: num, recipient };
  }

  return empty;
}

export async function parseCommand(text) {
  try {
    const res = await fetch(`${API}/parse-command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (!data || !data.action || data.action === "unknown") {
      const local = localParse(text);
      if (local.action !== "unknown") return local;
    }
    return data;
  } catch (e) {
    return localParse(text);
  }
}
