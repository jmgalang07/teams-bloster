import { assetPath } from '../utils/siteUtils';

export default function BrandCard({ brand }) {
  const hasLink = Boolean(brand.url);
  const MediaTag = hasLink ? 'a' : 'div';
  const spotlightLabel = brand.knownFor ? 'Conocida por' : 'Especialidad';
  const spotlightValue = brand.knownFor || brand.specialty || 'Pendiente de completar';
  const featuredProducts = Array.isArray(brand.featuredProducts)
    ? brand.featuredProducts.filter(Boolean)
    : [];

  return (
    <article className="info-card brand-card">
      <MediaTag
        className={`brand-logo-wrap ${hasLink ? 'brand-logo-wrap-link' : ''}`}
        href={hasLink ? brand.url : undefined}
        target={hasLink ? '_blank' : undefined}
        rel={hasLink ? 'noreferrer' : undefined}
      >
        <img src={assetPath(brand.image)} alt={brand.name} />
      </MediaTag>

      <div className="brand-card-body">
        <span className="card-kicker">{brand.specialty || 'Marca destacada'}</span>
        <h3>
          {hasLink ? (
            <a href={brand.url} target="_blank" rel="noreferrer" className="brand-card-link">
              {brand.name}
            </a>
          ) : (
            brand.name
          )}
        </h3>
        <p>{brand.description}</p>

        <dl className="brand-meta">
          <div>
            <dt>{spotlightLabel}</dt>
            <dd>{spotlightValue}</dd>
          </div>
          <div>
            <dt>Productos destacados</dt>
            <dd>{featuredProducts.length ? featuredProducts.join(' · ') : 'Pendiente de completar'}</dd>
          </div>
        </dl>

        {hasLink ? (
          <div className="brand-card-actions">
            <a
              href={brand.url}
              target="_blank"
              rel="noreferrer"
              className="button button-secondary button-small"
            >
              Ir a la pagina web
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}
