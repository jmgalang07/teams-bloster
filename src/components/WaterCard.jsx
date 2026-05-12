import { Link } from 'react-router-dom';
import { assetPath, formatWeight } from '../utils/siteUtils';

export default function WaterCard({ water, catchesInWater = [] }) {
  const bestWeight =
    catchesInWater.length > 0
      ? Math.max(...catchesInWater.map((capture) => capture.weightKg))
      : 0;

  return (
    <article className="info-card water-card">
      <div className="water-card-image">
        <img src={assetPath(water.image)} alt={water.name} />
      </div>

      <div className="water-card-body">
        <div className="card-header-inline">
          <span className="card-kicker">
            {water.type} · {water.province}
          </span>
          <span className="micro-stat">{catchesInWater.length} capturas</span>
        </div>

        <h3>{water.shortName}</h3>
        <p>{water.description}</p>

        <div className="chip-row">
          {water.tags.map((tag) => (
            <span className="chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mini-metrics">
          <div>
            <span>Mejor peso</span>
            <strong>{bestWeight ? formatWeight(bestWeight) : '--'}</strong>
          </div>
          <div>
            <span>Conocida por</span>
            <strong>{water.knownFor}</strong>
          </div>
        </div>

        <div className="card-actions">
          <Link className="button button-secondary button-small" to={`/charcas/${water.id}`}>
            Ver ficha
          </Link>
          {water.website ? (
            <a
              className="button button-secondary button-small"
              href={water.website}
              target="_blank"
              rel="noreferrer"
            >
              Ver web
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
