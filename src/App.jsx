import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";
import TravelCard from "./ui/TravelCard";

function detectMobile() {
  if (typeof window === "undefined") return false;

  // 1) "pointer: coarse" = tactile (souvent mobile/tablette)
  const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;

  // 2) userAgent (fallback)
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  // 3) largeur (fallback)
  const smallScreen = window.innerWidth < 768;

  return coarse || uaMobile || smallScreen;
}

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

  // ✅ Phase 1: détection mobile (stable au montage)
  const isMobile = useMemo(() => detectMobile(), []);

  // ✅ PHASE 4: refs de déplacement mobile (pilotées par Overlay)
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

  const cancelFocus = useCallback(() => {
    setFocus((f) => ({
      ...f,
      active: false,
      opened: false,
      sectionId: null,
      itemId: null,
    }));
  }, []);

  const requestLock = useCallback(() => {
    setControlsEnabled(true);

    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
    }
  }, []);

  const releaseLock = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    setControlsEnabled(false);
  }, []);

  const closePanel = useCallback(() => {
    setOpenSectionId(null);
    cancelFocus();
    setControlsEnabled(true);

    // ✅ sécurité: stop mouvement mobile quand on ferme un panel
    mobileForwardRef.current = false;
    mobileBackRef.current = false;
  }, [cancelFocus]);

  const handleOpenSection = useCallback((id, itemId = null) => {
    setOpenSectionId(id);

    if (document.pointerLockElement) document.exitPointerLock();
    setControlsEnabled(false);

    // ✅ stop mouvement mobile quand on ouvre un panel
    mobileForwardRef.current = false;
    mobileBackRef.current = false;

    setFocus((f) => ({
      ...f,
      sectionId: id,
      itemId: itemId ?? f?.itemId ?? null,
    }));
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;

      if (focus.active) {
        if (document.pointerLockElement) document.exitPointerLock();
        setOpenSectionId(null);
        cancelFocus();
        setControlsEnabled(true);

        mobileForwardRef.current = false;
        mobileBackRef.current = false;
        return;
      }

      if (openSectionId) closePanel();
      else releaseLock();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSectionId, closePanel, releaseLock, focus.active, cancelFocus]);

  return (
    <>
      <LibraryScene
        isMobile={isMobile}
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        onOpenSection={handleOpenSection}
        // ✅ PHASE 4: passage des refs au controller mobile
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
        // ✅ PHASE 4: callbacks boutons mobile
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
