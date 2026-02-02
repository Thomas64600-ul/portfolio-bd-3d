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

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

  const isMobile = useMemo(() => detectMobile(), []);

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

    setGlobalFlag("__UI_ACTIVE__", false);
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
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  const requestLock = useCallback(() => {
    setControlsEnabled(true);

    if (typeof document === "undefined") return;
    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
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
  }, [stopMobileMove]);

  const closePanel = useCallback(() => {
    setOpenSectionId(null);
    cancelFocus();
    setControlsEnabled(true);

    stopMobileMove();
  }, [cancelFocus, stopMobileMove]);

  const handleOpenSection = useCallback(
    (id, itemId = null) => {
      setOpenSectionId(id);

      if (typeof document !== "undefined" && document.pointerLockElement) {
        try {
          document.exitPointerLock();
        } catch {
          // no-op
        }
      }
      setControlsEnabled(false);

      stopMobileMove();

      setFocus((f) => ({
        ...f,
        sectionId: id,
        itemId: itemId ?? f?.itemId ?? null,
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

      {openSectionId === "travels" && (
        <TravelCard itemId={focus?.itemId ?? null} onClose={closePanel} />
      )}
    </>
  );
}

