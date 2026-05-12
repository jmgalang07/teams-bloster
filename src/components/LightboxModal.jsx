import { useEffect } from 'react';
import { assetPath, formatDate, formatWeight } from '../utils/siteUtils';
import { CarpTypeBadge } from './Badge';

export default function ({ capture, member, water, bait, onClose }) {
  useEffect(() => {
    if (!capture) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [capture, onClose]);

  if (!capture) {
    return null;
  }

  return (
    <div className="lightbox" role="dialog" aria-modal="true">
      <button className="lightbox-backdrop" type="button" aria-label="Cerrar" onClick={onClose} />
      <div className="lightbox-panel">
        <button className="lightbox-close" type="button" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <div className="lightbox-image">
          <img src={assetPath(capture.image)} alt={`${member.name} con una captura en ${water.shortName}`} />
        </div>

        <div className="lightbox-content">
          <div className="capture-topline">
            <CarpTypeBadge carpType={capture.carpType} />
            <span className="weight-pill">{formatWeight(capture.weightKg)}</span>
          </div>

          <h3>
            {member.name} · {water.shortName}
          </h3>
          <p>{capture.notes}</p>

          <dl className="capture-meta">
            <div>
              <dt>Cebo</dt>
              <dd>{bait.name}</dd>
            </div>
            <div>
              <dt>Montaje</dt>
              <dd>{capture.rig}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(capture.date)}</dd>
            </div>
            <div>
              <dt>Escenario</dt>
              <dd>{water.name}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
