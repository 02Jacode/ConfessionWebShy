"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Hibiscus } from "./Hibiscus";
import { TeddyBear } from "./TeddyBear";
import { CardModal } from "./Cards/CardModal";
import { GumamelaCard } from "./Cards/gumamela";
import { Envelope, LetterCard } from "./Cards/letter";
import { TeddyBearCard } from "./Cards/tiddyBear";
import { PhotoGallery } from "./Cards/PhotoGallery";
import { loadReplies, RepliesList, saveReplies, type SentReply } from "./Replies";

// ✏️ Personalize these
const CRUSH_NAME = "Crush";
const FROM_NAME = "Your secret admirer";
// The song file inside /public
const MUSIC_SRC = encodeURI("/music/TJ Monterde - Ikaw at Ako (Lyrics).mp3");
// How long the loading screen stays up
const LOADING_MS = 3000;
// Photos inside /public shown when a card is opened. Add more file names to show more.
const BEAR_PHOTOS = ["/bebear1.jpeg", "/bebear2.jpeg"];
const GUMAMELA_PHOTOS = ["/gumamela1.jpeg", "/gumamela2.jpeg"];

const LETTER = [
  "Alam mo ba? A gumamela blooms for just one day, and still it gives everything it has. I've been holding this in for a lot longer than that.",
  "Every time you smile, I forget what I was about to say. Every time you talk, I end up listening like it's my favorite song.",
  "So I'm done being shy. I like you. Not as a friend, not as a maybe. I really, truly like you.",
];

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

type Stage = "envelope" | "letter" | "ask" | "yes";
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAreaRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [replies, setReplies] = useState<SentReply[]>(loadReplies);
  const [showReplies, setShowReplies] = useState(false);

  // Quietly emails you the moment she taps "Oo, pwede". Nothing is shown
  // or saved on her side, and a failure is ignored.
  const yesSentRef = useRef(false);
  const notifyYes = () => {
    if (yesSentRef.current) return;
    yesSentRef.current = true;
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "yes" }),
      keepalive: true,
    }).catch(() => {});
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  // Try to play as soon as loading ends. If the browser blocks autoplay,
  // start on the very first tap or key press instead.
  useEffect(() => {
    if (loading) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;

    const stopWaiting = () => {
      window.removeEventListener("pointerdown", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
    };
    const startOnGesture = () => {
      audio.play().then(stopWaiting).catch(() => {});
    };

    audio.play().catch(() => {
      window.addEventListener("pointerdown", startOnGesture);
      window.addEventListener("keydown", startOnGesture);
    });
    return stopWaiting;
  }, [loading]);

  // Fallback used by the buttons, in case the music has not started yet
  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  // Keep the "No" button inside the button area, whatever the screen width
  const dodge = () => {
    const area = buttonAreaRef.current;
    const maxX = area ? Math.max(area.clientWidth / 2 - 70, 30) : 120;
    const maxY = area ? Math.max(area.clientHeight / 2 - 24, 20) : 80;
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

  // The "Yes" button grows less on narrow phones so it never spills off screen
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const yesScale = Math.min(1 + noCount * 0.15, narrow ? 1.4 : 1.9);

  return (
    <main className="relative flex flex-1 items-center justify-center px-3 pb-8 pt-20 sm:px-4 sm:py-10">
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {loading && (
        <div
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-cream px-6 text-center"
        >
          <div className="sway">
            <TeddyBear size={150} />
          </div>
          <p className="font-script text-2xl text-hibiscus sm:text-3xl">Picking a gumamela for you…</p>
          <div className="h-2 w-56 overflow-hidden rounded-full bg-blush">
            <div
              className="load-bar h-full rounded-full bg-hibiscus"
              style={{ animationDuration: `${LOADING_MS}ms` }}
            />
          </div>
        </div>
      )}
      {!loading && (
        <button
          onClick={toggleMusic}
          aria-label={playing ? "Pause music" : "Play music"}
          className="fixed right-3 top-3 z-20 flex h-11 w-11 sm:right-4 sm:top-4 items-center justify-center rounded-full border border-petal/30 bg-white/80 text-xl shadow-md backdrop-blur transition-colors hover:bg-blush"
        >
          <span className={playing ? "spin-slow inline-block" : "inline-block opacity-50"}>
            {playing ? "🎵" : "🔇"}
          </span>
        </button>
      )}
      {PETALS.map((p, i) => (
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
        className={`relative z-10 w-full rounded-3xl border border-petal/20 bg-white/70 px-4 py-8 text-center shadow-[0_20px_60px_-20px_rgba(179,18,46,0.35)] backdrop-blur-md sm:rounded-4xl sm:px-12 sm:py-10 ${
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
              className="fade-up font-serif text-3xl leading-tight text-ink sm:text-4xl"
              style={{ animationDelay: "0.3s" }}
            >
            
              <br />
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
          <div key="letter" className="flex flex-col items-center gap-5 text-left">
            <Hibiscus size={72} variant="pink" className="spin-slow self-center" />
            <p className="fade-up self-start font-script text-2xl text-hibiscus sm:text-3xl">Dear {CRUSH_NAME},</p>
            {LETTER.map((line, i) => (
              <p
                key={i}
                className="fade-up text-base leading-relaxed text-ink sm:text-lg"
                style={{ animationDelay: `${0.6 + i * 1.4}s` }}
              >
                {line}
              </p>
            ))}
            <p
              className="fade-up self-end font-script text-2xl text-hibiscus"
              style={{ animationDelay: `${0.6 + LETTER.length * 1.4}s` }}
            >
              — {FROM_NAME}
            </p>
            <button
              onClick={() => setStage("ask")}
              className="fade-up mt-2 self-center rounded-full border-2 border-hibiscus px-7 py-2.5 font-semibold text-hibiscus transition-colors hover:bg-hibiscus hover:text-white"
              style={{ animationDelay: `${1.2 + LETTER.length * 1.4}s` }}
            >
              May itatanong ako…
            </button>
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
                  notifyYes();
                  setStage("yes");
                }}
                className="relative z-10 rounded-full bg-hibiscus px-8 py-3 font-semibold text-white shadow-lg shadow-hibiscus/30 transition-all hover:bg-deep"
                style={{ transform: `scale(${yesScale})` }}
              >
                Oo, pwede 🌺
              </button>
              <button
                onMouseEnter={dodge}
                onClick={dodge}
                className="whitespace-nowrap rounded-full border border-muted/40 bg-white px-6 py-2.5 text-muted transition-transform duration-300"
                style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
              >
                {NO_LINES[Math.min(noCount, NO_LINES.length - 1)]}
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
              Kinikilig ako!
            </h2>
            <p className="fade-up text-base leading-relaxed text-ink sm:text-lg" style={{ animationDelay: "1.2s" }}>
              You just made my whole garden bloom. I promise to take care of you like the gumamela in
              our bakuran: every single day, rain or shine.
            </p>
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
              <div className="fade-up flex w-full flex-col items-center gap-3" style={{ animationDelay: "1.6s" }}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Write me a message…"
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
        <CardModal title={CARD_TITLES[openCard]} onClose={() => setOpenCard(null)}>
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
