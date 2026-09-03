import React from "react";
import { useBank } from "../context/BankContext";
import {
  Home,
  ArrowLeft,
  HelpCircle,
  Contrast,
  Type,
} from "lucide-react";
import logo from "../assets/logo.jpeg";

const IconBtn = ({ testId, label, onClick, children }) => (
  <button
    data-testid={testId}
    onClick={onClick}
    aria-label={label}
    title={label}
    className="inline-flex items-center gap-2 min-h-[48px] px-3 md:px-4 rounded-xl border-2 font-bold text-base md:text-lg transition-colors"
    style={{ borderColor: "var(--vb-border)", color: "var(--vb-blue-dark)" }}
  >
    {children}
  </button>
);

export const AppHeader = () => {
  const {
    mode,
    canGoBack,
    goBack,
    resetToDashboard,
    navigate,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
  } = useBank();

  const scales = ["normal", "large", "xlarge"];
  const idx = scales.indexOf(fontScale);
  const smaller = () => idx > 0 && setFontScale(scales[idx - 1]);
  const bigger = () => idx < scales.length - 1 && setFontScale(scales[idx + 1]);

  return (
    <header
      className="w-full border-b-2 sticky top-0 z-20"
      style={{ backgroundColor: "var(--vb-bg)", borderColor: "var(--vb-border)" }}
      data-testid="app-header"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="DevoicePay"
            className="h-11 md:h-12 w-auto"
            data-testid="app-logo"
          />
        </div>

        {mode && (
          <div className="flex items-center gap-2 flex-wrap">
            {canGoBack && (
              <IconBtn testId="header-back-btn" label="Go back" onClick={goBack}>
                <ArrowLeft size={22} strokeWidth={2.5} />
                <span className="hidden sm:inline">Back</span>
              </IconBtn>
            )}
            <IconBtn testId="header-home-btn" label="Go to home" onClick={resetToDashboard}>
              <Home size={22} strokeWidth={2.5} />
              <span className="hidden sm:inline">Home</span>
            </IconBtn>
            <IconBtn
              testId="header-help-btn"
              label="Open help"
              onClick={() => navigate("help")}
            >
              <HelpCircle size={22} strokeWidth={2.5} />
              <span className="hidden sm:inline">Help</span>
            </IconBtn>
            <IconBtn
              testId="header-contrast-btn"
              label={highContrast ? "Turn off high contrast" : "Turn on high contrast"}
              onClick={() => setHighContrast((v) => !v)}
            >
              <Contrast size={22} strokeWidth={2.5} />
              <span className="hidden md:inline">
                {highContrast ? "Contrast On" : "Contrast"}
              </span>
            </IconBtn>
            <div
              className="inline-flex items-center rounded-xl border-2 overflow-hidden"
              style={{ borderColor: "var(--vb-border)" }}
            >
              <button
                data-testid="header-font-smaller-btn"
                onClick={smaller}
                aria-label="Smaller text"
                className="min-h-[48px] px-3 font-bold text-base"
                style={{ color: "var(--vb-blue-dark)" }}
              >
                <span className="inline-flex items-center gap-1">
                  <Type size={16} strokeWidth={2.5} />A-
                </span>
              </button>
              <button
                data-testid="header-font-bigger-btn"
                onClick={bigger}
                aria-label="Larger text"
                className="min-h-[48px] px-3 font-bold text-lg border-l-2"
                style={{ color: "var(--vb-blue-dark)", borderColor: "var(--vb-border)" }}
              >
                <span className="inline-flex items-center gap-1">
                  <Type size={20} strokeWidth={2.5} />A+
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
