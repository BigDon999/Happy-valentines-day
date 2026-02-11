"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ─── MUSIC PLAYER ─── */
function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoaded = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      audio.play();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    // FORCE AUTOPLAY: Start muted (always allowed), then unmute
    let hasUnmuted = false;

    const forcePlay = () => {
      audio.muted = true;
      audio.play().then(() => {
        setIsPlaying(true);
        setIsOpen(true);
        // Try to unmute after a short delay
        setTimeout(() => {
          audio.muted = false;
          hasUnmuted = true;
        }, 500);
      }).catch(() => {});
    };

    // Unmute on ANY user interaction
    const unmuteOnInteraction = () => {
      if (!hasUnmuted && audio) {
        audio.muted = false;
        hasUnmuted = true;
      }
      if (audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          setIsOpen(true);
        }).catch(() => {});
      }
      // Clean up all listeners
      ["click", "touchstart", "touchend", "scroll", "keydown", "mousemove", "pointerdown"].forEach(evt => {
        document.removeEventListener(evt, unmuteOnInteraction);
      });
    };

    // Listen for every possible interaction
    ["click", "touchstart", "touchend", "scroll", "keydown", "mousemove", "pointerdown"].forEach(evt => {
      document.addEventListener(evt, unmuteOnInteraction, { once: true, passive: true });
    });

    // Start immediately
    forcePlay();

    // Retry if somehow paused
    const retryInterval = setInterval(() => {
      if (audio.paused) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        setIsOpen(true);
      }
    }, 1000);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
      clearInterval(retryInterval);
      ["click", "touchstart", "touchend", "scroll", "keydown", "mousemove", "pointerdown"].forEach(evt => {
        document.removeEventListener(evt, unmuteOnInteraction);
      });
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  }, []);

  const fmt = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="music-player-wrapper">
      <audio ref={audioRef} src="/Arctic Monkeys - I Wanna Be Yours.mp3" preload="metadata" />

      {/* Toggle Button */}
      <button
        className={`music-toggle ${isPlaying ? "playing" : ""}`}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            if (!isPlaying) togglePlay();
          } else {
            togglePlay();
          }
        }}
        aria-label="Toggle music"
      >
        <span className="music-icon">{isPlaying ? "🎶" : "🎵"}</span>
        {!isPlaying && <span className="music-pulse" />}
        {isPlaying && <span className="music-vinyl-ring" />}
      </button>

      {/* Player Panel */}
      <div className={`music-panel ${isOpen ? "open" : ""}`}>
        <div className="music-panel-header">
          <span>🎶</span>
          <span>Now Playing</span>
          <span>💕</span>
        </div>

        {/* Song Info */}
        <div className="music-song-info">
          <div className="music-song-title">I Wanna Be Yours</div>
          <div className="music-song-artist">Arctic Monkeys</div>
        </div>

        {/* Controls */}
        <div className="music-controls">
          <button className="music-play-btn" onClick={togglePlay}>
            {isPlaying ? "⏸️" : "▶️"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="music-progress-wrap" ref={progressRef} onClick={handleSeek}>
          <div className="music-progress-bar">
            <div className="music-progress-fill" style={{ width: `${progress}%` }}>
              <span className="music-progress-dot" />
            </div>
          </div>
          <div className="music-time">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Close */}
        <button className="music-close" onClick={() => setIsOpen(false)}>✕</button>
      </div>
    </div>
  );
}

