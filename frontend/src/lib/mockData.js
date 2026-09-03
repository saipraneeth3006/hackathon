// Simulated demo data for the VoiceBank prototype. NOT connected to any real bank.

export const DEMO_APP_PASSWORD = "1234";
export const DEMO_PAYMENT_PIN = "5678";
export const INITIAL_BALANCE = 25430.0;

export const INITIAL_BENEFICIARIES = [
  { id: "b1", name: "Rahul", bank: "HDFC Bank ••• 4821" },
  { id: "b2", name: "Priya", bank: "SBI ••• 7734" },
  { id: "b3", name: "Arun", bank: "ICICI Bank ••• 2290" },
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "t1",
    date: "12 Jun 2026",
    description: "Rahul",
    amount: 500,
    type: "debit",
    status: "Sent",
  },
  {
    id: "t2",
    date: "10 Jun 2026",
    description: "Electricity Bill",
    amount: 1240,
    type: "debit",
    status: "Paid",
  },
  {
    id: "t3",
    date: "01 Jun 2026",
    description: "Salary",
    amount: 35000,
    type: "credit",
    status: "Received",
  },
  {
    id: "t4",
    date: "28 May 2026",
    description: "Mobile Recharge",
    amount: 299,
    type: "debit",
    status: "Successful",
  },
];

export const INITIAL_NOTIFICATIONS = [
  { id: "n1", text: "₹500 sent successfully to Rahul.", time: "12 Jun 2026, 4:30 PM" },
  { id: "n2", text: "Electricity bill payment completed.", time: "10 Jun 2026, 9:15 AM" },
  { id: "n3", text: "Mobile recharge successful.", time: "28 May 2026, 6:02 PM" },
];

export const BILL_CATEGORIES = [
  { id: "electricity", label: "Electricity", provider: "State Power Board", amount: 1240 },
  { id: "water", label: "Water", provider: "City Water Supply", amount: 480 },
  { id: "internet", label: "Internet", provider: "FastNet Broadband", amount: 799 },
  { id: "mobile", label: "Mobile", provider: "Airwave Postpaid", amount: 599 },
  { id: "other", label: "Other Bills", provider: "Other Service", amount: 300 },
];

export const RECHARGE_PLANS = [
  { id: "p1", amount: 239, label: "₹239 · 1.5GB/day · 28 days" },
  { id: "p2", amount: 299, label: "₹299 · 2GB/day · 28 days" },
  { id: "p3", amount: 666, label: "₹666 · 1.5GB/day · 84 days" },
  { id: "p4", amount: 999, label: "₹999 · 2.5GB/day · 84 days" },
];
