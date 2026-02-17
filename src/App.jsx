import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";
import TravelCard from "./ui/TravelCard";
import StartLoader from "./ui/StartLoader";

function detectMobile() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const ua = navigator.userAgent || "";
  const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return coarse || uaMobile || window.innerWidth < 768;
}

function detectPortrait() {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

const OVERLAY_SECTIONS = ["projects", "stack", "career", "about", "diplomas"];

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

  const [isMobile, setIsMobile] = useState(() => detectMobile());
  const [isPortrait, setIsPortrait] = useState(() =>
    detectMobile() ? detectPortrait() : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const setVVH = () => {
     
      const h = window.visualViewport?.height ?? window.innerHeight ?? 0;
      if (!h) return;

      const px = Math.round(h);

      root.style.setProperty("--vvh", `${px}px`);
    };

    setVVH();

    window.addEventListener("resize", setVVH);
    window.addEventListener("orientationchange", setVVH);

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", setVVH);
      vv.addEventListener("scroll", setVVH);
    }

    return () => {
      window.removeEventListener("resize", setVVH);
      window.removeEventListener("orientationchange", setVVH);
      if (vv) {
        vv.removeEventListener("resize", setVVH);
        vv.removeEventListener("scroll", setVVH);
      }
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const m = detectMobile();
      setIsMobile(m);

      if (!m) {
        setIsPortrait(false);
        setGlobalFlag("__IS_PORTRAIT__", false);
      } else {
        const p = detectPortrait();
        setIsPortrait(p);
        setGlobalFlag("__IS_PORTRAIT__", p);
      }
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const mobileForwardRef = useRef(false);
  const mobileBackRef = useRef(false);
  const mobileStrafeRef = useRef(0);

  const [focus, setFocus] = useState({
    active: false,
    opened: false,
    sectionId: null,
    itemId: null,
    pos: [0, 1.6, 4],
    look: [0, 1.6, 0],
  });

  const stopMobileMove = useCallback(() => {
    mobileForwardRef.current = false;
    mobileBackRef.current = false;
    mobileStrafeRef.current = 0;

    setGlobalFlag("__TOUCH_LOOKING__", false);
    setGlobalFlag("__JOYSTICK_ACTIVE__", false);

    if (typeof window !== "undefined") {
      window.__JOY_X__ = 0;
      window.__JOY_Y__ = 0;
    }
  }, []);

  const resetUI = useCallback(() => {
    setGlobalFlag("__UI_ACTIVE__", false);
    stopMobileMove();
  }, [stopMobileMove]);

  const cancelFocus = useCallback(() => {
    setFocus((f) => ({
      ...f,
      active: false,
      opened: false,
      sectionId: null,
      itemId: null,
    }));
  }, []);

  useEffect(() => {
    const onChange = () => setIsLocked(Boolean(document.pointerLockElement));
    document.addEventListener("pointerlockchange", onChange);
    onChange();
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  const requestLock = useCallback(() => {
    if (!hasStarted) return;
    setControlsEnabled(true);
    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) canvas.requestPointerLock?.();
  }, [hasStarted]);

  const releaseLock = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock?.();
    setControlsEnabled(false);
    resetUI();
  }, [resetUI]);

  const closePanel = useCallback(() => {
    setOpenSectionId(null);
    cancelFocus();
    setControlsEnabled(true);
    resetUI();
  }, [cancelFocus, resetUI]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;

      if (focus?.active || openSectionId) {
        e.preventDefault?.();
        closePanel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focus?.active, openSectionId, closePanel]);

  const closeTravelCard = useCallback(() => {
    setFocus((f) => ({ ...f, itemId: null }));
  }, []);

  const handleOpenSection = useCallback(
    (id, itemId = null) => {
      resetUI();
      setOpenSectionId(id);
      setControlsEnabled(false);

      if (document.pointerLockElement) document.exitPointerLock?.();

      setGlobalFlag("__UI_ACTIVE__", true);

      setFocus((f) => ({ ...f, sectionId: id, itemId: itemId ?? null }));
    },
    [resetUI]
  );

  useEffect(() => {
    setGlobalFlag("__MAP_MODE__", hasStarted && openSectionId === "travels");
  }, [openSectionId, hasStarted]);

  const overlaySectionId = useMemo(() => {
    if (openSectionId === "travels") return null;
    return OVERLAY_SECTIONS.includes(openSectionId) ? openSectionId : null;
  }, [openSectionId]);

  const showTravelTopbar = openSectionId === "travels";
  const anyOpen = Boolean(openSectionId) || Boolean(focus?.active);

  return (
    <>
      {hasStarted && (
        <>
          <LibraryScene
            paused={false}
            isMobile={isMobile}
            isPortrait={isPortrait}
            controlsEnabled={controlsEnabled}
            setIsLocked={setIsLocked}
            focus={focus}
            setFocus={setFocus}
            onOpenSection={handleOpenSection}
            mobileForwardRef={mobileForwardRef}
            mobileBackRef={mobileBackRef}
            mobileStrafeRef={mobileStrafeRef}
          />

          <Overlay
            isMobile={isMobile}
            isPortrait={isPortrait}
            isLocked={isLocked}
            onRequestLock={requestLock}
            onReleaseLock={releaseLock}
            openSectionId={overlaySectionId}
            openItemId={focus?.itemId ?? null}
            onClosePanel={closePanel}
            anyOpen={anyOpen}
            mobileForwardRef={mobileForwardRef}
            mobileBackRef={mobileBackRef}
            mobileStrafeRef={mobileStrafeRef}
          />

          {showTravelTopbar && (
            <div className="hud" style={{ pointerEvents: "none" }}>
              <div className="topbar" style={{ pointerEvents: "auto" }}>
                <button className="btn" onClick={closePanel}>
                  ⎋ Quitter la carte
                </button>
                <button className="btn" onClick={closePanel}>
                  ✖ Fermer
                </button>
              </div>
            </div>
          )}

          {openSectionId === "travels" && (
            <TravelCard
              itemId={focus?.itemId ?? null}
              onClose={closeTravelCard}
            />
          )}
        </>
      )}

      {!hasStarted && (
        <StartLoader
          onStart={() => {
            setOpenSectionId(null);
            setControlsEnabled(true);
            setGlobalFlag("__UI_ACTIVE__", false);
            setGlobalFlag("__MAP_MODE__", false);
            setHasStarted(true);
          }}
        />
      )}
    </>
  );
}

