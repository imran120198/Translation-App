import axios from "axios";
import { useEffect, useRef, useState } from "react";
import copy from "copy-to-clipboard";
import { AiFillCopy } from "react-icons/ai";
import {
  MdClear,
  MdVolumeUp,
  MdVolumeOff,
  MdSwapHoriz,
  MdCheck,
  MdAutoAwesome,
} from "react-icons/md";
import { toast } from "react-toastify";
import { SelectBox } from "./SelectBox";

// Mapping ISO language codes to speech synthesis BCP-47 language tags
const LANGUAGE_VOICE_MAP = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  tr: "tr-TR",
  ar: "ar-SA",
  ur: "ur-PK",
  ko: "ko-KR",
  ru: "ru-RU",
  zh: "zh-CN",
  cs: "cs-CZ",
};

// Popular quick select options
const POPULAR_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "ur", name: "Urdu" },
  { code: "ar", name: "Arabic" },
];

export const Translator = () => {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("hi");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingType, setSpeakingType] = useState(null); // 'source' | 'target' | null
  const [copiedType, setCopiedType] = useState(null); // 'source' | 'target' | null
  const audioRef = useRef(null);
  const playQueueRef = useRef([]);

  // Calculate word count
  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Stop any active audio playback
  const stopPlayback = () => {
    playQueueRef.current = [];
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingType(null);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const handleSelectChange = ({ target: { value, id } }) => {
    if (id === "source") setSource(value);
    if (id === "target") setTarget(value);
  };

  // Swap Languages and Text
  const handleSwapLanguages = () => {
    if (!source && !target) {
      toast.info("Please select languages to swap");
      return;
    }
    stopPlayback();
    const tempSource = source;
    const tempTarget = target;
    const tempQ = q;
    const tempOutput = output;

    setSource(tempTarget);
    setTarget(tempSource);
    setQ(tempOutput);
    setOutput(tempQ);
    toast.success("Languages swapped!", { autoClose: 1500 });
  };

  const handleGetRequest = async () => {
    if (!q || q.trim().length < 1) {
      setOutput("");
      setIsLoading(false);
      return false;
    }
    if (!source || !target) {
      setIsLoading(false);
      return false;
    }

    const apiKey = process.env.REACT_APP_RAPIDAPI_KEY;
    const apiHost =
      process.env.REACT_APP_RAPIDAPI_HOST || "google-translator9.p.rapidapi.com";
    const apiUrl =
      process.env.REACT_APP_RAPIDAPI_URL ||
      "https://google-translator9.p.rapidapi.com/v2";

    if (!apiKey) {
      toast.error(
        "RapidAPI Key is missing. Please set REACT_APP_RAPIDAPI_KEY in your .env file.",
        { toastId: "missing-api-key" }
      );
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);

    const options = {
      method: "POST",
      url: apiUrl,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost,
        "Content-Type": "application/json",
      },
      data: {
        q,
        source,
        target,
        format: "text",
      },
    };

    try {
      const response = await axios.request(options);
      const translatedText =
        response.data?.data?.translations?.[0]?.translatedText;
      console.log("translatedText:", translatedText);
      setOutput(translatedText || "");
    } catch (err) {
      console.error(err);
      toast.error(
        "Translation request failed. Please check your API key or network connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API fallback
  const speakWithSpeechSynthesis = (text, langCode, type) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      setSpeakingType(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = LANGUAGE_VOICE_MAP[langCode] || langCode || "en-US";
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLang.toLowerCase() ||
          v.lang.toLowerCase().replace("_", "-") === targetLang.toLowerCase() ||
          v.lang.toLowerCase().startsWith(targetLang.toLowerCase().slice(0, 2))
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setSpeakingType(type);
    };

    utterance.onend = () => {
      setSpeakingType(null);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.error("Speech error:", e);
        toast.error("Unable to play audio for this language.");
      }
      setSpeakingType(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Split long texts into natural sentence/phrase chunks (~150 chars each) for streaming audio
  const splitIntoChunks = (text, maxLen = 150) => {
    const sentences =
      text.match(/[^.!?\n،۔]+[.!?\n،۔]+|[^.!?\n،۔]+/g) || [text];
    const chunks = [];
    let current = "";

    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if ((current + " " + s).trim().length <= maxLen) {
        current = (current + " " + s).trim();
      } else {
        if (current) chunks.push(current);
        if (s.length > maxLen) {
          const words = s.split(/\s+/);
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).trim().length <= maxLen) {
              sub = (sub + " " + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        } else {
          current = s;
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.length ? chunks : [text];
  };

  // Play next chunk in queue for seamless long text audio
  const playNextChunk = (targetLang, type) => {
    if (playQueueRef.current.length === 0) {
      setSpeakingType(null);
      audioRef.current = null;
      return;
    }

    const chunk = playQueueRef.current.shift();
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${targetLang}&client=tw-ob`;

      const audio = new Audio();
      audio.referrerPolicy = "no-referrer";
      audio.src = ttsUrl;
      audioRef.current = audio;

      audio.onended = () => {
        playNextChunk(targetLang, type);
      };

      audio.onerror = () => {
        speakWithSpeechSynthesis(chunk, targetLang, type);
      };

      audio.play().catch((err) => {
        console.warn("Audio stream playback failed, falling back to Web Speech API:", err);
        speakWithSpeechSynthesis(chunk, targetLang, type);
      });
    } catch (err) {
      speakWithSpeechSynthesis(chunk, targetLang, type);
    }
  };

  // High-reliability Text-to-Speech supporting unlimited text, Arabic, Urdu, Marathi, etc.
  const handleSpeak = (text, langCode, type) => {
    if (!text || text.trim() === "") {
      toast.warning("Nothing to read aloud!");
      return;
    }

    // Toggle off if currently speaking this block
    if (speakingType === type) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const cleanText = text.trim();
    const targetLang = langCode || "en";

    const chunks = splitIntoChunks(cleanText);
    playQueueRef.current = chunks;
    setSpeakingType(type);
    playNextChunk(targetLang, type);
  };

  // Copy to clipboard with notification toaster & icon feedback
  const copyToClipboard = (text, type) => {
    if (!text || text.trim() === "") {
      toast.warning("Nothing to copy!");
      return;
    }
    copy(text);
    setCopiedType(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  // Reset text with notification toaster
  const resetText = () => {
    stopPlayback();

    if (q === "" && output === "") {
      toast.info("Textbox is already empty!");
    } else {
      setQ("");
      setOutput("");
      toast.info("Text cleared!");
    }
  };

  // Debounce Function for automatic translation
  useEffect(() => {
    let timerID = setTimeout(() => {
      handleGetRequest();
    }, 800);

    return () => {
      clearTimeout(timerID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, source, target]);

  return (
    <main className="translatorWrapper">
      <div className="translatorContainer">
        {/* Source Box Card */}
        <section className="translationCard">
          <div className="cardHeader">
            <div className="langSelectRow">
              <SelectBox id={"source"} select={handleSelectChange} value={source} />
            </div>
            <div className="quickLangTabs">
              {POPULAR_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`pillBtn ${source === lang.code ? "active" : ""}`}
                  onClick={() => setSource(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="textAreaContainer">
            <textarea
              onChange={(e) => setQ(e.target.value)}
              value={q}
              className="modernTextArea"
              placeholder="Type or paste any text to translate..."
              rows={8}
            ></textarea>
            {q && (
              <button
                type="button"
                className="clearTextBtn"
                onClick={resetText}
                title="Clear text"
              >
                <MdClear />
              </button>
            )}
          </div>

          <div className="cardFooter">
            <div className="counterBadge">
              <span>{getWordCount(q)} words</span>
              <span className="dotSeparator">•</span>
              <span>{q.length} chars</span>
            </div>

            <div className="actionButtons">
              <button
                type="button"
                className={`actionBtn ${speakingType === "source" ? "speaking" : ""}`}
                title={
                  speakingType === "source"
                    ? "Stop reading aloud"
                    : "Listen to original text"
                }
                onClick={() => handleSpeak(q, source, "source")}
                disabled={!q.trim()}
              >
                {speakingType === "source" ? (
                  <MdVolumeOff className="actionIcon" />
                ) : (
                  <MdVolumeUp className="actionIcon" />
                )}
                <span className="actionLabel">
                  {speakingType === "source" ? "Playing" : "Listen"}
                </span>
              </button>

              <button
                type="button"
                className="actionBtn"
                title="Copy input text"
                onClick={() => copyToClipboard(q, "source")}
                disabled={!q.trim()}
              >
                {copiedType === "source" ? (
                  <MdCheck className="actionIcon textSuccess" />
                ) : (
                  <AiFillCopy className="actionIcon" />
                )}
                <span className="actionLabel">
                  {copiedType === "source" ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Floating Swap Languages Button */}
        <div className="swapButtonWrapper">
          <button
            type="button"
            className="swapButton"
            onClick={handleSwapLanguages}
            title="Swap source and target languages"
            aria-label="Swap languages"
          >
            <MdSwapHoriz className="swapIcon" />
          </button>
        </div>

        {/* Target Box Card */}
        <section className={`translationCard targetCard ${isLoading ? "loadingState" : ""}`}>
          <div className="cardHeader">
            <div className="langSelectRow">
              <SelectBox id={"target"} select={handleSelectChange} value={target} />
            </div>
            <div className="quickLangTabs">
              {POPULAR_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`pillBtn ${target === lang.code ? "active" : ""}`}
                  onClick={() => setTarget(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="textAreaContainer outputContainer">
            {isLoading ? (
              <div className="translatingPlaceholder">
                <div className="spinnerRing"></div>
                <p>Translating with Neural Engine...</p>
              </div>
            ) : output ? (
              <div className="translatedContent">
                <p id="output" className="outputText">
                  {output}
                </p>
              </div>
            ) : (
              <div className="emptyStatePlaceholder">
                <MdAutoAwesome className="sparklePlaceholderIcon" />
                <p>Translation will appear here automatically</p>
              </div>
            )}
          </div>

          <div className="cardFooter">
            <div className="counterBadge">
              <span>{getWordCount(output)} words</span>
              <span className="dotSeparator">•</span>
              <span>{output.length} chars</span>
            </div>

            <div className="actionButtons">
              <button
                type="button"
                className={`actionBtn ${speakingType === "target" ? "speaking" : ""}`}
                title={
                  speakingType === "target"
                    ? "Stop reading aloud"
                    : "Listen to translation"
                }
                onClick={() => handleSpeak(output, target, "target")}
                disabled={!output.trim()}
              >
                {speakingType === "target" ? (
                  <MdVolumeOff className="actionIcon" />
                ) : (
                  <MdVolumeUp className="actionIcon" />
                )}
                <span className="actionLabel">
                  {speakingType === "target" ? "Playing" : "Listen"}
                </span>
              </button>

              <button
                type="button"
                className="actionBtn"
                title="Copy translated text"
                onClick={() => copyToClipboard(output, "target")}
                disabled={!output.trim()}
              >
                {copiedType === "target" ? (
                  <MdCheck className="actionIcon textSuccess" />
                ) : (
                  <AiFillCopy className="actionIcon" />
                )}
                <span className="actionLabel">
                  {copiedType === "target" ? "Copied" : "Copy"}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
