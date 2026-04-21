import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-bottom footer-single-line">
        <p>
          <Link to="/">Team&apos;s Bloster</Link> · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}