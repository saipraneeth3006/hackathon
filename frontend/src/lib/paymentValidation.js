// Strict validation for the Send Money command.
// Only Indian Rupee (₹) amounts are accepted. Ambiguous or wrongly-structured
// payment requests must NOT proceed to the payment PIN.

export const PAYMENT_MESSAGES = {
  empty: "Please enter a payment request. Example: Send ₹500 to Rahul",
  currency: "Invalid amount format. Please enter the amount in Indian Rupees (₹).",
  format:
    "Incorrect format. Please use: Send ₹amount to Name. Example: Send ₹500 to Rahul",
  voice:
    "I couldn't understand the payment request. Please say: Send 500 rupees to Rahul.",
};

// Detects a foreign currency amount such as $500, €500, £500, or "10 dollars".
export function hasForeignCurrency(raw) {
  const text = (raw || "").toLowerCase();
  if (/[$€£]/.test(text)) return true;
  if (/\b\d+(?:\.\d+)?\s*(dollars?|usd|euros?|eur|pounds?|gbp)\b/.test(text))
    return true;
  if (/\b(dollars?|usd|euros?|eur|pounds?|gbp)\b/.test(text) && /\d/.test(text))
    return true;
  return false;
}

// True when the input looks like a money-transfer attempt (so we can show the
// payment correction message instead of a generic "didn't understand").
export function looksLikePayment(raw) {
  const text = (raw || "").toLowerCase();
  return (
    /\b(send|transfer|remit|give|pay)\b/.test(text) ||
    /₹|\brs\b|\brupees?\b/.test(text) ||
    /[$€£]/.test(text) ||
    /\b\d+(?:\.\d+)?\s+to\s+[a-z]/.test(text)
  );
}

// Strictly validates and normalizes a Send Money command.
// Requires: a send/transfer verb, a positive ₹ amount, and a recipient name.
export function validateSendMoney(raw) {
  const text = (raw || "").trim();
  const hasVerb = /\b(send|transfer|remit)\b/i.test(text);

  const amtMatch =
    text.match(/₹\s*(\d+(?:\.\d{1,2})?)/) ||
    text.match(/\brs\.?\s*(\d+(?:\.\d{1,2})?)/i) ||
    text.match(/(\d+(?:\.\d{1,2})?)\s*rupees?/i) ||
    text.match(/(\d+(?:\.\d{1,2})?)/);
  const amount = amtMatch ? parseFloat(amtMatch[1]) : null;

  const nameMatch = text.match(/\bto\s+([A-Za-z][A-Za-z]*)/i);
  const recipient = nameMatch
    ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase()
    : null;

  if (!hasVerb || !amount || amount <= 0 || !recipient) {
    return { ok: false };
  }
  return { ok: true, amount, recipient };
}
