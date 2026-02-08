import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@react-three/drei";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function StartLoader({ onStart }) {
  const { active, progress, item, loaded, total } = useProgress();

  const canEnter = useMemo(() => {
    return Math.round(progress) >= 100 || (total > 0 && loaded >= total);
  }, [progress, loaded, total]);

  const [p, setP] = useState(0);
  useEffect(() => {
    const target = clamp(progress, 0, 100);

    if (Math.round(target) >= 100 || (total > 0 && loaded >= total)) {
      setP(100);
      return;
    }

    setP((prev) => {
      const next = prev + (target - prev) * 0.12;
      return Math.abs(next - target) < 0.2 ? target : next;
    });
  }, [progress, loaded, total]);

  const [readyFlash, setReadyFlash] = useState(false);
  useEffect(() => {
    if (!canEnter) return;
    setReadyFlash(true);
    const t = setTimeout(() => setReadyFlash(false), 650);
    return () => clearTimeout(t);
  }, [canEnter]);

  const isPortrait = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(orientation: portrait)")?.matches ?? false;
  }, []);

  const tips = useMemo(() => {
    return {
      desktop: [
        "Clique sur « Entrer » puis clique dans la scène pour activer la vue FPS.",
        "ZQSD : se déplacer • Souris : regarder • Échap : sortir du contrôle.",
        "Explore les bibliothèques, les cadres de diplômes, le panneau “À propos” et la carte du monde en cliquant dessus pour ouvrir leurs contenus.",
      ],
      mobileLandscape: [
        "Passe en paysage pour une meilleure expérience.",
        "Joystick : déplacement • Glisser à droite : caméra.",
        "Explore les bibliothèques, les cadres, le panneau “À propos” et la carte du monde en les touchant pour découvrir chaque section.",
      ],
      mobilePortrait: [
        "Mode portrait : interface réduite.",
        "Passe en paysage pour activer la navigation complète (recommandé).",
      ],
    };
  }, []);

  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const tipList = useMemo(() => {
    if (!isMobile) return tips.desktop;
    return isPortrait ? tips.mobilePortrait : tips.mobileLandscape;
  }, [isMobile, isPortrait, tips]);

  return (
    <div style={styles.backdrop}>
      <div style={{ ...styles.card, ...(readyFlash ? styles.cardReadyFlash : null) }}>
        <div style={styles.header}>
          <img
            src="/textures/logo/portfolio-thomas-256.webp"
            alt="Logo Portfolio Thomas"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            style={styles.logo}
            draggable={false}
          />
          <div style={styles.titleWrap}>
            <div style={styles.kicker}>Bienvenue sur le portfolio 3D de</div>
            <div style={styles.title}>Thomas</div>
            <div style={styles.sub}>
              Explore la bibliothèque, les diplômes, la carte des voyages et les murs
              thématiques.
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
            <div style={styles.progressMeta}>{total > 0 ? `${loaded}/${total}` : ""}</div>
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
            onClick={() => canEnter && onStart?.()}
            disabled={!canEnter}
            style={{
              ...styles.btn,
              ...(canEnter ? styles.btnOn : styles.btnOff),
              ...(canEnter ? styles.btnPulse : null),
            }}
          >
            OK, j’ai compris — Entrer
          </button>

          <div style={styles.note}>
            Astuce : si l’écran est trop sombre, attends la fin du chargement puis entre.
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
  btnPulse: {
    filter: "drop-shadow(0 10px 18px rgba(255,210,0,0.10))",
  },
  note: { fontSize: 12, opacity: 0.7, textAlign: "center" },
};
