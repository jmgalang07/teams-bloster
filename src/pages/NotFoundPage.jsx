import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="site-container">
        <div className="empty-state">
          <h1>Pagina no encontrada</h1>
          <p>La ruta que has abierto no existe dentro de Team's Bloster.</p>
          <Link className="button button-primary" to="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
