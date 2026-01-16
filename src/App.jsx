import { useEffect, useState } from "react";
import LibraryScene from "./three/LibraryScene";
import Overlay from "./ui/Overlay";

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const [openSectionId, setOpenSectionId] = useState(null);
  const [focus, setFocus] = useState({ active: false });

  const requestLock = () => {
    // pointer lock s’active au clic dans le canvas
    setControlsEnabled(true);
  };

  const releaseLock = () => {
    // simple UX : on désactive les controls => l’utilisateur peut cliquer l’UI
    setControlsEnabled(false);
    setIsLocked(false);
  };

  const closePanel = () => {
    setOpenSectionId(null);
    // retour "normal": on annule focus
    setFocus({ active: false });
    // réactiver FPS
    setControlsEnabled(true);
  };

  // ESC pour libérer / fermer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (openSectionId) closePanel();
        else releaseLock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSectionId]);

  return (
    <>
      <LibraryScene
        controlsEnabled={controlsEnabled}
        setIsLocked={setIsLocked}
        focus={focus}
        setFocus={setFocus}
        onOpenSection={(id) => setOpenSectionId(id)}
      />

      <Overlay
        isLocked={isLocked}
        onRequestLock={requestLock}
        onReleaseLock={releaseLock}
        openSectionId={openSectionId}
        onClosePanel={closePanel}
      />
    </>
  );
}
