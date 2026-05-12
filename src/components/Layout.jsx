import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return null;
}

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <div className="app-shell">
        <Header />
        <main className="page-shell">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
