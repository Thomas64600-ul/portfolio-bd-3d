import { SECTIONS } from "../data/sections";

export default function Overlay({
  isLocked,
  onRequestLock,
  onReleaseLock,
  openSectionId,
  onClosePanel,
}) {
  const section = openSectionId ? SECTIONS[openSectionId] : null;

  return (
    <div className="hud">
      <div className="topbar">
        {!isLocked ? (
          <button className="btn" onClick={onRequestLock}>
            🎮 Entrer (clic pour contrôler)
          </button>
        ) : (
          <button className="btn" onClick={onReleaseLock}>
            ⎋ Libérer la souris
          </button>
        )}

        {section && (
          <button className="btn" onClick={onClosePanel}>
            ✖ Fermer
          </button>
        )}
      </div>

      {section && (
        <div className="panel">
          <h2>{section.title}</h2>
          <p>{section.description}</p>

          <div>
            {section.tags?.map((t) => (
              <span key={t} className="badge">{t}</span>
            ))}
          </div>

          {section.items?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {section.items.map((it) => (
                <div key={it.name} style={{ marginBottom: 10 }}>
                  <div style={{ color: "var(--text)", fontWeight: 600 }}>
                    {it.href ? (
                      <a className="link" href={it.href} target="_blank" rel="noreferrer">
                        {it.name}
                      </a>
                    ) : (
                      it.name
                    )}
                  </div>
                  {it.desc && <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.desc}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="hint">
        <div>WASD / Flèches = se déplacer • Souris = regarder • Clic = interagir</div>
        <div>Astuce : clique un objet (livre, poster) pour zoom + panneau</div>
      </div>
    </div>
  );
}
