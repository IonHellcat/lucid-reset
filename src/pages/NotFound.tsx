import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import DefogLogo from "@/components/DefogLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="mb-8">
        <DefogLogo size="sm" />
      </div>
      <div className="text-center">
        <h1 className="mb-4 font-mono text-6xl font-bold text-foreground">404</h1>
        <p className="mb-6 font-body text-lg text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="font-display text-sm text-primary transition-opacity duration-300 hover:opacity-70"
        >
          back to menu
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
