import { version } from '../version.json';

export default function Footer() {
  return (
    <footer className="site-foot section-dark">
      <div className="wrap">
        <span>© 2026 Vyatirikht · Pune, India · <span className="site-version">v{version}</span></span>
        <nav>
          <a href="blog.html">Journal</a>
          <a href="books.html">Books</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
          <a href="refund.html">Refunds</a>
          <a href="login.html">Login</a>
        </nav>
      </div>
    </footer>
  );
}
