import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useProgress } from "@react-three/drei";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function StartLoader({ onStart }) {
  const { active, progress, item, loaded, total } = useProgress();

  
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  
  const canEnter = useMemo(() => {
    const p = Number(progress) || 0;
    const doneByCount = total > 0 && loaded >= total;
    return p >= 99 || doneByCount;
  }, [progress, loaded, total]);

  
  const [p, setP] = useState(0);
  const pRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = clamp(Number(progress) || 0, 0, 100);
    targetRef.current = canEnter ? 100 : target;

    if (rafRef.current) return;

    const tick = () => {
      const cur = pRef.current;
      const tgt = targetRef.current;

      const next = cur + (tgt - cur) * 0.14;
      const snap = Math.abs(next - tgt) < 0.25 ? tgt : next;

      pRef.current = snap;
      setP(snap);

      if (snap >= 99.9 || Math.abs(snap - tgt) < 0.05) {
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [progress, canEnter]);

  const [readyFlash, setReadyFlash] = useState(false);
  useEffect(() => {
    if (!canEnter) return;
    setReadyFlash(true);
    const t = setTimeout(() => setReadyFlash(false), 450);
    return () => clearTimeout(t);
  }, [canEnter]);

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

  const tips = useMemo(() => {
    return {
      desktop: [
        "Clique sur « Entrer » puis clique dans la scène pour activer la vue FPS.",
        "ZQSD : se déplacer • Souris : regarder • Échap : sortir du contrôle.",
      ],
      mobileLandscape: [
        "Joystick : déplacement • Glisser : caméra.",
        "Tape sur les éléments pour ouvrir leurs contenus.",
      ],
      mobilePortrait: [
        "Passe en paysage pour une meilleure expérience.",
      ],
    };
  }, []);

  const tipList = useMemo(() => {
    if (!isMobile) return tips.desktop;
    return isPortrait ? tips.mobilePortrait : tips.mobileLandscape;
  }, [isMobile, isPortrait, tips]);

  const handleStart = useCallback(() => {
    if (!canEnter) return;
    onStart?.();
  }, [canEnter, onStart]);

  if (!visible) return null;

  return (
    <div style={styles.backdrop}>
      <div style={{ ...styles.card, ...(readyFlash ? styles.cardReadyFlash : null) }}>
        <div style={styles.header}>
          <img
            src="/textures/logo/portfolio-thomas-256.webp"
            alt="Logo Portfolio Thomas"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            style={styles.logo}
            draggable={false}
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

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Chargement</div>

          <div style={styles.progressRow}>
            <div style={styles.progressText}>
              {canEnter ? "Prêt ✅" : `Chargement… ${Math.round(progress)}%`}
            </div>
            <div style={styles.progressMeta}>
              {total > 0 ? `${loaded}/${total}` : ""}
            </div>
          </div>

          <div style={styles.barOuter} aria-label="progress">
            <div
              style={{
                ...styles.barInner,
                width: `${clamp(canEnter ? 100 : p, 0, 100)}%`,
              }}
            />
          </div>

          <div style={styles.itemText}>
            {active && item ? `En cours : ${String(item).split("/").pop()}` : " "}
          </div>
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
            OK — Entrer
          </button>

          <div style={styles.note}>
            Astuce : sur mobile, passe en paysage pour une meilleure navigation.
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
    transition: "transform 220ms ease, box-shadow 220ms ease, border 220ms ease",
  },
  cardReadyFlash: {
    border: "1px solid rgba(255, 210, 0, 0.28)",
    boxShadow: "0 22px 80px rgba(0,0,0,0.55)",
    transform: "translateY(-1px)",
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

  progressRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    alignItems: "baseline",
  },
  progressText: { fontSize: 13, fontWeight: 700 },
  progressMeta: { fontSize: 12, opacity: 0.7 },

  barOuter: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  barInner: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(255,210,0,0.85), rgba(255,255,255,0.85))",
    transition: "width 120ms ease",
  },
  itemText: { marginTop: 8, fontSize: 12, opacity: 0.7, minHeight: 16 },

  footer: { marginTop: 14, display: "grid", gap: 10 },
  btn: {
    width: "100%",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.14)",
    cursor: "pointer",
    transition: "transform 140ms ease, filter 140ms ease",
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
};
