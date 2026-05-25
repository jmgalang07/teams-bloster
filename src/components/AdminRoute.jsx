import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAdmin, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
    return (
      <section className="section section-alt auth-section">
        <div className="site-container">
          <article className="info-card auth-card">
            <span className="eyebrow">Acceso privado</span>
            <h1>Comprobando sesion...</h1>
            <p>Estamos revisando si tienes permisos de administrador.</p>
          </article>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
