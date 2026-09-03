import React, { useState } from "react";
import { useBank } from "../../context/BankContext";
import { Landmark, Lock, LogIn, AlertCircle } from "lucide-react";

export const LoginScreen = () => {
  const { doLogin } = useBank();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!doLogin(password)) {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--vb-surface)" }}
    >
      <div className="w-full max-w-md vb-card" data-testid="login-screen">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div
            className="flex items-center justify-center w-20 h-20 rounded-2xl"
            style={{ backgroundColor: "var(--vb-blue)" }}
          >
            <Landmark size={44} strokeWidth={2.5} color="#fff" />
          </div>
          <h1 className="vb-heading text-3xl md:text-4xl">Welcome to VoiceBank</h1>
          <p className="vb-subtext">Enter your app password</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="app-password" className="vb-label">
              <span className="inline-flex items-center gap-2">
                <Lock size={22} strokeWidth={2.5} /> App Password
              </span>
            </label>
            <input
              id="app-password"
              data-testid="login-password-input"
              type="password"
              inputMode="numeric"
              className="vb-input text-center tracking-widest"
              placeholder="••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-3 rounded-2xl p-4 border-2"
              style={{ borderColor: "var(--vb-error)", backgroundColor: "var(--vb-error-bg)" }}
              data-testid="login-error"
              role="alert"
            >
              <AlertCircle size={26} strokeWidth={2.5} style={{ color: "var(--vb-error)" }} />
              <p className="vb-subtext font-bold" style={{ color: "var(--vb-error)" }}>
                Incorrect password. Please try again.
              </p>
            </div>
          )}

          <button type="submit" className="vb-btn vb-btn-primary" data-testid="login-submit-btn">
            <LogIn size={26} strokeWidth={2.5} />
            Login
          </button>

          <p className="text-center vb-subtext text-base" style={{ color: "var(--vb-muted)" }}>
            Demo password: <span className="font-bold">1234</span> · Prototype only
          </p>
        </form>
      </div>
    </div>
  );
};
