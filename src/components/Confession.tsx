"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { Hibiscus } from "./Hibiscus";
import { TeddyBear } from "./TeddyBear";
import { CardModal } from "./Cards/CardModal";
import { GumamelaCard } from "./Cards/gumamela";
import { Envelope, LetterCard } from "./Cards/letter";
import { TeddyBearCard } from "./Cards/tiddyBear";
import { PhotoGallery, type Photo } from "./Cards/PhotoGallery";
import { ChevronDownIcon, MoreIcon, NoIcon, SlowIcon, ThinkIcon } from "./Icons";
import { loadReplies, RepliesList, saveReplies, type SentReply } from "./Replies";

// ✏️ Personalize these
const CRUSH_NAME = "Shy";
const FROM_NAME = "Your secret admirer";
// The song file inside /public
// Songs inside /public/music, played in this order and then repeated
const PLAYLIST = [
  "/music/TJ Monterde - Ikaw at Ako (Lyrics).mp3",
  "/music/Pangarap Lang Kita - Parokya Ni Edgar (Lyrics) 24Vibes.mp3",
].map(encodeURI);
// How long the loading screen stays up (first visit only)
const LOADING_MS = 3000;
// Photos inside /public shown when a card is opened. Add more file names to show more.
// Each photo's compliment shows under it when she taps to enlarge it. ✏️ Edit freely.
const BEAR_PHOTOS: Photo[] = [
  { src: "/bebear1.jpeg", caption: "Your smile could brighten even my worst days 💗" },
  { src: "/bebear2.jpeg", caption: "Simple, sweet, and effortlessly beautiful 🧸" },
];
const GUMAMELA_PHOTOS: Photo[] = [
  { src: "/gumamela1.jpeg", caption: "Like a gumamela, you stand out wherever you are 🌺" },
  { src: "/gumamela2.jpeg", caption: "Beautiful, kind, and so much fun to be with 🌸" },
];
 
// Seconds between each letter paragraph appearing (higher = slower)
const LETTER_STEP_S = 3;
const LETTER = [
  "Alam ko random tong message ko, gets ko if weird or creepy ang dating sayo pero hopefully maappreciate mo tong website para sayo.",
  "Sorry if out of nowhere talaga to, isa sa regret ko is dumidistansya ako sayo last encounter like mga gawain o pagkakatipon, focus kase sa tungkulin e, alam mo na hehe",
  ""
];
// The big ending of the letter: greeting, a "Read more…" button, then the confession
const LETTER_FINALE = {
  greeting: "Shy, didiretso na ako…",
  confession: "may gusto kase ako sayo.",
  revealS: 2, // how slowly the confession fades in
  // Paragraphs shown after the confession, one by one (one item = one paragraph)
  after: [
    "Kung okay lang sayo, magpapakilala pa ako ng lalo sa personal. Iniisip ko kase wala na ako time makipag-close sayo, wala naman ako sa mabuhay, di na rin ako masyado active sa tk, tsaka nasa QC ka na kase madalas.",
    "If hindi, okay lang naman. Kaysa naman maging regret ko to if di ko sinubukan. Ito lang naman goal ko, ang makapag-confess... at syempre, malaman if may chances.",
  ],
};
// When the greeting and "Read more…" appear (seconds after the letter opens)
const FINALE_AT = 1 + LETTER.length * LETTER_STEP_S;
// After she taps "Read more…" (seconds after the tap)
const AFTER_AT = 0.3 + LETTER_FINALE.revealS;
const SIGNATURE_AT = AFTER_AT + LETTER_FINALE.after.length * LETTER_STEP_S;

const NO_LINES = [
  "No",
  "Sure ka na?",
  "Think again 🥺",
  "Last chance…",
  "Weh? Di nga?",
  "Mali ata pindot mo",
  "Please? 🌺",
];

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + 7) % 100,
  delay: (i * 1.7) % 12,
  duration: 9 + ((i * 3) % 8),
  size: 10 + ((i * 5) % 14),
  drift: (i % 2 ? 1 : -1) * (30 + ((i * 13) % 60)),
}));

