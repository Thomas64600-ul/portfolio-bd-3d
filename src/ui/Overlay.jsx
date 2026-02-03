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

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function resetGlobalControls() {
  if (typeof window === "undefined") return;

  window.__UI_ACTIVE__ = false;
  window.__JOYSTICK_ACTIVE__ = false;
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

  onMobileForwardDown,
  onMobileForwardUp,
  onMobileBackDown,
  onMobileBackUp,
}) {
  const section = openSectionId ? SECTIONS[openSectionId] : null;
  const panelOpen = Boolean(openSectionId);

  const rowCounts = BOOK_LAYOUT.rowCounts;
  const [selectedRow, setSelectedRow] = useState(null);

  const [isPortraitLocal, setIsPortraitLocal] = useState(false);
  const isPortrait = typeof isPortraitProp === "boolean" ? isPortraitProp : isPortraitLocal;

  const [dismissRotateHint, setDismissRotateHint] = useState(false);
  const [isMapMode, setIsMapMode] = useState(false);



  useEffect(() => {
    setSelectedRow(null);
  }, [openSectionId]);

  useEffect(() => {
    setDismissRotateHint(false);
  }, [isMobile]);

 

  useEffect(() => {
    if (!isMobile) return;
    if (typeof window === "undefined") return;
    if (typeof isPortraitProp === "boolean") return;

    const compute = () => setIsPortraitLocal(window.innerHeight > window.innerWidth);

    compute();

    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [isMobile, isPortraitProp]);

  

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = () => {
      const map = !!window.__MAP_MODE__;
      setIsMapMode(map);

      
      if (map) resetGlobalControls();
    };

    tick();

    const id = window.setInterval(tick, 120);
    return () => window.clearInterval(id);
  }, []);



  useEffect(() => {
    
    if (panelOpen) {
      resetGlobalControls();
      onMobileForwardUp?.();
      onMobileBackUp?.();
    }
  }, [panelOpen, onMobileForwardUp, onMobileBackUp]);

 

  const handleRequestLock = useCallback(() => {
    onRequestLock?.();

    if (typeof document === "undefined") return;

    const canvas = document.querySelector("canvas");
    if (canvas?.requestPointerLock) canvas.requestPointerLock();
  }, [onRequestLock]);

  const handleCloseEverything = useCallback(() => {
    resetGlobalControls();

    onMobileForwardUp?.();
    onMobileBackUp?.();

    onReleaseLock?.();
    onClosePanel?.();
  }, [onClosePanel, onReleaseLock, onMobileForwardUp, onMobileBackUp]);

  const setMobileMove = useCallback(
    ({ forward, back }) => {
      const active = forward || back;

      setGlobalFlag("__UI_ACTIVE__", active);

      if (forward) onMobileForwardDown?.();
      else onMobileForwardUp?.();

      if (back) onMobileBackDown?.();
      else onMobileBackUp?.();
    },
    [onMobileForwardDown, onMobileForwardUp, onMobileBackDown, onMobileBackUp]
  );

  const stopMobileMove = useCallback(() => {
    resetGlobalControls();

    onMobileForwardUp?.();
    onMobileBackUp?.();
  }, [onMobileForwardUp, onMobileBackUp]);

  

  const showRotateHint =
    isMobile && isPortrait && !panelOpen && !dismissRotateHint && !isMapMode;



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

            <button className="btn" onClick={() => window.open("/cv/Thomas-DeTraversay-CV.pdf")}>
              📄 Voir le CV
            </button>

            <button className="btn" onClick={onClosePanel}>
              ✖ Fermer
            </button>
          </>
        ) : !isLocked ? (
          !isMobile ? (
            <button className="btn btn-lock" onClick={handleRequestLock}>
              🎮 Entrer
            </button>
          ) : (
            <button className="btn" disabled>
              📱 Mode mobile
            </button>
          )
        ) : (
          <button className="btn" onClick={onReleaseLock}>
            ⎋ Libérer souris
          </button>
        )}
      </div>

     

      {isMobile && !panelOpen && !isMapMode && (
        <MobileJoystick
          enabled
          onMove={({ y }) => {
            const forward = y < -0.18;
            const back = y > 0.18;

            setMobileMove({ forward, back });
          }}
          onEnd={stopMobileMove}
        />
      )}

     

      {isMobile && !panelOpen && isMapMode && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: `calc(14px + var(--safe-bottom))`,
            zIndex: 26,
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontWeight: 800 }}>🗺️ Mode carte</div>

          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Tape sur un pin pour ouvrir le détail.
          </div>

          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={() => {
              setGlobalFlag("__MAP_MODE__", false);
              resetGlobalControls();
            }}
          >
            Fermer
          </button>
        </div>
      )}

   

      {showRotateHint && (
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: `calc(160px + var(--safe-bottom))`,
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

    

      {!panelOpen && !isMapMode && (
        <div className="hint">
          {!isMobile ? (
            <div>WASD / Souris / Clic</div>
          ) : (
            <div>Joystick + Tap</div>
          )}
        </div>
      )}
    </div>
  );
}
