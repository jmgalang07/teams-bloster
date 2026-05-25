import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { authError, isAdmin, isLoadingAuth, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/panel";

  if (isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");
    setIsSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (error) {
      setLocalError(error.message || "No se ha podido iniciar sesion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Hero
        eyebrow="Acceso admin"
        title="Panel privado de gestion"
        description="Las capturas y escenarios se pueden ver sin iniciar sesion. Para crear, editar o borrar contenido tienes que entrar como administrador."
        compact
        backgroundImage="storage://team-assets/images/logo.webp"
      />

      <section className="section section-alt auth-section">
        <div className="site-container auth-layout">
          <article className="info-card form-card auth-card">
            <div className="form-card-heading">
              <span className="eyebrow">Inicio de sesion</span>
              <h2>Entra con tu usuario admin</h2>
              <p>
                Usa el correo autorizado en Supabase y la contrasena que hayas
                creado en Authentication. Los pescadores siguen entrando a la
                web normal sin cuenta.
              </p>
            </div>

            {localError || authError ? (
              <div className="status-message status-error">
                {localError || authError}
              </div>
            ) : null}

            <form className="editor-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Correo</span>
                <input
                  autoComplete="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Escribe tu correo"
                  type="email"
                  value={email}
                />
              </label>

              <label className="field">
                <span>Contrasena</span>
                <input
                  autoComplete="current-password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Escribe tu contraseña"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <div className="panel-actions panel-actions-wrap">
                <button
                  className="button button-primary"
                  disabled={isSubmitting || isLoadingAuth}
                  type="submit"
                >
                  {isSubmitting || isLoadingAuth
                    ? "Entrando..."
                    : "Entrar al panel"}
                </button>
                <Link className="button button-secondary" to="/">
                  Volver a la web
                </Link>
              </div>
            </form>
          </article>

          <article className="info-card panel-note-card auth-help-card">
            <span className="eyebrow">Informacion</span>
            <h3>Gestiona la web desde un solo sitio</h3>
            <p>
              Desde este panel puedes mantener actualizada la informacion que se
              muestra en la web sin tocar el codigo de la aplicacion.
            </p>
            <ul className="panel-feature-list">
              <li>Puedes anadir nuevas capturas con sus datos principales.</li>
              <li>
                Puedes editar escenarios, marcas, cebos y demas contenido
                visible.
              </li>
              <li>
                Los cambios se guardan y aparecen directamente en la web
                publica.
              </li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
