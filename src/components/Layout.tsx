import { Link, useLocation } from "react-router-dom";
import LucidLogo from "./LucidLogo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {!isHome && (
        <header className="p-6 flex items-center justify-between max-w-3xl mx-auto w-full">
          <Link to="/" className="transition-opacity duration-300 hover:opacity-70">
            <LucidLogo size="sm" />
          </Link>
          <nav className="flex gap-6">
            <Link to="/stats" className="font-mono text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
              stats
            </Link>
            <Link to="/about" className="font-mono text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
              about
            </Link>
          </nav>
        </header>
      )}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default Layout;
