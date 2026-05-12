import { assetPath } from '../utils/siteUtils';

export default function BaitCard({ bait }) {
  return (
    <article className="brand-card">
      <a
        href={bait.url}
        target="_blank"
        rel="noreferrer"
        className="brand-card-media"
      >
        <img src={assetPath(bait.image)} alt={bait.name} />
      </a>

      <div className="brand-card-body">
        <span className="brand-card-tag">{bait.specialty}</span>

        <h3>
          <a href={bait.url} target="_blank" rel="noreferrer">
            {bait.name}
          </a>
        </h3>

        <p>{bait.description}</p>

        <div className="brand-card-products">
          <strong>Productos destacados</strong>
          <ul>
            {bait.featuredProducts.map((product) => (
              <li key={product}>{product}</li>
            ))}
          </ul>
        </div>

        <a href={bait.url} target="_blank" rel="noreferrer">
          Ir a la página web
        </a>
      </div>
    </article>
  );
}