import { Link, useLocation } from "react-router-dom";
import { Shield, History } from "lucide-react";

const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            MisInfo Detector
          </span>
        </Link>
        <nav className="flex gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Analyze
          </Link>
          <Link
            to="/history"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === "/history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <History className="h-4 w-4" />
            History
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
