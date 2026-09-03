import React from "react";
import { useBank } from "../../context/BankContext";
import { Mic, Keyboard, MessagesSquare, ChevronRight } from "lucide-react";

const MODES = [
  {
    id: "voice",
    testId: "mode-voice-card",
    Icon: Mic,
    title: "Voice Only",
    subtitle: "Speak & Listen",
  },
  {
    id: "text",
    testId: "mode-text-card",
    Icon: Keyboard,
    title: "Text Only",
    subtitle: "Type & Read",
  },
  {
    id: "voice-text",
    testId: "mode-voice-text-card",
    Icon: MessagesSquare,
    title: "Voice + Text",
    subtitle: "Speak, Listen & Read",
  },
];

export const ModeSelectScreen = () => {
  const { chooseMode } = useBank();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--vb-surface)" }}
    >
      <div className="w-full max-w-3xl" data-testid="mode-select-screen">
        <h1 className="vb-heading text-center text-3xl md:text-4xl mb-3">
          How would you like to use DevoicePay?
        </h1>
        <p className="vb-subtext text-center mb-8" style={{ color: "var(--vb-muted)" }}>
          Choose the way that is easiest for you. You can change this anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {MODES.map(({ id, testId, Icon, title, subtitle }) => (
            <button
              key={id}
              data-testid={testId}
              onClick={() => chooseMode(id)}
              className="vb-action-card items-center text-center gap-4 min-h-[220px] justify-center"
            >
              <div
                className="flex items-center justify-center w-20 h-20 rounded-2xl"
                style={{ backgroundColor: "var(--vb-blue)" }}
              >
                <Icon size={44} strokeWidth={2.5} color="#fff" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--vb-text)" }}>
                  {title}
                </p>
                <p className="vb-subtext" style={{ color: "var(--vb-muted)" }}>
                  {subtitle}
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 font-bold text-lg"
                style={{ color: "var(--vb-blue)" }}
              >
                Select <ChevronRight size={22} strokeWidth={2.5} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
