import { useEffect, useState, useCallback, useMemo } from "react";
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
  }, [cancelFocus]);

  const handleOpenSection = useCallback((id, itemId = null) => {
    setOpenSectionId(id);

    if (document.pointerLockElement) document.exitPointerLock();
    setControlsEnabled(false);

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
        isMobile={isMobile} // ✅ Phase 1 (préparation)
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        onOpenSection={handleOpenSection}
      />

      <Overlay
        isMobile={isMobile} // ✅ Phase 1 (préparation)
        isLocked={isLocked}
        onRequestLock={requestLock}
        onReleaseLock={releaseLock}
        openSectionId={openSectionId}
        openItemId={focus?.itemId ?? null}
        onClosePanel={closePanel}
      />

      {openSectionId === "travels" && (
        <TravelCard itemId={focus?.itemId ?? null} onClose={closePanel} />
      )}
    </>
  );
}
