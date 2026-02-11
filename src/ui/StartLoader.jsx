import { useEffect, useMemo, useState, useCallback } from "react";
import { useProgress } from "@react-three/drei";

export default function StartLoader({ onStart }) {
  
  const { progress, loaded, total } = useProgress();

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => setIsPortrait(window.innerHeight > window.innerWidth);
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

  const tipList = useMemo(() => {
    if (!isMobile) {
      return [
        "Clique sur « Entrer », puis clique dans la scène pour activer la vue FPS.",
        "ZQSD : se déplacer • Souris : regarder • Échap : sortir.",
      ];
    }
    if (isPortrait) {
      return ["Passe en paysage pour une meilleure expérience."];
    }
    return [
      "Joystick : déplacement • Glisser : caméra.",
      "Tape sur les éléments pour ouvrir leurs contenus.",
    ];
  }, [isMobile, isPortrait]);

  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(() => {
    if (starting) return;
    setStarting(true);
    onStart?.();
  }, [starting, onStart]);

  if (!visible) return null;

  const canEnter = !starting;

  const noteText = starting
    ? "Chargement de la scène 3D…"
    : "Astuce : sur mobile, passe en paysage pour une meilleure navigation.";

  const metaText =
    !starting && total > 0 ? `Ressources (info) : ${loaded}/${total} • ${Math.round(Number(progress) || 0)}%` : "";

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src="/textures/logo/portfolio-thomas-96.webp"
            srcSet="/textures/logo/portfolio-thomas-96.webp 1x, /textures/logo/portfolio-thomas-128.webp 2x"
            alt="Logo Portfolio Thomas"
            width="86"
            height="86"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            style={styles.logo}
          />

          <div style={styles.titleWrap}>
            <div style={styles.kicker}>Bienvenue sur le portfolio 3D de</div>
            <div style={styles.title}>Thomas</div>
            <div style={styles.sub}>
              Explore la bibliothèque, les diplômes et la carte du monde.
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Comment naviguer</div>
          <ul style={styles.list}>
            {tipList.map((t) => (
              <li key={t} style={styles.li}>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={handleStart}
            disabled={!canEnter}
            style={{
              ...styles.btn,
              ...(canEnter ? styles.btnOn : styles.btnOff),
            }}
          >
            {starting ? "Chargement…" : "OK — Entrer"}
          </button>

          <div style={styles.note}>
            {noteText}
            {metaText ? <div style={styles.meta}>{metaText}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "grid",
    placeItems: "center",
    padding: 16,
    background:
      "radial-gradient(1200px 700px at 50% 20%, rgba(255,255,255,0.08), transparent 60%), rgba(7,7,10,0.96)",
    color: "rgba(255,255,255,0.92)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  card: {
    width: "min(720px, 96vw)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,10,14,0.86)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
    padding: 18,
    backdropFilter: "blur(8px)",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "86px 1fr",
    gap: 14,
    alignItems: "center",
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 12,
  },
  logo: {
    width: 86,
    height: 86,
    objectFit: "contain",
    filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.45))",
  },
  titleWrap: { minWidth: 0 },
  kicker: { fontSize: 12, opacity: 0.75, letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginTop: 2 },
  sub: { marginTop: 6, fontSize: 13, opacity: 0.8, lineHeight: 1.35 },

  section: { marginTop: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8, opacity: 0.95 },
  list: { margin: 0, paddingLeft: 18 },
  li: { marginBottom: 6, fontSize: 13, opacity: 0.9, lineHeight: 1.35 },

  footer: { marginTop: 14, display: "grid", gap: 10 },
  btn: {
    width: "100%",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
  },
  btnOn: {
    background: "rgba(255,210,0,0.92)",
    color: "rgba(0,0,0,0.92)",
  },
  btnOff: {
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.55)",
    cursor: "not-allowed",
  },
  note: { fontSize: 12, opacity: 0.7, textAlign: "center" },
  meta: { marginTop: 6, fontSize: 11, opacity: 0.6 },
};
