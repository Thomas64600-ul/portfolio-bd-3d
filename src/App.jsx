import { useEffect, useState, useCallback } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";
import TravelCard from "./ui/TravelCard"; // ✅ AJOUT

export default function App() {
  const [isLocked, setIsLocked] = useState(false);

  // ✅ Autorisation globale FPS (le focus gère le reste)
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

  // ✅ helper: annuler le focus (important pour ne pas rester bloqué devant la carte)
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

    // ✅ Bonus UX : lock direct depuis le bouton (gestuel utilisateur → autorisé)
    const canvas = document.querySelector("canvas");
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
    }
  }, []);

  const releaseLock = useCallback(() => {
    // ✅ MODE UI : on sort du pointer lock + on désactive le FPS
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setControlsEnabled(false);
  }, []);

  const closePanel = useCallback(() => {
    setOpenSectionId(null);

    // ✅ sortir du focus (retour à la liberté caméra)
    cancelFocus();

    // ✅ on repasse en FPS autorisé (l'utilisateur relock quand il veut)
    setControlsEnabled(true);
  }, [cancelFocus]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;

      // ✅ SI on est en focus (ex: carte/pin cliqué) → on annule le focus d’abord
      if (focus.active) {
        if (document.pointerLockElement) document.exitPointerLock();
        setOpenSectionId(null);
        cancelFocus();
        setControlsEnabled(true);
        return;
      }

      // sinon logique normale
      if (openSectionId) {
        closePanel();
      } else {
        releaseLock();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSectionId, closePanel, releaseLock, focus.active, cancelFocus]);

  return (
    <>
      <LibraryScene
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        // ✅ IMPORTANT : on récupère aussi itemId (pins, livres, etc.)
        onOpenSection={(id, itemId = null) => {
          // 🧠 ouverture panneau
          setOpenSectionId(id);

          // ✅ UI mode : souris libre + pas de FPS pendant lecture (photos/liens)
          if (document.pointerLockElement) document.exitPointerLock();
          setControlsEnabled(false);

          // ✅ on stocke l'itemId (utile pour travels/pins, livres, etc.)
          setFocus((f) => ({
            ...f,
            sectionId: id,
            itemId: itemId ?? f?.itemId ?? null,
          }));
        }}
      />

      <Overlay
        isLocked={isLocked}
        onRequestLock={requestLock}
        onReleaseLock={releaseLock}
        openSectionId={openSectionId}
        openItemId={focus?.itemId ?? null}
        onClosePanel={closePanel}
      />

      {/* ✅ NOUVELLE UX VOYAGES : card dédiée */}
      {openSectionId === "travels" && (
        <TravelCard itemId={focus?.itemId ?? null} onClose={closePanel} />
      )}
    </>
  );
}