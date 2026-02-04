import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";
import TravelCard from "./ui/TravelCard";

function detectMobile() {
  if (typeof window === "undefined") return false;

  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const smallScreen = window.innerWidth < 768;

  return coarse || uaMobile || smallScreen;
}

function setGlobalFlag(key, value) {
  if (typeof window === "undefined") return;
  window[key] = !!value;
}

function detectPortrait() {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
}

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

  const isMobile = useMemo(() => detectMobile(), []);
  const [isPortrait, setIsPortrait] = useState(() => (isMobile ? detectPortrait() : false));

  useEffect(() => {
    if (!isMobile) {
      setIsPortrait(false);
      setGlobalFlag("__IS_PORTRAIT__", false);
      return;
    }

    const compute = () => {
      const portrait = detectPortrait();
      setIsPortrait(portrait);
      setGlobalFlag("__IS_PORTRAIT__", portrait);
    };

    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);

    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [isMobile]);

  const mobileForwardRef = useRef(false);
  const mobileBackRef = useRef(false);

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

    setGlobalFlag("__JOYSTICK_ACTIVE__", false);
    setGlobalFlag("__TOUCH_LOOKING__", false);
  }, []);

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
    if (typeof document === "undefined") return;

    const onChange = () => {
      setIsLocked(Boolean(document.pointerLockElement));
    };

    document.addEventListener("pointerlockchange", onChange);
    onChange();

    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  const requestLock = useCallback(() => {
    setControlsEnabled(true);

    if (typeof document === "undefined") return;
    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) {
      if (typeof canvas.requestPointerLock === "function") {
        canvas.requestPointerLock();
      }
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (typeof document === "undefined") return;

    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch {
        // no-op
      }
    }

    setControlsEnabled(false);
    stopMobileMove();

    
    setGlobalFlag("__UI_ACTIVE__", false);
  }, [stopMobileMove]);

  const closePanel = useCallback(() => {
    setOpenSectionId(null);
    cancelFocus();
    setControlsEnabled(true);
    stopMobileMove();

  
    setGlobalFlag("__UI_ACTIVE__", false);
  }, [cancelFocus, stopMobileMove]);

  const handleOpenSection = useCallback(
    (id, itemId = null) => {
      
      stopMobileMove();

      setOpenSectionId(id);

      if (typeof document !== "undefined" && document.pointerLockElement) {
        try {
          document.exitPointerLock();
        } catch {
          // no-op
        }
      }

      setGlobalFlag("__UI_ACTIVE__", true);

      setControlsEnabled(false);

      setFocus((f) => ({
        ...f,
        sectionId: id,
        itemId: itemId == null ? null : itemId,
      }));
    },
    [stopMobileMove]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;

      if (focus.active) {
        if (typeof document !== "undefined" && document.pointerLockElement) {
          try {
            document.exitPointerLock();
          } catch {
            // no-op
          }
        }
        setOpenSectionId(null);
        cancelFocus();
        setControlsEnabled(true);
        stopMobileMove();
        setGlobalFlag("__UI_ACTIVE__", false);
        return;
      }

      if (openSectionId) {
        closePanel();
        return;
      }

      releaseLock();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSectionId, closePanel, releaseLock, focus.active, cancelFocus, stopMobileMove]);

  return (
    <>
      <LibraryScene
        isMobile={isMobile}
        isPortrait={isPortrait}
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        onOpenSection={handleOpenSection}
        mobileForwardRef={mobileForwardRef}
        mobileBackRef={mobileBackRef}
      />

      <Overlay
        isMobile={isMobile}
        isPortrait={isPortrait}
        isLocked={isLocked}
        onRequestLock={requestLock}
        onReleaseLock={releaseLock}
        openSectionId={openSectionId}
        openItemId={focus?.itemId ?? null}
        onClosePanel={closePanel}
        onMobileForwardDown={() => (mobileForwardRef.current = true)}
        onMobileForwardUp={() => (mobileForwardRef.current = false)}
        onMobileBackDown={() => (mobileBackRef.current = true)}
        onMobileBackUp={() => (mobileBackRef.current = false)}
      />

      {openSectionId === "travels" && <TravelCard itemId={focus?.itemId ?? null} onClose={closePanel} />}
    </>
  );
}


