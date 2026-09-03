export const formatMoney = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatMoneyShort = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Speech-friendly amount (₹ spoken as "rupees")
export const speakMoney = (n) =>
  `${Number(n || 0).toLocaleString("en-IN")} rupees`;

export const nowText = () =>
  new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export const genTxnId = () => "TXN" + Math.floor(1000 + Math.random() * 9000);
