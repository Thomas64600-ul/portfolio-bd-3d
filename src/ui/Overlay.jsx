// src/ui/Overlay.jsx
import { useMemo, useState, useEffect, useCallback } from "react";
import { SECTIONS, BOOK_LAYOUT } from "../data/sections";
import MobileJoystick from "./MobileJoystick";

function resolveRowAndIndex(itemId, rowCounts) {
  if (itemId == null || Number.isNaN(Number(itemId))) return null;

  let remaining = Number(itemId);
  for (let rowIndex = 0; rowIndex < rowCounts.length; rowIndex++) {
    const count = rowCounts[rowIndex];
    if (remaining < count) return { rowIndex, bookIndex: remaining };
    remaining -= count;
  }
  return null;
}

function RowButton({ idx, title, selected, onSelect }) {
  return (
    <button
      className="btn"
      style={{
        marginRight: 8,
        marginTop: 8,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)",
        background: selected ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)",
        color: "var(--text)",
        cursor: "pointer",
      }}
      onClick={() => onSelect(idx)}
    >
      {title || `Rangée ${idx + 1}`}
    </button>
  );
}

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

export default function Overlay({
  isMobile,
  isLocked,
  onRequestLock,
  onReleaseLock,
  openSectionId,
  openItemId = null,
  onClosePanel,

  onMobileForwardDown,
  onMobileForwardUp,
  onMobileBackDown,
  onMobileBackUp,
}) {
  const section = openSectionId ? SECTIONS[openSectionId] : null;

  const panelOpen = Boolean(openSectionId);

  const rowCounts = BOOK_LAYOUT.rowCounts;

  const [selectedRow, setSelectedRow] = useState(null);

  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissRotateHint, setDismissRotateHint] = useState(false);

  useEffect(() => {
    setSelectedRow(null);
  }, [openSectionId]);

  useEffect(() => {
    setDismissRotateHint(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === "undefined") return;

    const compute = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [isMobile]);

  useEffect(() => {
    if (openSectionId && !section) {
      console.warn("[Overlay] openSectionId inconnu (pas dans SECTIONS):", openSectionId);
    }
  }, [openSectionId, section]);

  const rowInfo = useMemo(() => {
    if (!section?.rows) return null;
    return resolveRowAndIndex(openItemId, rowCounts);
  }, [section, openItemId, rowCounts]);

  const activeRow = rowInfo ? section?.rows?.[rowInfo.rowIndex] : null;
  const activeItem = rowInfo ? activeRow?.items?.[rowInfo.bookIndex] : null;

  const hidePanelForSection =
    openSectionId === "diplomas" || openSectionId === "travels" || openSectionId === "about";

  const handleTakeBackControl = useCallback(() => {
    onReleaseLock?.();
    onClosePanel?.();
  }, [onReleaseLock, onClosePanel]);

  const CV_URL = "/cv/Thomas-DeTraversay-CV.pdf";

  const handleOpenCV = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(CV_URL, "_blank", "noopener,noreferrer");
  }, [CV_URL]);

  const handleDownloadCV = useCallback(() => {
    if (typeof document === "undefined") return;
    const a = document.createElement("a");
    a.href = CV_URL;
    a.download = "Thomas-DeTraversay-CV.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [CV_URL]);

  const handleRequestLock = useCallback(() => {
    onRequestLock?.();

    if (typeof document === "undefined") return;
    const canvas = document.querySelector("canvas");
    if (canvas?.requestPointerLock) canvas.requestPointerLock();
  }, [onRequestLock]);

  const showRotateHint = isMobile && isPortrait && !section && !dismissRotateHint;

  // ✅ évite la superposition en portrait : on remonte le bloc "hint"
  const hintBottom = useMemo(() => {
    if (!isMobile) return undefined; // desktop: inchangé
    if (!isPortrait) return 18; // mobile paysage: léger lift
    return showRotateHint ? 190 : 110; // portrait: plus haut (et encore + si rotate hint visible)
  }, [isMobile, isPortrait, showRotateHint]);

  const setMobileMove = useCallback(
    ({ forward, back }) => {
      setGlobalFlag("__UI_ACTIVE__", forward || back);

      if (forward) onMobileForwardDown?.();
      else onMobileForwardUp?.();

      if (back) onMobileBackDown?.();
      else onMobileBackUp?.();
    },
    [onMobileForwardDown, onMobileForwardUp, onMobileBackDown, onMobileBackUp]
  );

  const stopMobileMove = useCallback(() => {
    setGlobalFlag("__UI_ACTIVE__", false);
    onMobileForwardUp?.();
    onMobileBackUp?.();
  }, [onMobileForwardUp, onMobileBackUp]);

  return (
    <div className="hud">
      <div className="topbar">
        {panelOpen ? (
          <button className="btn" onClick={handleTakeBackControl}>
            ⎋ Quitter (reprendre le contrôle)
          </button>
        ) : !isLocked ? (
          !isMobile ? (
            <button className="btn btn-lock" onClick={handleRequestLock}>
              🎮 Entrer (clic pour contrôler)
            </button>
          ) : (
            <button className="btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
              📱 Mode mobile
            </button>
          )
        ) : (
          <button className="btn" onClick={onReleaseLock}>
            ⎋ Libérer la souris
          </button>
        )}

        {panelOpen && (
          <>
            <button className="btn" onClick={handleOpenCV}>
              📄 Voir le CV
            </button>
            <button className="btn" onClick={handleDownloadCV}>
              ⬇ Télécharger
            </button>
            <button className="btn" onClick={onClosePanel}>
              ✖ Fermer
            </button>
          </>
        )}
      </div>

      {section && !hidePanelForSection && (
        <div className="panel">
          <h2>{section.title}</h2>

          {section.description && <p style={{ whiteSpace: "pre-line" }}>{section.description}</p>}

          <div>
            {section.tags?.map((t) => (
              <span key={t} className="badge">
                {t}
              </span>
            ))}
          </div>

          {section.rows && openItemId != null && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>
                Livre sélectionné : <strong style={{ color: "var(--text)" }}>#{openItemId}</strong>
              </div>

              {rowInfo && activeRow ? (
                <>
                  <div
                    style={{
                      marginBottom: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.18)",
                    }}
                  >
                    <div style={{ color: "var(--text)", fontWeight: 700 }}>
                      {activeRow.title || `Rangée ${rowInfo.rowIndex + 1}`}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                      Index dans la rangée : {rowInfo.bookIndex}
                    </div>
                  </div>

                  {activeItem ? (
                    <div>{renderItemSmart(activeItem, rowInfo.bookIndex)}</div>
                  ) : (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 10,
                        border: "1px dashed rgba(255,255,255,0.25)",
                        background: "rgba(0,0,0,0.12)",
                        color: "var(--muted)",
                        fontSize: 13,
                      }}
                    >
                      Emplacement réservé (aucun contenu pour ce livre pour l’instant).
                    </div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px dashed rgba(255,255,255,0.25)",
                    background: "rgba(0,0,0,0.12)",
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  Livre hors plage (index non reconnu).
                </div>
              )}
            </div>
          )}

          {section.rows && openItemId == null && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 6 }}>
                Choisis une rangée (ou clique un livre pour un item précis).
              </div>

              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {section.rows.map((r, idx) => (
                  <RowButton
                    key={idx}
                    idx={idx}
                    title={r.title}
                    selected={selectedRow === idx}
                    onSelect={setSelectedRow}
                  />
                ))}
              </div>

              {selectedRow != null && section.rows[selectedRow] && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      marginBottom: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.18)",
                    }}
                  >
                    <div style={{ color: "var(--text)", fontWeight: 700 }}>
                      {section.rows[selectedRow].title || `Rangée ${selectedRow + 1}`}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                      Livres disponibles : {section.rows[selectedRow].items?.length || 0}
                    </div>
                  </div>

                  {section.rows[selectedRow].items?.length > 0 ? (
                    <div>
                      {section.rows[selectedRow].items.map((it, idx) => renderItemSmart(it, idx))}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 10,
                        border: "1px dashed rgba(255,255,255,0.25)",
                        background: "rgba(0,0,0,0.12)",
                        color: "var(--muted)",
                        fontSize: 13,
                      }}
                    >
                      Rangée vide pour l’instant.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!section.rows && section.items?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {section.items.map((it, idx) => renderItemSmart(it, idx))}
            </div>
          )}
        </div>
      )}

      {isMobile && !section && (
        <MobileJoystick
          enabled={true}
          onMove={({ y }) => {
            const forward = y < -0.18;
            const back = y > 0.18;
            setMobileMove({ forward, back });
          }}
          onEnd={() => {
            stopMobileMove();
          }}
        />
      )}

      {showRotateHint && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 14,
            zIndex: 25,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ color: "var(--text)", fontWeight: 800, marginBottom: 6 }}>
            📱 Meilleure expérience en paysage
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.35 }}>
            Tourne ton téléphone pour profiter d’un champ de vision plus large et d’une navigation plus confortable.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button
              className="btn"
              onClick={() => setDismissRotateHint(true)}
              style={{ padding: "10px 12px", borderRadius: 12 }}
            >
              Continuer quand même
            </button>
          </div>
        </div>
      )}

      <div className="hint" style={hintBottom != null ? { bottom: hintBottom } : undefined}>
        {!isMobile ? (
          <>
            <div>WASD / Flèches = se déplacer • Souris = regarder • Clic = interagir</div>
            <div>Astuce : clique un objet (livre, poster) pour zoom + panneau</div>
          </>
        ) : (
          <>
            <div>📱 Glisse pour regarder • Joystick = avancer/reculer • Tap = interagir</div>
            <div>Astuce : tap un objet (livre, poster) pour zoom + panneau</div>
          </>
        )}
      </div>
    </div>
  );

  function renderCareerItem(it, idx) {
    return (
      <div
        key={`${it.name}-${idx}`}
        style={{
          marginBottom: 12,
          padding: 10,
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 10,
          background: "rgba(0,0,0,0.20)",
        }}
      >
        <div style={{ color: "var(--text)", fontWeight: 700 }}>{it.name}</div>

        {(it.company || it.location || it.period) && (
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
            {it.company ? <span>{it.company}</span> : null}
            {it.location ? (
              <span>
                {it.company ? " • " : ""}
                {it.location}
              </span>
            ) : null}
            {it.period ? (
              <span>
                {(it.company || it.location) ? " • " : ""}
                {it.period}
              </span>
            ) : null}
          </div>
        )}

        {it.desc && <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{it.desc}</div>}

        {Array.isArray(it.bullets) && it.bullets.length > 0 && (
          <ul style={{ margin: "8px 0 0 16px", color: "var(--text)", fontSize: 13 }}>
            {it.bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: 4, opacity: 0.9 }}>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function renderStandardItem(it, idx) {
    return (
      <div key={`${it.name}-${idx}`} style={{ marginBottom: 10 }}>
        <div style={{ color: "var(--text)", fontWeight: 600 }}>
          {it.href ? (
            <a className="link" href={it.href} target="_blank" rel="noreferrer">
              {it.name}
            </a>
          ) : (
            it.name
          )}
        </div>

        {it.desc && <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.desc}</div>}

        {it.year && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{it.year}</div>}
      </div>
    );
  }

  function renderItemSmart(it, idx) {
    const isCareerItem =
      Boolean(it.company) ||
      Boolean(it.period) ||
      Boolean(it.location) ||
      Array.isArray(it.bullets);

    return isCareerItem ? renderCareerItem(it, idx) : renderStandardItem(it, idx);
  }
}

