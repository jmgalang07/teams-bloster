import { Link } from 'react-router-dom';
import { assetPath, formatDate, formatWeight } from '../utils/siteUtils';
import { CarpTypeBadge } from './Badge';

export default function CaptureCard({
  capture,
  member,
  water,
  bait,
  onImageClick,
  compact = false,
}) {
  const memberName = member?.name || 'Pescador desconocido';
  const waterName = water?.shortName || 'Escenario no disponible';
  const baitName = bait?.name || 'Cebo no disponible';
  const waterLink = water?.id ? `/charcas/${water.id}` : '/charcas';

  return (
    <article className={`info-card capture-card ${compact ? 'capture-card-compact' : ''}`}>
      <button
        className="capture-card-image"
        type="button"
        onClick={onImageClick ? () => onImageClick(capture) : undefined}
        aria-label={`Abrir imagen de ${memberName} en ${waterName}`}
        disabled={!onImageClick}
      >
        <img src={assetPath(capture.image)} alt={`${memberName} con una captura en ${waterName}`} />
      </button>

      <div className="capture-card-body">
        <div className="capture-topline">
          <CarpTypeBadge carpType={capture.carpType} />
          <span className="weight-pill">{formatWeight(capture.weightKg)}</span>
        </div>

        <h3>{memberName}</h3>
        <p>{capture.notes}</p>

        <dl className="capture-meta">
          <div>
            <dt>Escenario</dt>
            <dd>
              <Link to={waterLink}>{waterName}</Link>
            </dd>
          </div>
          <div>
            <dt>Cebo</dt>
            <dd>{baitName}</dd>
          </div>
          <div>
            <dt>Montaje</dt>
            <dd>{capture.rig}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{formatDate(capture.date)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