/* ─── FLOATING HEARTS ─── */
function FloatingHearts() {
  const hearts = [
    { emoji: "❤️", x: "5%", dur: "9s", del: "0s", bl: "1px", op: 0.4, sz: "1.2rem" },
    { emoji: "💕", x: "15%", dur: "11s", del: "2s", bl: "0px", op: 0.6, sz: "1rem" },
    { emoji: "💗", x: "25%", dur: "8s", del: "4s", bl: "2px", op: 0.3, sz: "1.5rem" },
    { emoji: "❤️", x: "35%", dur: "13s", del: "1s", bl: "0px", op: 0.5, sz: "0.9rem" },
    { emoji: "💖", x: "45%", dur: "10s", del: "3s", bl: "1px", op: 0.4, sz: "1.3rem" },
    { emoji: "💗", x: "55%", dur: "12s", del: "5s", bl: "0px", op: 0.5, sz: "1.1rem" },
    { emoji: "❤️", x: "65%", dur: "9s", del: "2.5s", bl: "2px", op: 0.3, sz: "1.4rem" },
    { emoji: "💕", x: "75%", dur: "11s", del: "0.5s", bl: "0px", op: 0.6, sz: "1rem" },
    { emoji: "💖", x: "85%", dur: "8s", del: "3.5s", bl: "1px", op: 0.4, sz: "1.2rem" },
    { emoji: "❤️", x: "92%", dur: "14s", del: "1.5s", bl: "0px", op: 0.5, sz: "0.8rem" },
    { emoji: "💗", x: "10%", dur: "10s", del: "6s", bl: "1px", op: 0.35, sz: "1.1rem" },
    { emoji: "💕", x: "50%", dur: "12s", del: "7s", bl: "2px", op: 0.3, sz: "1.3rem" },
  ];

  return (
    <div className="floating-hearts">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="floating-heart"
          style={{ "--x": h.x, "--dur": h.dur, "--del": h.del, "--bl": h.bl, "--op": h.op, fontSize: h.sz }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

/* ─── ROSE PETALS ─── */
function RosePetals() {
  const petals = [
    { x: "8%", sz: "11px", dur: "9s", del: "0s", bl: "1px", op: 0.4, cl: "#fda4af" },
    { x: "18%", sz: "14px", dur: "12s", del: "2.5s", bl: "0px", op: 0.5, cl: "#f9a8d4" },
    { x: "28%", sz: "9px", dur: "10s", del: "5s", bl: "1.5px", op: 0.35, cl: "#fecdd3" },
    { x: "38%", sz: "16px", dur: "14s", del: "1s", bl: "0px", op: 0.45, cl: "#fbcfe8" },
    { x: "48%", sz: "12px", dur: "11s", del: "3.5s", bl: "1px", op: 0.4, cl: "#fda4af" },
    { x: "58%", sz: "10px", dur: "8.5s", del: "6s", bl: "0.5px", op: 0.5, cl: "#f9a8d4" },
    { x: "68%", sz: "15px", dur: "13s", del: "0.5s", bl: "2px", op: 0.35, cl: "#fecdd3" },
    { x: "78%", sz: "11px", dur: "9.5s", del: "4s", bl: "0px", op: 0.45, cl: "#fbcfe8" },
    { x: "88%", sz: "13px", dur: "11.5s", del: "7s", bl: "1px", op: 0.4, cl: "#fda4af" },
    { x: "95%", sz: "9px", dur: "10.5s", del: "2s", bl: "1.5px", op: 0.5, cl: "#f9a8d4" },
  ];

  return (
    <div className="floating-hearts">
      {petals.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={{ "--x": p.x, "--sz": p.sz, "--dur": p.dur, "--del": p.del, "--bl": p.bl, "--op": p.op, "--cl": p.cl }}
        />
      ))}
    </div>
  );
}

/* ─── CONFETTI ─── */
function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#f43f5e", "#ec4899", "#fb7185", "#f9a8d4", "#fda4af", "#d4a574", "#f0d9b5", "#ff6b81"];
  const pieces = Array.from({ length: 50 }, (_, i) => {
    const isHeart = i % 5 === 0;
    return {
      x: `${Math.random() * 100}%`,
      sz: isHeart ? `${16 + Math.random() * 10}px` : `${6 + Math.random() * 7}px`,
      c: colors[Math.floor(Math.random() * colors.length)],
      dur: `${2 + Math.random() * 2}s`,
      del: `${Math.random() * 1.5}s`,
      rot: `${360 + Math.random() * 720}deg`,
      dx: `${-35 + Math.random() * 70}px`,
      rad: isHeart ? "0" : Math.random() > 0.5 ? "50%" : "2px",
      isHeart,
    };
  });

  return (
    <div className="confetti-layer">
      {pieces.map((p, i) => (
        <div
          key={i}
          className={`confetti-bit${p.isHeart ? " heart" : ""}`}
          style={{ "--x": p.x, "--sz": p.sz, "--c": p.c, "--dur": p.dur, "--del": p.del, "--rot": p.rot, "--dx": p.dx, "--rad": p.rad }}
        >
          {p.isHeart ? "❤️" : ""}
        </div>
      ))}
    </div>
  );
}

