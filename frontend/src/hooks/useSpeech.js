import { useCallback, useEffect, useRef, useState } from "react";

const createRecognition = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "en-IN";
  r.interimResults = false;
  r.maxAlternatives = 1;
  r.continuous = false;
  return r;
};

const FEMALE_VOICE_PREFERENCES = [
  "Google UK English Female",
  "Microsoft Zira",
  "Samantha",
  "Google US English",
  "Microsoft Heera",
  "Veena",
  "Karen",
  "Tessa",
  "Fiona",
  "Victoria",
];

export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const voiceRef = useRef(null);
  const onResultRef = useRef(null);

  const recognitionSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const synthSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Choose a female voice once voices are available.
  useEffect(() => {
    if (!synthSupported) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || !voices.length) return;
      let v = null;
      for (const pref of FEMALE_VOICE_PREFERENCES) {
        v = voices.find((x) =>
          x.name.toLowerCase().includes(pref.toLowerCase())
        );
        if (v) break;
      }
      if (!v)
        v = voices.find((x) =>
          /female|zira|samantha|karen|veena|heera|tessa|fiona|victoria|aria/i.test(
            x.name
          )
        );
      if (!v) v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith("en"));
      voiceRef.current = v || voices[0];
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [synthSupported]);

  const speak = useCallback(
    (text) => {
      if (!synthSupported || !text) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voiceRef.current) u.voice = voiceRef.current;
        u.rate = 0.95;
        u.pitch = 1.15; // slightly higher for a clear female tone
        u.volume = 1;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch (e) {
        /* ignore */
      }
    },
    [synthSupported]
  );

  const cancelSpeak = useCallback(() => {
    if (synthSupported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [synthSupported]);

  const startListening = useCallback(
    (onResult) => {
      if (!recognitionSupported) return;
      onResultRef.current = onResult;
      let r = recognitionRef.current;
      if (!r) {
        r = createRecognition();
        recognitionRef.current = r;
      }
      if (!r) return;
      setTranscript("");
      r.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setTranscript(t);
        if (onResultRef.current) onResultRef.current(t);
      };
      r.onend = () => setListening(false);
      r.onerror = () => setListening(false);
      try {
        r.start();
        setListening(true);
      } catch (e) {
        setListening(false);
      }
    },
    [recognitionSupported]
  );

  const stopListening = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try {
        r.stop();
      } catch (e) {
        /* ignore */
      }
    }
    setListening(false);
  }, []);

  return {
    listening,
    transcript,
    speaking,
    speak,
    cancelSpeak,
    startListening,
    stopListening,
    recognitionSupported,
    synthSupported,
  };
}
