import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { Mic, MicOff, Send, Volume2, Loader2, MessageSquareText } from "lucide-react";

export const CommandBar = () => {
  const {
    mode,
    listening,
    startListening,
    stopListening,
    handleCommand,
    recognizedText,
    lastResponse,
    replay,
    processing,
    recognitionSupported,
    speaking,
  } = useBank();

  const [text, setText] = useState("");
  const showVoice = mode === "voice" || mode === "voice-text";
  const showText = mode === "text" || mode === "voice-text" || !recognitionSupported;

  const onMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      startListening((result) => handleCommand(result));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleCommand(text);
    setText("");
  };

  return (
    <section
      className="vb-card"
      style={{ backgroundColor: "var(--vb-surface)" }}
      data-testid="command-bar"
    >
      {showVoice && (
        <div className="flex flex-col items-center text-center gap-4">
          {!recognitionSupported ? (
            <p
              className="vb-subtext font-bold"
              style={{ color: "var(--vb-error)" }}
              data-testid="voice-unsupported-message"
            >
              Voice input is not supported in this browser. Please type your request below.
            </p>
          ) : (
            <>
              <div className="relative">
                <button
                  data-testid="mic-button"
                  onClick={onMicClick}
                  aria-label={listening ? "Stop listening" : "Tap to speak"}
                  className={`relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full text-white transition-transform active:scale-95 ${
                    listening ? "vb-mic-listening" : ""
                  }`}
                  style={{
                    backgroundColor: listening
                      ? "var(--vb-blue-dark)"
                      : "var(--vb-blue)",
                  }}
                >
                  {listening ? (
                    <MicOff size={52} strokeWidth={2.5} />
                  ) : (
                    <Mic size={52} strokeWidth={2.5} />
                  )}
                </button>
              </div>
              <div>
                <p className="vb-heading" data-testid="mic-label">
                  {listening ? "Listening..." : "Tap to Speak"}
                </p>
                <p className="vb-subtext">Speak your command</p>
              </div>
            </>
          )}
        </div>
      )}

      {showVoice && showText && (
        <div className="my-6 flex items-center gap-4" aria-hidden="true">
          <div className="flex-1 h-0.5" style={{ backgroundColor: "var(--vb-border)" }} />
          <span className="vb-subtext font-bold">OR</span>
          <div className="flex-1 h-0.5" style={{ backgroundColor: "var(--vb-border)" }} />
        </div>
      )}

      {showText && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="vb-label" htmlFor="command-input">
            What would you like to do?
          </label>
          <input
            id="command-input"
            data-testid="command-input"
            type="text"
            className="vb-input"
            placeholder="Type your request here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="vb-btn vb-btn-primary" data-testid="command-submit-btn">
            <Send size={26} strokeWidth={2.5} />
            Submit
          </button>
        </form>
      )}

      {processing && (
        <div className="flex items-center gap-3 mt-6 vb-subtext" data-testid="command-processing">
          <Loader2 className="animate-spin" size={26} />
          Understanding your request...
        </div>
      )}

      {recognizedText && (
        <div
          className="mt-6 rounded-2xl p-4 border-2 flex items-start gap-3"
          style={{ borderColor: "var(--vb-border)", backgroundColor: "var(--vb-bg)" }}
          data-testid="recognized-text"
        >
          <MessageSquareText size={26} strokeWidth={2.5} style={{ color: "var(--vb-blue)" }} />
          <p className="vb-subtext" style={{ color: "var(--vb-text)" }}>
            <span className="font-bold">You said:</span> {recognizedText}
          </p>
        </div>
      )}

      {lastResponse && (
        <div
          className="mt-4 rounded-2xl p-4 border-2 flex items-start justify-between gap-3"
          style={{ borderColor: "var(--vb-blue)", backgroundColor: "var(--vb-surface-2)" }}
          data-testid="last-response"
        >
          <p className="vb-subtext font-bold" style={{ color: "var(--vb-blue-dark)" }}>
            {lastResponse}
          </p>
          <button
            data-testid="replay-response-btn"
            onClick={replay}
            aria-label="Replay this response aloud"
            title="Replay aloud"
            className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full text-white"
            style={{ backgroundColor: "var(--vb-blue)" }}
          >
            <Volume2 size={24} strokeWidth={2.5} className={speaking ? "animate-pulse" : ""} />
          </button>
        </div>
      )}
    </section>
  );
};
