import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../features/auth/context/AuthContext";
import logo from "../assets/logo-indigo-beograd.png";
import { Role } from "../../shared/types/enums/role.enum";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Izvlačimo sve što nam treba iz AuthContext-a
  const { user, logout, isAuthenticated } = useAuth();

  const isInvestor = user?.role === Role.INVESTOR;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const navItems = [
    { label: "Početna", path: "/" },
    { label: "Oglasi", path: "/oglasi" },
    // Dinamički dodajemo linkove za investitore
    ...(isInvestor ? [{ label: "Moji projekti", path: "/investor" }] : []),
    ...(isAuthenticated ? [{ label: "Profil", path: "/profil" }] : []),
    ...(isAuthenticated && user?.role === Role.ADMIN ? [{ label: "Admin Panel", path: "/admin" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Indigo Beograd" className="h-12 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-body text-sm font-medium tracking-wide transition-colors hover:text-primary ${
                location.pathname === item.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
               <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2 font-body text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut size={14} /> Odjavi se
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-gradient-indigo px-6 py-2.5 font-body text-sm font-semibold text-primary-foreground shadow-indigo transition-transform hover:scale-105"
            >
              Prijavi se
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="text-foreground md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 bg-background md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`font-body text-lg font-medium ${
                    location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-4 font-body text-sm font-semibold text-muted-foreground"
                >
                  <LogOut size={16} /> Odjavi se
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-gradient-indigo px-5 py-4 text-center font-body text-sm font-semibold text-primary-foreground"
                >
                  Prijavi se
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;