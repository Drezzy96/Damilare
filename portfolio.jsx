import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────
   CUSTOM HOOK: useInView — simple IntersectionObserver
   ───────────────────────────────────────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
   ───────────────────────────────────────────── */
function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, [data-hover]").forEach(el => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    let raf;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 20}px, ${pos.current.y - 20}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 4}px, ${target.current.y - 4}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} style={{
        position: "fixed", top: 0, left: 0, width: hovered ? 56 : 40, height: hovered ? 56 : 40,
        borderRadius: "50%", border: "1.5px solid rgba(180,120,255,0.6)",
        pointerEvents: "none", zIndex: 9999, transition: "width 0.3s, height 0.3s, border-color 0.3s",
        mixBlendMode: "difference", marginLeft: hovered ? -8 : 0, marginTop: hovered ? -8 : 0,
        backdropFilter: "blur(2px)",
      }} />
      <div ref={dotRef} style={{
        position: "fixed", top: 0, left: 0, width: 8, height: 8, borderRadius: "50%",
        background: "rgba(200,150,255,0.9)", pointerEvents: "none", zIndex: 10000,
      }} />
    </>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED BACKGROUND — canvas wave blobs
   ───────────────────────────────────────────── */
function AnimatedBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let t = 0;

    const blobs = [
      { x: 0.2, y: 0.3, r: 380, hue: 270, speed: 0.0007 },
      { x: 0.8, y: 0.15, r: 320, hue: 310, speed: 0.0009 },
      { x: 0.5, y: 0.75, r: 400, hue: 240, speed: 0.0005 },
      { x: 0.9, y: 0.6, r: 280, hue: 290, speed: 0.0011 },
    ];

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      blobs.forEach((b, i) => {
        const cx = (b.x + Math.sin(t * b.speed * 1000 + i) * 0.08) * w;
        const cy = (b.y + Math.cos(t * b.speed * 800 + i * 1.3) * 0.07) * h;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
        grad.addColorStop(0, `hsla(${b.hue},80%,55%,0.13)`);
        grad.addColorStop(1, `hsla(${b.hue},70%,40%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      filter: "blur(60px)", opacity: 0.9,
    }} />
  );
}

/* ─────────────────────────────────────────────
   3D AVATAR — cartoon-style SVG head
   ───────────────────────────────────────────── */
function Avatar3D() {
  return (
    <div style={{
      width: 220, height: 220, borderRadius: "50%",
      background: "linear-gradient(135deg,#1e1128 0%,#2a1540 100%)",
      border: "2.5px solid rgba(180,100,255,0.25)",
      boxShadow: "0 0 60px rgba(160,80,255,0.3), 0 0 120px rgba(100,60,200,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      animation: "float 6s ease-in-out infinite",
    }}>
      {/* Glow ring */}
      <div style={{
        position: "absolute", inset: -2,
        borderRadius: "50%",
        background: "conic-gradient(from 0deg, #a855f7, #ec4899, #6366f1, #a855f7)",
        zIndex: 0, opacity: 0.4,
        animation: "spin 8s linear infinite",
        filter: "blur(4px)",
      }} />
      <div style={{
        position: "absolute", inset: 3, borderRadius: "50%",
        background: "linear-gradient(135deg,#1a0f2e 0%,#2d1555 100%)",
        zIndex: 1,
      }} />
      {/* Cartoon SVG avatar */}
      <svg width="150" height="160" viewBox="0 0 150 160" style={{ position: "relative", zIndex: 2 }}>
        {/* Neck */}
        <rect x="60" y="118" width="30" height="25" rx="6" fill="#F4A261" />
        {/* Head */}
        <ellipse cx="75" cy="82" rx="52" ry="56" fill="#F4A261" />
        {/* Hair */}
        <path d="M23 72 Q25 20 75 18 Q125 20 127 72 Q115 30 75 32 Q35 30 23 72Z" fill="#1a0a2e" />
        <path d="M23 72 Q18 60 22 50 Q28 35 75 32 Q35 35 28 65Z" fill="#2a1040" />
        {/* Eyes */}
        <ellipse cx="57" cy="80" rx="9" ry="10" fill="white" />
        <ellipse cx="93" cy="80" rx="9" ry="10" fill="white" />
        <ellipse cx="59" cy="81" rx="5" ry="6" fill="#1a0a2e" />
        <ellipse cx="95" cy="81" rx="5" ry="6" fill="#1a0a2e" />
        <circle cx="61" cy="79" r="2" fill="white" />
        <circle cx="97" cy="79" r="2" fill="white" />
        {/* Eyebrows */}
        <path d="M48 68 Q57 64 66 67" stroke="#1a0a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M84 67 Q93 64 102 68" stroke="#1a0a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M72 88 Q75 95 78 88" stroke="#d4845a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Smile */}
        <path d="M60 103 Q75 114 90 103" stroke="#c0603a" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Ears */}
        <ellipse cx="23" cy="85" rx="6" ry="8" fill="#F4A261" />
        <ellipse cx="127" cy="85" rx="6" ry="8" fill="#F4A261" />
        {/* Collar */}
        <path d="M42 135 Q60 128 75 132 Q90 128 108 135 Q95 145 75 143 Q55 145 42 135Z" fill="#7c3aed" />
      </svg>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING 3D SHAPES for About section
   ───────────────────────────────────────────── */
function FloatingShape({ type, style }) {
  const shapes = {
    moon: (
      <svg width="60" height="60" viewBox="0 0 60 60">
        <defs><radialGradient id="mg" cx="40%" cy="40%"><stop offset="0%" stopColor="#e0b0ff" /><stop offset="100%" stopColor="#7c3aed" /></radialGradient></defs>
        <circle cx="30" cy="30" r="28" fill="url(#mg)" />
        <circle cx="40" cy="22" r="22" fill="#0B0B0F" />
      </svg>
    ),
    cube: (
      <svg width="55" height="55" viewBox="0 0 55 55">
        <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
        <polygon points="27,5 50,18 50,40 27,53 4,40 4,18" fill="url(#cg)" opacity="0.85" />
        <polygon points="27,5 50,18 27,31 4,18" fill="rgba(255,255,255,0.15)" />
        <polygon points="27,31 50,18 50,40 27,53" fill="rgba(0,0,0,0.25)" />
      </svg>
    ),
    ring: (
      <svg width="65" height="65" viewBox="0 0 65 65">
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
        <circle cx="32" cy="32" r="28" fill="none" stroke="url(#rg)" strokeWidth="8" opacity="0.7" />
        <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="rgba(200,100,255,0.3)" strokeWidth="3" />
      </svg>
    ),
    star: (
      <svg width="50" height="50" viewBox="0 0 50 50">
        <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
        <polygon points="25,3 30,18 46,18 33,28 38,44 25,34 12,44 17,28 4,18 20,18" fill="url(#sg)" opacity="0.8" />
      </svg>
    ),
  };
  return (
    <div style={{
      position: "absolute", animation: "floatObj 7s ease-in-out infinite", ...style,
      filter: "drop-shadow(0 0 12px rgba(168,85,247,0.4))",
    }}>
      {shapes[type]}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROJECT CARD
   ───────────────────────────────────────────── */
const projects = [
  { title: "Nebula Dashboard", category: "UI/UX Design", gradient: "135deg,#1e0533,#3d1068", accent: "#a855f7", img: null },
  { title: "Aether Brand", category: "Brand Identity", gradient: "135deg,#0d1f3c,#1a3a6b", accent: "#6366f1", img: null },
  { title: "Solaris App", category: "Mobile Design", gradient: "135deg,#2a0a1a,#5c1a3a", accent: "#ec4899", img: null },
  { title: "Prism Motion", category: "Motion Design", gradient: "135deg,#071a0e,#0f3d1f", accent: "#22d3ee", img: null },
  { title: "Void 3D", category: "3D / Art", gradient: "135deg,#1a1200,#3d2d00", accent: "#fbbf24", img: null },
  { title: "Echo Platform", category: "Product Design", gradient: "135deg,#0f0f23,#1e1e4a", accent: "#818cf8", img: null },
];

function ProjectCard({ project, delay }) {
  const [hov, setHov] = useState(false);
  const [ref, inView] = useInView();
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 20, overflow: "hidden", position: "relative", cursor: "pointer",
        background: `linear-gradient(${project.gradient})`,
        border: `1px solid rgba(255,255,255,0.07)`,
        aspectRatio: "4/3",
        transform: inView
          ? hov ? "scale(1.03) translateY(-4px)" : "scale(1) translateY(0)"
          : "scale(0.94) translateY(30px)",
        opacity: inView ? 1 : 0,
        transition: `transform 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.6s ease ${delay}ms, box-shadow 0.3s ease`,
        boxShadow: hov
          ? `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${project.accent}33`
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}>
      {/* Gradient overlay grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 30% 30%, ${project.accent}22 0%, transparent 60%)`,
        backgroundSize: "100% 100%",
      }} />
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.12,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />
      {/* Abstract shape in card */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${project.accent}55, transparent)`,
        filter: "blur(20px)",
        transition: "transform 0.4s",
        transform: hov ? "translateX(-50%) scale(1.5)" : "translateX(-50%) scale(1)",
      }} />
      {/* Hover overlay */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
        opacity: hov ? 1 : 0, transition: "opacity 0.3s ease",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12,
        backdropFilter: "blur(4px)",
      }}>
        <div style={{ fontSize: 13, color: project.accent, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}>
          {project.category}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "white", textAlign: "center", padding: "0 20px" }}>
          {project.title}
        </div>
        <div style={{
          marginTop: 8, padding: "10px 24px", borderRadius: 40,
          border: `1.5px solid ${project.accent}`,
          color: project.accent, fontSize: 13, fontWeight: 600, letterSpacing: 1,
          transition: "background 0.2s",
        }}>
          View Case Study →
        </div>
      </div>
      {/* Card label (always visible) */}
      <div style={{
        position: "absolute", bottom: 20, left: 20,
        opacity: hov ? 0 : 1, transition: "opacity 0.3s",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>
          {project.category}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginTop: 4 }}>
          {project.title}
        </div>
      </div>
      {/* Accent dot */}
      <div style={{
        position: "absolute", top: 18, right: 18, width: 10, height: 10,
        borderRadius: "50%", background: project.accent,
        boxShadow: `0 0 12px ${project.accent}`,
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION WRAPPER with scroll animation
   ───────────────────────────────────────────── */
function Section({ children, style }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(50px)",
      transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.23,1,0.32,1)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────── */
function Navbar({ scrolled }) {
  const [activeHov, setActiveHov] = useState(null);
  const navItems = ["About", "Projects", "Price", "Contact"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 5vw",
      height: 72,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(11,11,15,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease",
    }}>
      {/* Logo */}
      <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -1 }}>
        <span style={{ background: "linear-gradient(90deg,#c084fc,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D</span>
        <span style={{ color: "white" }}>AMILARE</span>
      </div>
      {/* Nav items */}
      <div style={{ display: "flex", gap: 40 }}>
        {navItems.map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            onMouseEnter={() => setActiveHov(item)}
            onMouseLeave={() => setActiveHov(null)}
            style={{
              color: activeHov === item ? "white" : "rgba(255,255,255,0.55)",
              fontSize: 14, fontWeight: 500, letterSpacing: 0.5,
              textDecoration: "none", position: "relative", padding: "4px 0",
              transition: "color 0.3s",
            }}>
            {item}
            <span style={{
              position: "absolute", bottom: 0, left: 0, height: 1.5,
              width: activeHov === item ? "100%" : "0%",
              background: "linear-gradient(90deg,#a855f7,#ec4899)",
              transition: "width 0.3s cubic-bezier(0.23,1,0.32,1)",
              borderRadius: 2,
            }} />
          </a>
        ))}
      </div>
      {/* CTA */}
      <button data-hover style={{
        padding: "10px 24px", borderRadius: 40,
        background: "linear-gradient(135deg,#7c3aed,#db2777)",
        border: "none", color: "white", fontSize: 13, fontWeight: 600,
        cursor: "pointer", letterSpacing: 0.5,
        boxShadow: "0 0 20px rgba(168,85,247,0.3)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 0 40px rgba(168,85,247,0.55)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 20px rgba(168,85,247,0.3)"; }}
      >
        Hire Me
      </button>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
   ───────────────────────────────────────────── */
export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const skills = ["Figma", "Blender", "React", "After Effects", "Cinema 4D", "Three.js", "Framer", "Spline"];

  return (
    <div style={{
      background: "#0B0B0F", color: "white", minHeight: "100vh",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      overflowX: "hidden", scrollBehavior: "smooth",
    }}>
      {/* Global keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0B0B0F; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 4px; }
        @keyframes floatObj {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(5deg); }
          66% { transform: translateY(-8px) rotate(-4deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scrollTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 30px rgba(168,85,247,0.4), 0 0 60px rgba(236,72,153,0.2); }
          50% { box-shadow: 0 0 50px rgba(168,85,247,0.7), 0 0 100px rgba(236,72,153,0.4); }
        }
        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; align-items: center !important; }
          .projects-grid { grid-template-columns: 1fr !important; }
          .about-grid { flex-direction: column !important; }
          .nav-links { display: none !important; }
          .hero-heading { font-size: clamp(52px, 12vw, 80px) !important; }
        }
      `}</style>

      <AnimatedBackground />
      <CustomCursor />
      <Navbar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section id="hero" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 6vw 80px", position: "relative", zIndex: 1,
        opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease",
      }}>
        {/* Noise texture overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }} />

        {/* Large background text */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          fontSize: "clamp(100px, 18vw, 220px)", fontWeight: 900,
          color: "rgba(255,255,255,0.025)", whiteSpace: "nowrap",
          letterSpacing: -8, userSelect: "none", zIndex: 0,
          animation: "fadeIn 1.5s ease 0.5s both",
        }}>
          PORTFOLIO
        </div>

        {/* Main hero flex */}
        <div className="hero-grid" style={{
          display: "flex", width: "100%", maxWidth: 1300,
          alignItems: "center", justifyContent: "space-between",
          gap: 40, position: "relative", zIndex: 2,
        }}>
          {/* Left: heading + description */}
          <div style={{ flex: 1, animation: "fadeSlideUp 0.9s cubic-bezier(0.23,1,0.32,1) 0.2s both" }}>
            {/* Role badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 40,
              background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
              fontSize: 12, color: "#c084fc", letterSpacing: 2, textTransform: "uppercase",
              fontWeight: 600, marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block", boxShadow: "0 0 6px #a855f7" }} />
              Available for work
            </div>

            <h1 className="hero-heading" style={{
              fontSize: "clamp(60px, 8vw, 110px)", fontWeight: 900,
              lineHeight: 0.95, letterSpacing: -4, marginBottom: 12,
            }}>
              <span style={{ display: "block", color: "rgba(255,255,255,0.25)", fontSize: "0.55em", fontWeight: 700, letterSpacing: 0, marginBottom: 4 }}>
                HI, I'M
              </span>
              <span style={{
                background: "linear-gradient(135deg, #e2e8f0 0%, #ffffff 40%, #c4b5fd 80%, #f0abfc 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Damilare
              </span>
            </h1>

            <div style={{ marginTop: 32, maxWidth: 420 }}>
              <p style={{
                fontSize: "clamp(15px,1.6vw,18px)", color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7, fontWeight: 400,
              }}>
                A 3D creator driven by crafting striking and unforgettable projects that live at the intersection of art and technology.
              </p>
            </div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 16, marginTop: 44, flexWrap: "wrap" }}>
              <button data-hover style={{
                padding: "16px 40px", borderRadius: 60,
                background: "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)",
                border: "none", color: "white", fontSize: 15, fontWeight: 700,
                cursor: "pointer", letterSpacing: 0.3,
                animation: "pulseGlow 3s ease-in-out infinite",
                transition: "transform 0.25s, filter 0.25s",
              }}
                onMouseEnter={e => { e.target.style.transform = "scale(1.06)"; e.target.style.filter = "brightness(1.15)"; }}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "brightness(1)"; }}
              >
                Contact Me ✦
              </button>
              <button data-hover style={{
                padding: "16px 36px", borderRadius: 60,
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600,
                cursor: "pointer", letterSpacing: 0.3,
                transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = "rgba(168,85,247,0.5)"; e.target.style.color = "white"; e.target.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.color = "rgba(255,255,255,0.7)"; e.target.style.transform = "scale(1)"; }}
              >
                View Work
              </button>
            </div>
          </div>

          {/* Center: Avatar */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            animation: "fadeSlideUp 0.9s cubic-bezier(0.23,1,0.32,1) 0.4s both",
          }}>
            <Avatar3D />
            {/* Stats below avatar */}
            <div style={{
              display: "flex", gap: 32, marginTop: 32,
              padding: "18px 32px", borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
            }}>
              {[["5+", "Years Exp."], ["80+", "Projects"], ["40+", "Clients"]].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, background: "linear-gradient(135deg,#c084fc,#f0abfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 0.5 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: skill tags */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12,
            animation: "fadeSlideUp 0.9s cubic-bezier(0.23,1,0.32,1) 0.6s both",
          }}>
            {skills.map((s, i) => (
              <div key={s} data-hover style={{
                padding: "10px 20px", borderRadius: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)",
                cursor: "default", transition: "all 0.3s",
                animationDelay: `${i * 80}ms`,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          opacity: 0.4, animation: "fadeIn 1s ease 1.5s both",
        }}>
          <span style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Scroll</span>
          <div style={{
            width: 1.5, height: 50, background: "linear-gradient(to bottom, rgba(168,85,247,0.8), transparent)",
            animation: "float 2s ease-in-out infinite",
          }} />
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{
        overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 0", position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{
          display: "flex", gap: 64,
          animation: "scrollTicker 20s linear infinite",
          width: "max-content",
        }}>
          {[...Array(2)].map((_, di) =>
            ["3D Design", "UI / UX", "Motion", "Branding", "Art Direction", "Product", "Creative Dev", "Interaction"].map((t, i) => (
              <span key={`${di}-${i}`} style={{
                fontSize: 13, fontWeight: 500, letterSpacing: 2,
                textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                whiteSpace: "nowrap",
              }}>
                {t} <span style={{ color: "#7c3aed", marginLeft: 32 }}>✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: "120px 6vw", position: "relative", zIndex: 1 }}>
        <Section>
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 12, letterSpacing: 4, color: "#a855f7", textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>
              Selected Work
            </div>
            <h2 style={{
              fontSize: "clamp(42px,6vw,80px)", fontWeight: 900,
              letterSpacing: -3, lineHeight: 0.95,
              background: "linear-gradient(135deg,#ffffff 40%,rgba(255,255,255,0.4))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              PROJECTS
            </h2>
          </div>
        </Section>

        <div className="projects-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} delay={i * 100} />
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: "120px 6vw", position: "relative", zIndex: 1, overflow: "hidden" }}>
        {/* Floating shapes */}
        <FloatingShape type="moon" style={{ top: "5%", right: "5%", animationDelay: "0s" }} />
        <FloatingShape type="cube" style={{ top: "60%", left: "2%", animationDelay: "1.5s" }} />
        <FloatingShape type="ring" style={{ bottom: "10%", right: "10%", animationDelay: "3s" }} />
        <FloatingShape type="star" style={{ top: "40%", right: "18%", animationDelay: "0.8s" }} />

        <Section>
          <div className="about-grid" style={{ display: "flex", gap: 80, alignItems: "center" }}>
            {/* Left */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: "#a855f7", textTransform: "uppercase", fontWeight: 600, marginBottom: 20 }}>
                Who I Am
              </div>
              <h2 style={{
                fontSize: "clamp(48px,7vw,96px)", fontWeight: 900,
                letterSpacing: -4, lineHeight: 0.9, marginBottom: 40,
                background: "linear-gradient(135deg,#ffffff,rgba(255,255,255,0.4))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                ABOUT<br />ME
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(255,255,255,0.5)", maxWidth: 480, marginBottom: 32 }}>
                I'm Damilare — a multidisciplinary 3D creator and UI/UX designer who believes great design should stop people in their tracks.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.85, color: "rgba(255,255,255,0.35)", maxWidth: 480 }}>
                With 5+ years of crafting immersive digital experiences, I blend cutting-edge 3D artistry with pixel-perfect interface design to create work that's both beautiful and purposeful.
              </p>

              {/* Skills grid */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 40 }}>
                {skills.map(s => (
                  <span key={s} style={{
                    padding: "8px 18px", borderRadius: 8,
                    background: "rgba(168,85,247,0.08)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    fontSize: 13, color: "#c084fc", fontWeight: 500,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Experience timeline */}
            <div style={{ flex: 1 }}>
              {[
                { year: "2024", role: "Senior 3D Designer", co: "Freelance Studio" },
                { year: "2022", role: "Product Designer", co: "Nexus Digital" },
                { year: "2020", role: "UI/UX Designer", co: "Pixel Agency" },
                { year: "2019", role: "Junior Designer", co: "Creative Labs" },
              ].map((exp, i) => (
                <div key={i} style={{
                  display: "flex", gap: 24, padding: "28px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.paddingLeft = "12px"}
                  onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}
                >
                  <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, minWidth: 44 }}>{exp.year}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: "white", marginBottom: 4 }}>{exp.role}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{exp.co}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* ── PRICE ── */}
      <section id="price" style={{ padding: "120px 6vw", position: "relative", zIndex: 1 }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ fontSize: 12, letterSpacing: 4, color: "#a855f7", textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>
              Packages
            </div>
            <h2 style={{
              fontSize: "clamp(42px,6vw,80px)", fontWeight: 900, letterSpacing: -3,
              background: "linear-gradient(135deg,#ffffff,rgba(255,255,255,0.4))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              PRICING
            </h2>
          </div>

          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { name: "Starter", price: "$1,200", desc: "Perfect for small businesses and personal brands", features: ["UI Design (5 screens)", "Brand Identity", "Mobile Responsive", "2 Revisions"], accent: "#6366f1", popular: false },
              { name: "Pro", price: "$3,500", desc: "Full-scale design for growing companies", features: ["UI/UX (20+ screens)", "3D Assets & Renders", "Motion Design", "Brand System", "Unlimited Revisions"], accent: "#a855f7", popular: true },
              { name: "Enterprise", price: "Custom", desc: "End-to-end creative direction for large teams", features: ["Full Design System", "3D / AR Experiences", "Dev Handoff", "Ongoing Support", "Priority Access"], accent: "#ec4899", popular: false },
            ].map((plan, i) => (
              <div key={plan.name} data-hover style={{
                flex: "1 1 280px", maxWidth: 340,
                padding: "40px 32px", borderRadius: 24,
                background: plan.popular
                  ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(219,39,119,0.15))"
                  : "rgba(255,255,255,0.03)",
                border: plan.popular ? "1.5px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.07)",
                position: "relative", overflow: "hidden",
                transition: "transform 0.3s, box-shadow 0.3s",
                boxShadow: plan.popular ? "0 0 60px rgba(168,85,247,0.2)" : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03) translateY(-6px)"; e.currentTarget.style.boxShadow = `0 20px 60px ${plan.accent}33`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) translateY(0)"; e.currentTarget.style.boxShadow = plan.popular ? "0 0 60px rgba(168,85,247,0.2)" : "none"; }}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute", top: 20, right: 20,
                    padding: "4px 12px", borderRadius: 40,
                    background: "linear-gradient(135deg,#7c3aed,#db2777)",
                    fontSize: 11, fontWeight: 700, letterSpacing: 1,
                  }}>
                    POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, color: plan.accent, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>{plan.name}</div>
                <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>{plan.price}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 32, lineHeight: 1.6 }}>{plan.desc}</div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ color: plan.accent, fontSize: 16 }}>✓</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{f}</span>
                  </div>
                ))}
                <button data-hover style={{
                  width: "100%", marginTop: 32, padding: "14px", borderRadius: 40,
                  background: plan.popular ? `linear-gradient(135deg,#7c3aed,#db2777)` : "transparent",
                  border: plan.popular ? "none" : `1.5px solid ${plan.accent}66`,
                  color: plan.popular ? "white" : plan.accent,
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.3s",
                }}
                  onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                >
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "120px 6vw 80px", position: "relative", zIndex: 1 }}>
        <Section>
          <div style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center",
            padding: "80px 60px", borderRadius: 32,
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(219,39,119,0.08))",
            border: "1px solid rgba(168,85,247,0.2)",
            backdropFilter: "blur(20px)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Glow orb */}
            <div style={{
              position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
              width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)",
              filter: "blur(40px)", pointerEvents: "none",
            }} />
            <div style={{ fontSize: 12, letterSpacing: 4, color: "#a855f7", textTransform: "uppercase", fontWeight: 600, marginBottom: 24 }}>
              Let's Connect
            </div>
            <h2 style={{
              fontSize: "clamp(42px,6vw,80px)", fontWeight: 900, letterSpacing: -3,
              lineHeight: 0.95, marginBottom: 24,
              background: "linear-gradient(135deg,#ffffff,rgba(255,255,255,0.5))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              START A PROJECT
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 48, maxWidth: 480, margin: "0 auto 48px" }}>
              Have a vision? Let's turn it into something unforgettable. I'm currently accepting new projects.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button data-hover style={{
                padding: "18px 48px", borderRadius: 60,
                background: "linear-gradient(135deg,#7c3aed,#db2777)",
                border: "none", color: "white", fontSize: 16, fontWeight: 700,
                cursor: "pointer", animation: "pulseGlow 3s ease-in-out infinite",
                transition: "transform 0.25s, filter 0.25s",
              }}
                onMouseEnter={e => { e.target.style.transform = "scale(1.06)"; e.target.style.filter = "brightness(1.2)"; }}
                onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.filter = "brightness(1)"; }}
              >
                damilare@studio.co ✦
              </button>
            </div>
            {/* Social links */}
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48 }}>
              {["Behance", "Dribbble", "LinkedIn", "Twitter"].map(s => (
                <a key={s} href="#" style={{
                  fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none",
                  transition: "color 0.3s", fontWeight: 500,
                }}
                  onMouseEnter={e => e.target.style.color = "#c084fc"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "32px 6vw", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 1, flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>
          <span style={{ background: "linear-gradient(90deg,#c084fc,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>D</span>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>amilare Studio</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          © 2025 Damilare. All rights reserved.
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Crafted with passion ✦
        </div>
      </footer>
    </div>
  );
}
