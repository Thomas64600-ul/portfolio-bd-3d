import { useEffect, useState, useCallback } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";
import TravelCard from "./ui/TravelCard";

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

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
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        onOpenSection={handleOpenSection}
      />

      <Overlay
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
