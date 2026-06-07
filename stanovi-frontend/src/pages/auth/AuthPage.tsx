import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, Phone, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Role } from "../../shared/types/enums/role.enum";
import { authService } from "../../api/services/auth.service";
import { useAuth } from "../../features/auth/context/AuthContext";

type AuthMode = "login" | "register";
type UserRole = typeof Role.BUYER | typeof Role.INVESTOR;

const iconInputClass =
  "w-full rounded-lg border border-border bg-background/50 py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

const IconInput = ({
  icon: Icon,
  ...props
}: { icon: React.ComponentType<{ size?: number; className?: string }> } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative w-full">
    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input className={iconInputClass} {...props} />
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>(Role.BUYER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyName: "",
    tin: "",
    phone: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let authResponse;
      if (mode === "login") {
        authResponse = await authService.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Registracija - koristi atomske endpointe
        if (role === Role.BUYER) {
          authResponse = await authService.registerBuyer({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          });
        } else {
          authResponse = await authService.registerInvestor({
            email: formData.email,
            password: formData.password,
            companyName: formData.companyName,
            tin: formData.tin,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
          });
        }
      }
      contextLogin(authResponse);
      navigate("/");
    } catch (err) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr?.response?.status === 429) {
        setError("Previše pokušaja. Pokušajte ponovo za 1 minut.");
      } else {
        const message = axiosErr?.response?.data?.message || "Došlo je do greške";
        setError(Array.isArray(message) ? (message as string[])[0] : String(message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // bg-background postavlja istu boju kao na landing stranici
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
      
      {/* Glavni kontejner forme sa blagim glass efektom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">
            {mode === "login" ? "Prijava" : "Registracija"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login" 
              ? "Pristupite vašem Indigo nalogu" 
              : "Postanite deo Indigo zajednice"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Role Switcher */}
        {mode === "register" && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(Role.BUYER)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                role === Role.BUYER 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <User size={16} /> Kupac
            </button>
            <button
              type="button"
              onClick={() => setRole(Role.INVESTOR)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                role === Role.INVESTOR 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Building2 size={16} /> Investitor
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 overflow-hidden"
            >
              {role === Role.BUYER ? (
                <>
                  <div className="flex gap-3">
                    <IconInput icon={User} name="firstName" placeholder="Ime" required onChange={handleChange} />
                    <IconInput icon={User} name="lastName" placeholder="Prezime" required onChange={handleChange} />
                  </div>
                  <IconInput icon={Phone} name="phone" placeholder="Telefon" required onChange={handleChange} />
                </>
              ) : (
                <>
                  <IconInput icon={Building2} name="companyName" placeholder="Naziv firme" required onChange={handleChange} />
                  <IconInput icon={Hash} name="tin" placeholder="PIB (opciono)" onChange={handleChange} />
                  <IconInput icon={Mail} name="contactEmail" type="email" placeholder="Email firme" required onChange={handleChange} />
                  <IconInput icon={Phone} name="contactPhone" placeholder="Telefon firme" required onChange={handleChange} />
                </>
              )}
            </motion.div>
          )}

          <IconInput icon={Mail} name="email" type="email" placeholder="Email adresa" required onChange={handleChange} />
          <IconInput icon={Lock} name="password" type="password" placeholder="Lozinka" minLength={6} required onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-gradient-indigo py-3.5 text-sm font-semibold text-primary-foreground shadow-indigo transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? "Obrada..." : mode === "login" ? "Prijavi se" : "Registruj se"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Nemaš nalog?" : "Već imaš nalog?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setFormData({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
                companyName: "",
                tin: "",
                phone: "",
                contactEmail: "",
                contactPhone: "",
              });
              setError(""); 
            }}
            className="font-semibold text-primary hover:underline transition-all"
          >
            {mode === "login" ? "Registruj se" : "Prijavi se"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;