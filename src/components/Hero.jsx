import { Link } from 'react-router-dom';
import { assetPath } from '../utils/siteUtils';

export default function Hero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  stats = [],
  backgroundImage = 'images/logo.png',
  compact = false
}) {
  return (
    <section className={`hero ${compact ? 'hero-compact' : ''}`}>
      <div className="hero-background" aria-hidden="true">
        <img src={assetPath(backgroundImage)} alt="" />
      </div>

      <div className="site-container hero-inner">
        <div className="hero-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          <p>{description}</p>

          {(primaryAction || secondaryAction) && (
            <div className="hero-actions">
              {primaryAction ? (
                <Link className="button button-primary" to={primaryAction.to}>
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link className="button button-secondary" to={secondaryAction.to}>
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        {stats.length > 0 ? (
          <div className="hero-stats">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                {stat.helper ? <small>{stat.helper}</small> : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
