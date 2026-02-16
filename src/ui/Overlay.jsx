import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SECTIONS } from "../data/sections";
import MobileJoystick from "./MobileJoystick";

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function resetGlobalControls() {
  if (typeof window === "undefined") return;
  window.__UI_ACTIVE__ = false;
  window.__JOYSTICK_ACTIVE__ = false;
}

function openCV() {
  if (typeof window === "undefined") return;
  window.open("/cv/Thomas-DeTraversay-CV.pdf", "_blank", "noopener,noreferrer");
}

export default function Overlay({
  isMobile,
  isPortrait: isPortraitProp,
  isLocked,
  onRequestLock,
  onReleaseLock,
  openSectionId,
  openItemId = null,
  onClosePanel,
  anyOpen = false,
  mobileForwardRef,
  mobileBackRef,
  mobileStrafeRef,
}) {
  const section = openSectionId ? SECTIONS[openSectionId] : null;
  const panelOpen = Boolean(openSectionId);

  const [isPortraitLocal, setIsPortraitLocal] = useState(false);
  const isPortrait =
    typeof isPortraitProp === "boolean" ? isPortraitProp : isPortraitLocal;

  const [dismissRotateHint, setDismissRotateHint] = useState(false);

  const [isMapMode, setIsMapMode] = useState(false);
  const prevMapRef = useRef(false);

  const forwardFallback = useRef(false);
  const backFallback = useRef(false);
  const strafeFallback = useRef(0);

  const forwardRef = mobileForwardRef ?? forwardFallback;
  const backRef = mobileBackRef ?? backFallback;
  const strafeRef = mobileStrafeRef ?? strafeFallback;

  useEffect(() => setDismissRotateHint(false), [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === "undefined") return;
    if (typeof isPortraitProp === "boolean") return;

    const compute = () =>
      setIsPortraitLocal(window.innerHeight > window.innerWidth);
    compute();

    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [isMobile, isPortraitProp]);

  const resetMoveRefs = useCallback(() => {
    forwardRef.current = false;
    backRef.current = false;
    strafeRef.current = 0;
  }, [forwardRef, backRef, strafeRef]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = () => {
      const map = !!window.__MAP_MODE__;
      setIsMapMode(map);

      if (map && !prevMapRef.current) {
        resetGlobalControls();
        resetMoveRefs();
      }

      prevMapRef.current = map;
    };

    tick();
    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, [resetMoveRefs]);

  useEffect(() => {
    if (!anyOpen) return;
    resetGlobalControls();
    resetMoveRefs();
  }, [anyOpen, resetMoveRefs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    const apply = () => {
      const vv = window.visualViewport;
      const h = vv?.height ?? window.innerHeight;
      root.style.setProperty("--vvh", `${h}px`);
    };

    apply();

    const vv = window.visualViewport;

    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);

    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
    };
  }, []);

  const handleRequestLock = useCallback(() => {
    onRequestLock?.();
    if (typeof document === "undefined") return;
    const canvas = document.querySelector("canvas");
    if (canvas?.requestPointerLock) canvas.requestPointerLock();
  }, [onRequestLock]);

  const handleCloseEverything = useCallback(() => {
    resetGlobalControls();
    resetMoveRefs();
    onReleaseLock?.();
    onClosePanel?.();
  }, [onClosePanel, onReleaseLock, resetMoveRefs]);

  const setMobileMove = useCallback(
    ({ x = 0, y = 0 }) => {
      const dx = Math.abs(x) < 0.18 ? 0 : x;
      const dy = Math.abs(y) < 0.18 ? 0 : y;

      const forward = dy < 0;
      const back = dy > 0;

      const active = dx !== 0 || dy !== 0;

      setGlobalFlag("__UI_ACTIVE__", active);
      setGlobalFlag("__JOYSTICK_ACTIVE__", active);

      forwardRef.current = forward;
      backRef.current = back;
      strafeRef.current = dx;
    },
    [forwardRef, backRef, strafeRef]
  );

  const stopMobileMove = useCallback(() => {
    resetGlobalControls();
    resetMoveRefs();
  }, [resetMoveRefs]);

  const showRotateHint =
    isMobile && isPortrait && !anyOpen && !dismissRotateHint;

  const panelContent = useMemo(() => {
    if (!section) return null;

    const title = section.title ?? openSectionId;
    const description = section.description ?? "";
    const tags = Array.isArray(section.tags) ? section.tags : [];
    const items = Array.isArray(section.items) ? section.items : [];

    const isAbout = openSectionId === "about";
    const isDiplomas = openSectionId === "diplomas";
    const hasActiveItem =
      openItemId !== null &&
      openItemId !== undefined &&
      !Number.isNaN(Number(openItemId));
    const activeIdx = hasActiveItem ? Number(openItemId) : null;

    if (isAbout) {
      return (
        <>
         
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>

            {tags.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      opacity: 0.9,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: 14,
              overflow: "auto",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 13,
                opacity: 0.88,
                lineHeight: 1.55,
                whiteSpace: "pre-line",
              }}
            >
              {description || " "}
            </div>

            <div>
              <button
                className="btn"
                onClick={openCV}
                style={{ width: "fit-content" }}
              >
                📄 Voir le CV
              </button>
            </div>
          </div>
        </>
      );
    }

    if (isDiplomas && activeIdx !== null) {
      const it = items[activeIdx];
      const img = it?.image || null;

      return (
        <>
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>

            {tags.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      opacity: 0.9,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: 14, overflow: "auto", flex: 1, minHeight: 0 }}>
            <div style={{ display: "grid", gap: 12 }}>
              {img && (
                <div
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <img
                    src={img}
                    alt={it?.name || it?.title || `Diplôme ${activeIdx + 1}`}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      maxHeight: isMobile ? (isPortrait ? 360 : 240) : 420,
                      objectFit: "contain",
                      background: "rgba(0,0,0,0.25)",
                    }}
                    loading="lazy"
                  />
                </div>
              )}

              <div
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  {it?.name || it?.title || `Diplôme ${activeIdx + 1}`}
                </div>

                {(it?.year || it?.period || it?.location) && (
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                    {[it?.year, it?.period, it?.location]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                )}

                {it?.desc && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      opacity: 0.88,
                      lineHeight: 1.45,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {it.desc}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      );
    }

    if (Array.isArray(section.rows)) {
      return (
        <>
          <div
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>

            {tags.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      opacity: 0.9,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {description && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  opacity: 0.85,
                  lineHeight: 1.45,
                  whiteSpace: "pre-line",
                }}
              >
                {description}
              </div>
            )}
          </div>

          <div style={{ padding: 14, overflow: "auto", flex: 1, minHeight: 0 }}>
            <div style={{ display: "grid", gap: 14 }}>
              {section.rows.map((row, rIdx) => (
                <div
                  key={row.title ?? rIdx}
                  style={{ display: "grid", gap: 10 }}
                >
                  <div style={{ fontWeight: 800, opacity: 0.92 }}>
                    {row.title ?? `Rangée ${rIdx + 1}`}
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {(row.items ?? []).map((it, iIdx) => (
                      <div
                        key={it.name ?? `${rIdx}-${iIdx}`}
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.03)",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>
                          {it.name ?? `Item ${iIdx + 1}`}
                        </div>

                        {it.desc && (
                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 13,
                              opacity: 0.85,
                              lineHeight: 1.4,
                            }}
                          >
                            {it.desc}
                          </div>
                        )}

                        {(it.href || it.github) && (
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            {it.href && (
                              <a
                                className="btn"
                                href={it.href}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: "none" }}
                              >
                                🔗 Voir le site
                              </a>
                            )}
                            {it.github && (
                              <a
                                className="btn"
                                href={it.github}
                                target="_blank"
                                rel="noreferrer"
                                style={{ textDecoration: "none" }}
                              >
                                ⭐ GitHub
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>

          {tags.length > 0 && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.03)",
                    opacity: 0.9,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {description && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                opacity: 0.85,
                lineHeight: 1.45,
                whiteSpace: "pre-line",
              }}
            >
              {description}
            </div>
          )}
        </div>

        <div style={{ padding: 14, overflow: "auto", flex: 1, minHeight: 0 }}>
          {items.length === 0 ? (
            <div style={{ opacity: 0.85, fontSize: 14 }}>
              Aucun élément pour cette section.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((it, idx) => {
                const isActive = Number(openItemId) === idx;
                const title2 =
                  it.title ??
                  it.name ??
                  `${
                    it.company
                      ? `${it.name} — ${it.company}`
                      : `Item ${idx + 1}`
                  }`;
                const desc2 = it.description ?? it.desc ?? "";

                return (
                  <div
                    key={`${title2}-${idx}`}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: isActive
                        ? "1px solid rgba(255,255,255,0.35)"
                        : "1px solid rgba(255,255,255,0.12)",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{title2}</div>

                    {(it.year || it.period || it.location) && (
                      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                        {[it.year, it.period, it.location]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>
                    )}

                    {desc2 && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 13,
                          opacity: 0.85,
                          lineHeight: 1.4,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {desc2}
                      </div>
                    )}

                    {Array.isArray(it.bullets) && it.bullets.length > 0 && (
                      <ul
                        style={{
                          marginTop: 10,
                          paddingLeft: 18,
                          opacity: 0.85,
                        }}
                      >
                        {it.bullets.map((b, i) => (
                          <li key={i} style={{ marginBottom: 4, fontSize: 13 }}>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }, [section, openSectionId, openItemId, isMobile, isPortrait]);

  const showCVInTopbar = !panelOpen && !anyOpen;

  return (
    <div
      className="hud"
      data-rotatehint={showRotateHint ? "1" : "0"}
      data-panelopen={panelOpen ? "1" : "0"}
    >
      <div className="topbar">
        {panelOpen ? (
          <>
            <button className="btn" onClick={handleCloseEverything}>
              ⎋ Quitter
            </button>
            <button className="btn" onClick={onClosePanel}>
              ✖ Fermer
            </button>
          </>
        ) : anyOpen ? (
          <>
            <button className="btn" onClick={onClosePanel}>
              ✖ Fermer
            </button>
          </>
        ) : !isLocked ? (
          !isMobile ? (
            <>
              {showCVInTopbar && (
                <button className="btn" onClick={openCV}>
                  📄 Voir le CV
                </button>
              )}
              <button className="btn btn-lock" onClick={handleRequestLock}>
                🎮 Entrer
              </button>
            </>
          ) : (
            <>
              {showCVInTopbar && (
                <button className="btn" onClick={openCV}>
                  📄 Voir le CV
                </button>
              )}
              <button className="btn" disabled>
                📱 Mode mobile
              </button>
            </>
          )
        ) : (
          <>
            {showCVInTopbar && (
              <button className="btn" onClick={openCV}>
                📄 Voir le CV
              </button>
            )}
            <button className="btn" onClick={onReleaseLock}>
              ⎋ Libérer souris
            </button>
          </>
        )}
      </div>

      {panelOpen && section && (
        <div
          className="panel"
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: `calc(56px + var(--safe-top))`,
            bottom: `calc(14px + var(--safe-bottom))`,
            zIndex: 30,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(10, 10, 14, 0.88)",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {panelContent}
        </div>
      )}

      {isMobile && !anyOpen && !isMapMode && (
        <MobileJoystick
          enabled
          onMove={({ x, y }) => setMobileMove({ x, y })}
          onEnd={stopMobileMove}
        />
      )}

      {showRotateHint && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: `calc(14px + var(--safe-bottom) + var(--joy-safe))`,
            zIndex: 25,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ fontWeight: 800 }}>📱 Passe en paysage</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Pour une meilleure navigation.
          </div>

          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={() => setDismissRotateHint(true)}
          >
            Continuer
          </button>
        </div>
      )}

      {!anyOpen && (
        <div className="hint">
          {!isMobile ? <div>WASD / Souris / Clic</div> : <div>Joystick + Tap</div>}
        </div>
      )}
    </div>
  );
}
