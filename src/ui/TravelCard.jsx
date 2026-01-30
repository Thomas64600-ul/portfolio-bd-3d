// src/ui/TravelCard.jsx
import { SECTIONS } from "../data/sections";

export default function TravelCard({ itemId, onClose }) {
  const travel = SECTIONS?.travels?.items?.[itemId];

  if (itemId == null || !travel) return null;

  const title = travel.title || "Voyage";
  const desc = travel.description || "";
  const mapZoom = travel.mapZoom || "";
  const photos = Array.isArray(travel.photos) ? travel.photos : [];

  return (
    <div className="travelCard" role="dialog" aria-modal="true">
      <div className="travelCard__top">
        <div>
          <div className="travelCard__title">{title}</div>
          {desc && <div className="travelCard__desc">{desc}</div>}
        </div>

        <button className="btn" onClick={onClose} aria-label="Fermer">
          ✖
        </button>
      </div>

      {mapZoom ? (
        <div className="travelCard__mapWrap">
          <img className="travelCard__map" src={mapZoom} alt={`Carte ${title}`} />
        </div>
      ) : (
        <div className="travelCard__empty">
          Ajoute une image <code>mapZoom</code> pour ce voyage.
        </div>
      )}

      <div className="travelCard__sectionTitle">Photos</div>

      {photos.length ? (
        <div className="travelCard__grid">
          {photos.map((src, i) => (
            <img key={i} className="travelCard__photo" src={src} alt={`${title} ${i + 1}`} />
          ))}
        </div>
      ) : (
        <div className="travelCard__empty">
          Ajoute des images dans <code>photos: []</code> (tu pourras les mettre plus tard).
        </div>
      )}
    </div>
  );
}