/* ─── ORBITING HEARTS ─── */
function OrbitingHearts() {
  const orbits = [
    { emoji: "💗", spd: "5s", r: "60px", del: "0s" },
    { emoji: "💕", spd: "7s", r: "80px", del: "-2s" },
    { emoji: "✨", spd: "6s", r: "70px", del: "-4s" },
    { emoji: "💖", spd: "8s", r: "90px", del: "-1s" },
  ];

  return (
    <>
      {orbits.map((o, i) => (
        <span key={i} className="orbit-heart" style={{ "--spd": o.spd, "--r": o.r, animationDelay: o.del }}>
          {o.emoji}
        </span>
      ))}
    </>
  );
}

/* ─── SPARKLES ─── */
const SPARKS = [
  { top: "12%", left: "18%", spd: "2.2s", del: "0s", sz: "4px" },
  { top: "22%", left: "78%", spd: "3s", del: "0.8s", sz: "5px" },
  { top: "42%", left: "10%", spd: "2.5s", del: "1.5s", sz: "3px" },
  { top: "58%", left: "88%", spd: "1.8s", del: "0.3s", sz: "6px" },
  { top: "32%", left: "52%", spd: "2.8s", del: "2s", sz: "4px" },
  { top: "72%", left: "32%", spd: "2s", del: "1s", sz: "5px" },
  { top: "52%", left: "68%", spd: "3.2s", del: "0.5s", sz: "3px" },
  { top: "82%", left: "48%", spd: "2.4s", del: "1.8s", sz: "6px" },
  { top: "18%", left: "42%", spd: "1.7s", del: "2.5s", sz: "4px" },
  { top: "68%", left: "12%", spd: "2.6s", del: "0.2s", sz: "5px" },
  { top: "38%", left: "92%", spd: "2.1s", del: "1.2s", sz: "3px" },
  { top: "48%", left: "55%", spd: "3.4s", del: "0.7s", sz: "4px" },
];

function Sparkles({ count = 8 }) {
  return (
    <>
      {SPARKS.slice(0, count).map((s, i) => (
        <div key={i} className="sparkle" style={{ top: s.top, left: s.left, "--spd": s.spd, "--del": s.del, "--sz": s.sz }} />
      ))}
    </>
  );
}

