# VoiceBank — Product Requirements Document

## Original Problem Statement
Build a complete, responsive, accessible digital banking web app prototype "VoiceBank" for a hackathon on "Making Digital Banking Truly Accessible". Target users: elderly, visually impaired, users with motor difficulties, low digital literacy. Extremely simple/clean UI, light-blue + white theme, large text/buttons, voice + text command control, simulated banking (no real accounts).

## User Personas
- Elderly user who prefers speaking commands and hearing responses.
- Visually impaired user relying on TTS + high contrast + large fonts.
- Low-literacy user needing icon+text pairing and simple language.
- Motor-difficulty user needing large touch targets.

## Architecture
- Frontend: React (CRA/craco), Tailwind, custom accessible design system in index.css. State via `BankContext` (screen stack, mock banking data, a11y prefs). Screens rendered by `BankApp` router.
- Voice: browser SpeechRecognition (STT) + speechSynthesis (TTS, **female voice**) in `useSpeech` hook. Graceful text fallback when unsupported.
- Command understanding: AI-powered via backend `POST /api/parse-command` (Emergent LLM key, model gpt-5.4-mini) returning `{action, amount, recipient, bill_type}`, with a client-side regex fallback (`commandParser.js`).
- Data: fully client-side mock (`lib/mockData.js`). No DB persistence of banking data.

## User Choices
- AI-powered command understanding.
- Client-side mock data only.
- Priority: nail the exact demo flow.
- TTS voice must be female.

## Security Principle
"Voice controls the experience; authentication controls financial authorization." App password (1234) gates entry. Read-only actions need no PIN. Any money movement requires review → confirm → payment PIN (5678). Voice never authorizes a payment.

## Implemented (2026-06-12)
- Login screen (demo password 1234, masked, error handling).
- Accessibility mode selection: Voice Only / Text Only / Voice + Text.
- Command bar: mic ("Tap to Speak"/"Listening..."), text input + Submit, "You said:" transcript, spoken+displayed responses with replay speaker control.
- Dashboard: balance ₹25,430.00 + 9 icon+text action cards.
- Send Money: recipient+amount → Review → Confirm → PIN → Success/Failure. Balance decrements on success.
- Bill Payment (Electricity/Water/Internet/Mobile/Other), Mobile Recharge — both via review→PIN→result.
- Success screen (✓, amount, recipient, TXN id, datetime, Done/View Transaction) with spoken result.
- Failure screen (✕, reason, message, Try Again/Home) e.g. Insufficient Balance, Incorrect PIN.
- Beneficiaries (Rahul/Priya/Arun), Notifications, Recent Transactions, Help, Settings.
- Accessibility: font resizer (A-/A+), high-contrast mode, keyboard focus rings, large touch targets, icon+text pairing, Atkinson Hyperlegible font.
- Backend `/api/parse-command` LLM intent parsing (tested 12/12).
- Full E2E tested (login, mode, dashboard, all command flows, payment success/failure) — 100% pass.

## Backlog
- P1: Add Water/Internet/Other custom bill account-number entry fields.
- P2: Persist transactions/notifications to backend for multi-session demo.
- P2: Voice-driven confirm/PIN entry navigation cues.
- P2: Multi-language voice (Hindi) support.

## Test Credentials
App password: 1234 · Payment PIN: 5678