const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return {
    x: Math.round(Math.cos(angle) * 42),
    y: Math.round(Math.sin(angle) * 38),
    variant: (["red", "pink", "coral"] as const)[i % 3],
    size: 48 + ((i * 17) % 40),
    delay: i * 0.08,
  };
});

const NARROW_QUERY = "(max-width: 639px)";
const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;
const subscribeNarrow = (onChange: () => void) => {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// Remembers (in this browser) that she has visited before
const VISITED_KEY = "shy-visited";
const subscribeNoop = () => () => {};
const readVisit = (): "first" | "returning" => {
  try {
    return window.localStorage.getItem(VISITED_KEY) ? "returning" : "first";
  } catch {
    return "first";
  }
};
const markVisited = () => {
  try {
    window.localStorage.setItem(VISITED_KEY, "1");
  } catch {
    // Storage blocked: she'll just see the loading screen again next time
  }
};

type Stage = "envelope" | "letter" | "ask" | "yes" | "think" | "no" | "slow";

// The other answers, tucked in a dropdown under "Oo, pwede" / "No"
const OTHER_ANSWERS = [
  { kind: "think", label: "Pag-iisipan ko muna", Icon: ThinkIcon },
  { kind: "slow", label: "Masyadong mabilis", Icon: SlowIcon },
  { kind: "no", label: "Hindi talaga", Icon: NoIcon },
] as const;
type CardId = "bear" | "letter" | "gumamela";

const CARD_TITLES: Record<CardId, string> = {
  bear: "Teddy Bear",
  letter: "Letter",
  gumamela: "Gumamela",
};

export function Confession() {
  const [stage, setStage] = useState<Stage>("envelope");
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [showOthers, setShowOthers] = useState(false);
  // Becomes true when she taps "Read more…" in the letter
  const [letterOpened, setLetterOpened] = useState(false);
  // Tapping the letter skips its slow reveal. The parts before and after
  // "Read more…" are tracked separately so the confession still animates in.
  const [skipBefore, setSkipBefore] = useState(false);
  const [skipAfter, setSkipAfter] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [replies, setReplies] = useState<SentReply[]>(loadReplies);
  const [showReplies, setShowReplies] = useState(false);

  // Quietly emails you the moment she picks an answer ("Oo, pwede" or
  // "Pag-iisipan ko muna"). Nothing is shown or saved on her side, each
  // answer is sent once per visit, and a failure is ignored.
  const answersSentRef = useRef(new Set<string>());
  // Time of the last "No" dodge; taps right after it are leftovers, not answers
  const lastDodgeRef = useRef(0);
  // Returns false when the tap should be ignored
  const notifyAnswer = (kind: "yes" | "think" | "no" | "slow") => {
    if (Date.now() - lastDodgeRef.current < 600) return false;
    if (answersSentRef.current.has(kind)) return true;
    answersSentRef.current.add(kind);
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
      keepalive: true,
    }).catch(() => {});
    return true;
  };

  const sendAnswer = async () => {
    const message = reply.trim();
    if (!message) return;
    setSendStatus("sending");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "message", message }),
      });
      if (res.ok) {
        const updated = [...replies, { message, sentAt: new Date().toISOString() }];
        setReplies(updated);
        saveReplies(updated);
      }
      setSendStatus(res.ok ? "sent" : "error");
    } catch {
      setSendStatus("error");
    }
  };
  const [playing, setPlaying] = useState(false);
  const [openCard, setOpenCard] = useState<CardId | null>(null);
  const [loading, setLoading] = useState(true);
  // "first" on this device's first visit, "returning" after, "unknown" on the server
  const visit = useSyncExternalStore(subscribeNoop, readVisit, () => "unknown" as const);

  // First visit: show the shy loading screen. Returning: skip it.
  useEffect(() => {
    if (visit === "unknown") return;
    const timer = setTimeout(
      () => {
        markVisited();
        setLoading(false);
      },
      visit === "first" ? LOADING_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [visit]);

  // True once she pauses with the music button: nothing else may restart it
  const userPausedRef = useRef(false);
  const loadingRef = useRef(true);

  // Browsers only allow sound after a tap. Taps are caught from the very start,
  // including during the loading screen, so the music can begin right when
  // loading ends. Phones grant permission at the END of a tap (touchend/click).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const GESTURES = ["touchend", "click", "keydown", "mousedown"] as const;

    const stopListening = () => {
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    };
    function onGesture(e: Event) {
      // The music button handles its own taps
      if ((e.target as Element | null)?.closest?.("[data-music-toggle]")) return;
      if (userPausedRef.current || !audio) return stopListening();

      if (loadingRef.current) {
        // Still loading: "unlock" the audio silently so it may play later
        audio.muted = true;
        audio
          .play()
          .then(() => {
            if (loadingRef.current) {
              audio.pause();
              audio.currentTime = 0;
            }
            audio.muted = false;
          })
          .catch(() => {});
        return;
      }
      if (!audio.paused) return stopListening();
      audio.muted = false;
      audio.play().then(stopListening).catch(() => {});
    }

    GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    return stopListening;
  }, []);

  // Start the music the moment loading ends (works right away on browsers
  // that allow it, or if she tapped during loading)
  useEffect(() => {
    loadingRef.current = loading;
    if (loading) return;
    const audio = audioRef.current;
    if (!audio || userPausedRef.current) return;
    audio.muted = false;
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, [loading]);

  // Used by the cards, in case the music has not started yet.
  // Respects a pause she made with the music button.
  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused || userPausedRef.current) return;
    audio.muted = false;
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      userPausedRef.current = false;
      audio.muted = false;
      audio.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      audio.pause();
    }
  };

  // Keep the "No" button inside the button area, whatever the screen width
  const dodge = () => {
    const area = buttonAreaRef.current;
    const maxX = area ? Math.max(area.clientWidth / 2 - 70, 30) : 120;
    const maxY = area ? Math.max(area.clientHeight / 2 - 24, 20) : 80;
    lastDodgeRef.current = Date.now();
    setNoCount((n) => n + 1);
    setNoPos({
      x: Math.round((Math.random() * 2 - 1) * maxX),
      y: Math.round((Math.random() * 2 - 1) * maxY),
    });
  };

  const showCard = (id: CardId) => {
    startMusic();
    setOpenCard(id);
  };

  // Message box + list of sent messages, shared by the "yes" and "think" screens
  const renderMessageForm = (delay: string, placeholder = "Write me a message…") => (
    <>
      {sendStatus === "sent" ? (
        <div className="flex flex-col items-center gap-3">
          <p className="fade-up font-script text-2xl text-hibiscus">Sent! I got your message 💌</p>
          <button
            onClick={() => {
              setReply("");
              setSendStatus("idle");
            }}
            className="fade-up rounded-full border-2 border-hibiscus px-6 py-2 font-semibold text-hibiscus transition-colors hover:bg-hibiscus hover:text-white"
            style={{ animationDelay: "0.3s" }}
          >
            Send another message ✍️
          </button>
        </div>
      ) : (
        <div className="fade-up flex w-full flex-col items-center gap-3" style={{ animationDelay: delay }}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={placeholder}
            className="w-full resize-none rounded-2xl border border-petal/30 bg-white/80 px-4 py-3 text-base text-ink placeholder:text-muted/60 focus:border-hibiscus focus:outline-none"
          />
          <button
            onClick={sendAnswer}
            disabled={sendStatus === "sending" || !reply.trim()}
            className="heartbeat rounded-full bg-hibiscus px-8 py-3 font-semibold text-white shadow-lg shadow-hibiscus/30 transition-colors hover:bg-deep disabled:animate-none disabled:opacity-70"
          >
            {sendStatus === "sending" ? "Sending…" : "Send message 💌"}
          </button>
          {sendStatus === "error" && (
            <p className="text-sm text-muted">
              Hindi na-send 🥺 Try again, or screenshot this and send it to me.
            </p>
          )}
        </div>
      )}
      {replies.length > 0 && (
        <div className="mt-2 flex w-full flex-col items-center gap-3">
          <h3 className="font-script text-2xl text-hibiscus">Mga na-send mo sa akin 📬</h3>
          <RepliesList replies={replies} />
        </div>
      )}
    </>
  );

  // The "Yes" button grows less on narrow phones so it never spills off screen
  // When a letter line starts appearing below the visible part of the box,
  // smoothly scroll the box down so she can read it
  const followNewLine = (e: React.AnimationEvent<HTMLDivElement>) => {
    const line = e.target as HTMLElement;
    if (!line.classList.contains("letter-reveal")) return;
    const box = e.currentTarget;
    const overflow = line.getBoundingClientRect().bottom - box.getBoundingClientRect().bottom;
    if (overflow > 0) box.scrollBy({ top: overflow + 16, behavior: "smooth" });
  };

  // When a song ends, start the next one in PLAYLIST (back to the first after the last)
  const trackRef = useRef(0);
  const playNextSong = () => {
    const audio = audioRef.current;
    if (!audio) return;
    trackRef.current = (trackRef.current + 1) % PLAYLIST.length;
    audio.src = PLAYLIST[trackRef.current];
    audio.play().catch(() => {});
  };

  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const yesScale = Math.min(1 + noCount * 0.15, narrow ? 1.4 : 1.9);

  return (
    <main className="relative flex flex-1 items-center justify-center px-3 pb-6 pt-16 sm:px-4 sm:py-10">
      <audio
        ref={audioRef}
        src={PLAYLIST[0]}
        preload="auto"
        onEnded={playNextSong}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-cream px-6 text-center"
        >
          {/* Only the first visit shows the message; returning visits see a blank flash at most */}
          {visit === "first" && (
            <>
              <div className="sway">
                <TeddyBear size={150} />
              </div>
              <p className="font-script text-2xl text-hibiscus sm:text-3xl">Hi Shy…</p>
              <p className="fade-up -mt-3 text-sm text-muted sm:text-base" style={{ animationDelay: "0.6s" }}>
                Wait lang, nahihiya pa ako 🙈
              </p>
              <div className="h-2 w-56 overflow-hidden rounded-full bg-blush">
                <div
                  className="load-bar h-full rounded-full bg-hibiscus"
                  style={{ animationDuration: `${LOADING_MS}ms` }}
                />
              </div>
            </>
          )}
        </div>
      )}
      {!loading && (
        <button
          data-music-toggle
          onClick={toggleMusic}
          aria-label={playing ? "Pause music" : "Play music"}
          // Kept clear of the notch / status bar on newer phones
          className="fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-petal/30 bg-white/80 text-xl shadow-md backdrop-blur transition-colors hover:bg-blush"
        >
          <span className={playing ? "spin-slow inline-block" : "inline-block opacity-50"}>
            {playing ? "🎵" : "🔇"}
          </span>
        </button>
      )}      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal-fall"
          style={
            {
              left: `${p.left}vw`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}

      {!loading && (
      <div
        className={`relative z-10 w-full rounded-3xl border border-petal/20 bg-white/70 px-4 py-6 text-center shadow-[0_20px_60px_-20px_rgba(179,18,46,0.35)] backdrop-blur-md sm:rounded-4xl sm:px-12 sm:py-10 ${
          stage === "envelope" ? "max-w-3xl" : "max-w-xl"
        }`}
      >
        {stage === "envelope" && (
          <div key="envelope" className="flex flex-col items-center gap-5">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <TeddyBearCard onClick={() => showCard("bear")} />
              <LetterCard onClick={() => showCard("letter")} delay={0.15} />
              <GumamelaCard onClick={() => showCard("gumamela")} delay={0.3} />
            </div>
            <h1
              className="fade-up font-serif text-3xl leading-tight text-ink sm:mt-2 sm:text-4xl"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="italic text-hibiscus">Hi, Shy</span>
            </h1>
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(true)}
                className="fade-up rounded-full border border-petal/30 bg-white/80 px-5 py-2 text-sm font-semibold text-hibiscus shadow-sm transition-colors hover:bg-blush"
                style={{ animationDelay: "0.5s" }}
              >
                📬 My replies ({replies.length})
              </button>
            )}
          </div>
        )}

        {stage === "letter" && (
          <div
            key="letter"
            // Tapping the letter (anywhere but a button) shows the waiting lines at once
            onClick={(e) => {
              if ((e.target as Element).closest("button")) return;
              setSkipBefore(true);
              if (letterOpened) setSkipAfter(true);
            }}
            className={`flex flex-col items-center gap-5 text-left ${skipBefore ? "skip-before" : ""} ${
              skipAfter ? "skip-after" : ""
            }`}
          >
            <Hibiscus size={72} variant="pink" className="spin-slow self-center" />
            {/* Fixed-height box that scrolls; each new line scrolls into view as it appears */}
            <div
              onAnimationStart={followNewLine}
              className="letter-scroll flex max-h-[50dvh] w-full flex-col gap-5 overflow-y-auto overscroll-contain pr-2 sm:max-h-[45dvh]"
            >
            <p className="letter-reveal self-start font-script text-2xl text-hibiscus sm:text-3xl">
              Dear {CRUSH_NAME},
            </p>
            {/* Each paragraph drifts up softly out of a blur, one after another */}
            {LETTER.map((line, i) => (
              <p
                key={i}
                className="letter-reveal text-base leading-relaxed text-ink sm:text-lg"
                style={{ animationDelay: `${1 + i * LETTER_STEP_S}s` }}
              >
                {line}
              </p>
            ))}
            {/* The finale: greeting, then "Read more…" until she taps it */}
            <div className="flex w-full flex-col gap-2 text-base leading-relaxed text-ink sm:text-lg">
              <p className="letter-reveal" style={{ animationDelay: `${FINALE_AT}s` }}>
                {LETTER_FINALE.greeting}
              </p>
              {letterOpened ? (
                <p
                  className="letter-reveal letter-after"
                  style={{
                    animationDelay: "0.3s",
                    animationDuration: `${LETTER_FINALE.revealS}s`,
                  }}
                >
                  {LETTER_FINALE.confession}
                </p>
              ) : (
                <button
                  onClick={() => setLetterOpened(true)}
                  className="letter-reveal self-start text-sm font-semibold text-hibiscus underline decoration-petal/50 underline-offset-4 transition-colors hover:text-deep sm:text-base"
                  style={{ animationDelay: `${FINALE_AT + 1}s` }}
                >
                  Read more…
                </button>
              )}
            </div>
            {letterOpened && (
              <>
                {LETTER_FINALE.after.map((line, i) => (
                  <p
                    key={i}
                    className="letter-reveal letter-after w-full text-base leading-relaxed text-ink sm:text-lg"
                    style={{ animationDelay: `${AFTER_AT + i * LETTER_STEP_S}s` }}
                  >
                    {line}
                  </p>
                ))}
                <p
                  className="letter-reveal letter-after self-end font-script text-2xl text-hibiscus"
                  style={{ animationDelay: `${SIGNATURE_AT}s` }}
                >
                  — {FROM_NAME}
                </p>
              </>
            )}
            </div>
            {letterOpened && (
              <button
                onClick={() => setStage("ask")}
                className="letter-reveal letter-after mt-2 self-center rounded-full border-2 border-hibiscus px-7 py-2.5 font-semibold text-hibiscus transition-colors hover:bg-hibiscus hover:text-white"
                style={{ animationDelay: `${SIGNATURE_AT + 1}s` }}
              >
                May itatanong ako…
              </button>
            )}
          </div>
        )}

        {stage === "ask" && (
          <div key="ask" className="flex flex-col items-center gap-4">
            <div className="sway max-sm:[zoom:0.8]">
              <Hibiscus size={130} variant="coral" />
            </div>
            <h2 className="fade-up font-serif text-2xl leading-tight text-ink sm:text-4xl">
              Pwede ba kitang ligawan?
            </h2>
            <p className="fade-up text-muted" style={{ animationDelay: "0.2s" }}>
              (Can I court you?)
            </p>
            <div
              ref={buttonAreaRef}
              className="relative mt-4 flex h-48 w-full flex-col items-center justify-center gap-5 sm:mt-6 sm:h-40 sm:flex-row sm:gap-6"
            >
              <button
                onClick={() => {
                  if (!notifyAnswer("yes")) return;
                  setStage("yes");
                }}
                className="relative z-10 rounded-full bg-hibiscus px-8 py-3 font-semibold text-white shadow-lg shadow-hibiscus/30 transition-all hover:bg-deep"
                style={{ transform: `scale(${yesScale})` }}
              >
                Oo, pwede 🌺
              </button>
              <button
                // Dodge on hover only for a real mouse. On phones a tap also fires
                // "mouseenter", which moved the button away mid-tap so the tap
                // landed on the answer buttons underneath.
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") dodge();
                }}
                onClick={dodge}
                className="whitespace-nowrap rounded-full border border-muted/40 bg-white px-6 py-2.5 text-muted transition-transform duration-300"
                style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
              >
                {NO_LINES[Math.min(noCount, NO_LINES.length - 1)]}
              </button>
            </div>
            <div
              className="fade-up relative z-10 flex w-full max-w-xs flex-col items-center"
              style={{ animationDelay: "0.4s" }}
            >
              <button
                onClick={() => setShowOthers((v) => !v)}
                aria-expanded={showOthers}
                aria-controls="other-answers"
                className="flex items-center gap-2 rounded-full border border-petal/25 bg-white/70 px-4 py-2 text-sm text-muted transition-colors hover:border-petal/50 hover:text-hibiscus"
              >
                <MoreIcon className="text-base" />
                Iba pang sagot
                <ChevronDownIcon
                  className={`text-base transition-transform duration-300 ${showOthers ? "rotate-180" : ""}`}
                />
              </button>

              {showOthers && (
                <ul
                  id="other-answers"
                  className="bloom-soft mt-3 w-full overflow-hidden rounded-2xl border border-petal/20 bg-white/90 text-left shadow-lg shadow-hibiscus/10"
                >
                  {OTHER_ANSWERS.map(({ kind, label, Icon }) => (
                    <li key={kind} className="border-b border-blush last:border-b-0">
                      <button
                        onClick={() => {
                          if (!notifyAnswer(kind)) return;
                          setShowOthers(false);
                          setStage(kind);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-ink transition-colors hover:bg-blush/60 hover:text-hibiscus sm:text-base"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-lg text-hibiscus">
                          <Icon />
                        </span>
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {stage === "slow" && (
          <div key="slow" className="flex flex-col items-center gap-5">
            <div className="sway max-sm:[zoom:0.8]">
              <Hibiscus size={110} variant="coral" />
            </div>
            <h2 className="fade-up font-serif text-3xl text-hibiscus sm:text-4xl">
              Okay lang
            </h2>
            <p
              className="fade-up text-base leading-relaxed text-ink sm:text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              Let me know once nakapag-decide ka na, andito lang ako, nakaabang hehe
            </p>
            <p
              className="fade-up font-script text-xl text-hibiscus sm:text-2xl"
              style={{ animationDelay: "0.6s" }}
            >
              May gusto ka bang sabihin?
            </p>
            {renderMessageForm("0.9s", "Write it here, mababasa ko 'to…")}
            <button
              onClick={() => setStage("envelope")}
              className="fade-up text-sm text-muted underline underline-offset-4 hover:text-hibiscus"
              style={{ animationDelay: "1.2s" }}
            >
              Back
            </button>
          </div>
        )}

        {stage === "no" && (
          <div key="no" className="flex flex-col items-center gap-5">
            <div className="max-sm:[zoom:0.8]">
              <Hibiscus size={110} variant="pink" />
            </div>
            <h2 className="fade-up font-serif text-3xl text-hibiscus sm:text-4xl">Okay lang..</h2>
            <p
              className="fade-up text-base leading-relaxed text-ink sm:text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              Salamat sa pagiging honest, I hope di mo ako iiwasan if magkasalubong tayo. Ingat ka
              palage.
            </p>
            <p
              className="fade-up font-script text-xl text-hibiscus sm:text-2xl"
              style={{ animationDelay: "0.6s" }}
            >
              May gusto ka pa bang sabihin?
            </p>
            {renderMessageForm("0.9s", "Write it here, mababasa ko 'to…")}
            <button
              onClick={() => setStage("envelope")}
              className="fade-up text-sm text-muted underline underline-offset-4 hover:text-hibiscus"
              style={{ animationDelay: "1.2s" }}
            >
              Back
            </button>
          </div>
        )}

        {stage === "think" && (
          <div key="think" className="flex flex-col items-center gap-5">
            <div className="sway max-sm:[zoom:0.8]">
              <TeddyBear size={150} />
            </div>
            <h2 className="fade-up font-serif text-3xl text-hibiscus sm:text-4xl">Sige, take your time</h2>
            <p
              className="fade-up text-base leading-relaxed text-ink sm:text-lg"
              style={{ animationDelay: "0.3s" }}
            >
              Walang pressure. Salamat sa pag-consider 🙂
            </p>
            {renderMessageForm("0.9s", "May gusto ka bang sabihin? Write it here…")}
            <div
              className="fade-up flex flex-col items-center gap-3"
              style={{ animationDelay: "1.2s" }}
            >
              <button
                onClick={() => {
                  notifyAnswer("yes");
                  setStage("yes");
                }}
                className="rounded-full bg-hibiscus px-7 py-2.5 font-semibold text-white shadow-lg shadow-hibiscus/30 transition-colors hover:bg-deep"
              >
                Actually… Oo, pwede 🌺
              </button>
              <button
                onClick={() => setStage("envelope")}
                className="text-sm text-muted underline underline-offset-4 hover:text-hibiscus"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {stage === "yes" && (
          <div key="yes" className="flex flex-col items-center gap-5">
            <div className="relative h-56 w-full max-sm:[zoom:0.8]">
              {BURST.map((f, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${f.x}%)`,
                    top: `calc(50% + ${f.y}%)`,
                    translate: "-50% -50%",
                  }}
                >
                  <Hibiscus
                    size={f.size}
                    variant={f.variant}
                    className="bloom"
                    style={{ animationDelay: `${f.delay}s` }}
                  />
                </div>
              ))}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="heartbeat">
                  <TeddyBear size={130} className="bloom" />
                </div>
              </div>
            </div>
            <h2 className="fade-up font-serif text-3xl text-hibiscus sm:text-4xl" style={{ animationDelay: "0.9s" }}>
              Hala! Unexpected...
            </h2>
            <p className="fade-up text-base leading-relaxed text-ink sm:text-lg" style={{ animationDelay: "1.2s" }}>
              Nag-eexpect na ako ng worse, promise I will do my best 🫡
            </p>
            {renderMessageForm("1.6s")}
            <button
              onClick={() => {
                setNoCount(0);
                setNoPos({ x: 0, y: 0 });
                setStage("envelope");
              }}
              className="fade-up text-sm text-muted underline underline-offset-4 hover:text-hibiscus"
              style={{ animationDelay: "2s" }}
            >
              Back
            </button>
          </div>
        )}
      </div>
      )}

      {showReplies && (
        <CardModal title="My replies" onClose={() => setShowReplies(false)}>
          <RepliesList replies={replies} />
        </CardModal>
      )}

      {openCard && (
        <CardModal
          title={CARD_TITLES[openCard]}
          onClose={() => setOpenCard(null)}
          wide={openCard === "bear" || openCard === "gumamela"}
          showBack={false}
        >
          {/* Placeholder: only the picture for now, real content comes later */}
          {openCard === "bear" && <PhotoGallery photos={BEAR_PHOTOS} alt="Teddy bear" />}
          {openCard === "letter" && (
            <>
              <div className="max-sm:[zoom:0.8]">
                <Envelope size={220} />
              </div>
              <button
                onClick={() => {
                  startMusic();
                  setOpenCard(null);
                  setLetterOpened(false);
                  setSkipBefore(false);
                  setSkipAfter(false);
                  setStage("letter");
                }}
                className="heartbeat mt-3 rounded-full bg-hibiscus px-8 py-3 font-semibold text-white shadow-lg shadow-hibiscus/30 transition-colors hover:bg-deep"
              >
                Open it 💌
              </button>
            </>
          )}
          {openCard === "gumamela" && <PhotoGallery photos={GUMAMELA_PHOTOS} alt="Gumamela" />}
        </CardModal>
      )}
    </main>
  );
}