/* ─── MAIN APP ─── */
export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [showGiftReveal, setShowGiftReveal] = useState(false);
  const noButtonRef = useRef(null);

  const goToPage = useCallback((p) => setCurrentPage(p), []);

  const handleYes = useCallback(() => {
    setShowConfetti(true);
    goToPage(3);
    setTimeout(() => setShowConfetti(false), 5000);
  }, [goToPage]);

  const handleNoHover = useCallback(() => {
    const mX = typeof window !== "undefined" ? window.innerWidth - 200 : 300;
    const mY = typeof window !== "undefined" ? window.innerHeight - 100 : 300;
    setNoButtonPos({ x: Math.random() * mX - mX / 2, y: Math.random() * mY - mY / 2 });
    setNoAttempts((p) => p + 1);
  }, []);

  const handleOpenGift = useCallback(() => {
    setGiftOpened(true);
    setTimeout(() => setShowGiftReveal(true), 800);
  }, []);

  const noMsgs = ["No 😅", "Are you sure? 🥺", "Really?! 😢", "Think again! 💔", "Please? 🥹", "I'll be sad... 😭", "One more chance? 🙏", "Pretty please? 🌹"];

  const pgClass = (idx) =>
    `page ${idx === 0 ? "page-landing" : idx === 1 ? "page-message" : idx === 2 ? "page-question" : idx === 3 ? "page-celebration" : "page-gift"} ${currentPage === idx ? "active" : currentPage > idx ? "exit-left" : ""}`;

  return (
    <div className="valentine-app">
      <Confetti active={showConfetti} />

      {/* ─── PAGE 1 : LANDING ─── */}
      <div className={pgClass(0)}>
        <FloatingHearts />
        <RosePetals />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div className="heart-glow" />
          <div className="heart-main" style={{ fontSize: "clamp(4rem,12vw,7rem)" }}>❤️</div>
          <OrbitingHearts />
        </div>

        <h1 className="heading">Happy Valentine&apos;s Day ❤️</h1>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-dot">♥</span>
          <div className="divider-line" />
        </div>

        <p className="subtext">There&apos;s something special I want to ask you…</p>

        <div style={{ marginTop: "2rem" }}>
          <button id="btn-continue" className="btn" onClick={() => goToPage(1)}>Continue ✨</button>
        </div>
      </div>

      {/* ─── PAGE 2 : LOVE MESSAGE ─── */}
      <div className={pgClass(1)}>
        <FloatingHearts />
        <RosePetals />

        {/* Envelope */}
        <div className="envelope">💌</div>

        {/* Love Letter Card */}
        <div className="letter-card">
          <Sparkles count={6} />

          <p className="letter-line" style={{ "--d": "0.4s" }}>
            Every moment with you means more than you know…
          </p>

          <div style={{ height: "0.8rem" }} />

          <p className="letter-line letter-accent" style={{ "--d": "0.7s" }}>
            You make the ordinary feel extraordinary, and every day brighter just by being you.
          </p>

          <div style={{ height: "0.8rem" }} />

          <p className="letter-line letter-accent" style={{ "--d": "1s", color: "#be123c" }}>
            My heart beats for you, today and always. 🌹
          </p>

          <p className="letter-signature">— With all my love 💕</p>
        </div>

        <div className="divider" style={{ animationDelay: "1s" }}>
          <div className="divider-line" />
          <span className="divider-dot">♥</span>
          <div className="divider-line" />
        </div>

        <div style={{ marginTop: "0.5rem" }}>
          <button id="btn-question" className="btn" onClick={() => goToPage(2)} style={{ animationDelay: "1.2s" }}>
            I have a question… 💭
          </button>
        </div>
      </div>

      {/* ─── PAGE 3 : THE BIG QUESTION ─── */}
      <div className={pgClass(2)}>
        <FloatingHearts />
        <RosePetals />

        {/* Heart with pulse rings */}
        <div className="question-wrap">
          <div className="pulse-ring" style={{ "--d": "0s" }} />
          <div className="pulse-ring" style={{ "--d": "1s" }} />
          <div className="pulse-ring" style={{ "--d": "2s" }} />
          <div className="heart-glow" />
          <div className="heart-main" style={{ fontSize: "clamp(3rem,9vw,4.5rem)" }}>💝</div>
        </div>

        <h2 className="heading" style={{ animationDelay: "0.2s" }}>Will you be my Valentine?</h2>

        <p className="subtext" style={{ animationDelay: "0.5s", maxWidth: "300px", color: "#e91e63", fontSize: "clamp(0.9rem,2.5vw,1.1rem)" }}>
          This is the most important question I&apos;ve ever asked… 💕
        </p>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-dot">♥</span>
          <div className="divider-line" />
        </div>

        <div className="question-btns">
          <button id="btn-yes" className="btn btn-large" onClick={handleYes} style={{ animationDelay: "0.6s" }}>
            Yes ❤️
          </button>
          <button
            id="btn-no"
            ref={noButtonRef}
            className="btn btn-no"
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            onClick={handleNoHover}
            style={{
              transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px) scale(${Math.max(0.7, 1 - noAttempts * 0.05)})`,
              transition: "transform 0.3s ease",
            }}
          >
            {noMsgs[Math.min(noAttempts, noMsgs.length - 1)]}
          </button>
        </div>
      </div>

      {/* ─── PAGE 4 : CELEBRATION ─── */}
      <div className={pgClass(3)}>
        <FloatingHearts />
        <RosePetals />

        <div className="celeb-glow" />

        <div style={{ fontSize: "clamp(3rem,9vw,4.5rem)", animation: "bounceIn .6s ease-out both", marginBottom: "0.3rem" }}>
          🎉
        </div>

        <h2 className="yay-text">Yay!!!</h2>

        <div className="celeb-card">
          <Sparkles count={6} />
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(1rem,2.8vw,1.25rem)",
            color: "#e91e63",
            lineHeight: 1.7,
            animation: "fadeUp .8s ease-out .4s both",
          }}>
            You just made me the happiest person in the world! 🥰
          </p>
          <div style={{ height: "0.5rem" }} />
          <p className="body-text" style={{ animation: "fadeUp .8s ease-out .7s both" }}>
            I knew you&apos;d say yes… my heart was already yours. 💖
          </p>
        </div>

        <div className="celeb-emojis" style={{ marginTop: "0.8rem" }}>
          {["💖", "💕", "❤️", "💗", "💝"].map((e, i) => (
            <span key={i} className="celeb-emoji" style={{ "--spd": `${2 + i * 0.3}s`, "--del": `${i * 0.15}s` }}>
              {e}
            </span>
          ))}
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <button id="btn-gift" className="btn btn-gold" onClick={() => goToPage(4)} style={{ animationDelay: "1s" }}>
            Open Your Gift 🎁
          </button>
        </div>
      </div>

      {/* ─── PAGE 5 : GIFT REVEAL ─── */}
      <div className={pgClass(4)}>
        <FloatingHearts />
        <RosePetals />
        <Sparkles count={10} />

        {/* Gift Box */}
        <div className="gift-wrap">
          <div
            className={`gift-box ${giftOpened ? "opened" : ""}`}
            onClick={handleOpenGift}
            style={{ cursor: giftOpened ? "default" : "pointer" }}
          >
            <div className="gift-bow">
              <div className="bow-knot" />
            </div>
            <div className="gift-lid" />
            <div className="gift-body" />
            <div className="gift-rays" />
          </div>

          {!giftOpened && (
            <p className="body-text" style={{ marginTop: "1.4rem", color: "#c2185b", animation: "fadeUp 1s ease-out .5s both" }}>
              Tap to open your gift ✨
            </p>
          )}
        </div>

        {/* Reveal Card */}
        <div className={`reveal-card ${showGiftReveal ? "show" : ""}`} style={{ marginTop: "1.5rem" }}>
          <Sparkles count={8} />

          <div style={{ fontSize: "clamp(2.2rem,6vw,3rem)", marginBottom: "0.6rem" }}>🌹</div>

          <p className="reveal-msg">My heart is your gift, today and always.</p>

          <div className="divider" style={{ justifyContent: "center", margin: "0.6rem auto" }}>
            <div className="divider-line" />
            <span className="divider-dot">♥</span>
            <div className="divider-line" />
          </div>

          <p className="reveal-sub">
            I promise to love you, cherish you, and make every day feel like Valentine&apos;s Day. You are my forever. 💕
          </p>

          <p className="reveal-final">Happy Valentine&apos;s Day, my love ❤️</p>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", fontSize: "clamp(1.2rem,3vw,1.6rem)", justifyContent: "center" }}>
            {["🌹", "💖", "✨", "💖", "🌹"].map((e, i) => (
              <span key={i} className="celeb-emoji" style={{ "--spd": `${2 + i * 0.2}s`, "--del": `${i * 0.1}s` }}>{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MUSIC PLAYER ─── */}
      <MusicPlayer />

      {/* ─── FOOTER ─── */}
      <footer className="made-by-footer">
        <a href="https://bigdon-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="made-by-link">
          With love from me 2 you 💕
        </a>
      </footer>

    </div>
  );
}
