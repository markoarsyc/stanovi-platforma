import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, Phone, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Role } from "../../shared/types/enums/role.enum";

type AuthMode = "login" | "register";
type UserRole = typeof Role.BUYER | typeof Role.INVESTOR;

const iconInputClass =
  "w-full rounded-lg border border-gray-300 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const IconInput = ({
  icon: Icon,
  ...props
}: { icon: any } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="relative w-full">
    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
    <input className={iconInputClass} {...props} />
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();
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
      if (mode === "login") {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("auth_token", response.data.access_token);
        navigate("/");
      } else {
        const regResponse = await api.post("/auth/register", {
          email: formData.email,
          password: formData.password,
          role: role, 
        });

        const token = regResponse.data.access_token;
        localStorage.setItem("auth_token", token);

        const isBuyer = role === Role.BUYER;
        const profileEndpoint = isBuyer ? "/buyers" : "/investors";
        
        const profilePayload = isBuyer
          ? { 
              firstName: formData.firstName, 
              lastName: formData.lastName, 
              phone: formData.phone 
            }
          : { 
              companyName: formData.companyName, 
              tin: formData.tin, 
              contactEmail: formData.contactEmail || formData.email,
              contactPhone: formData.contactPhone 
            };

        await api.post(profileEndpoint, profilePayload);
        navigate("/");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Došlo je do greške";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-center text-3xl font-bold text-gray-900">
          {mode === "login" ? "Prijava" : "Registracija"}
        </h1>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {mode === "register" && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole(Role.BUYER)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                role === Role.BUYER ? "border-blue-500 bg-blue-100 text-blue-600" : "border-gray-300 text-gray-500 hover:border-blue-300"
              }`}
            >
              <User size={16} /> Kupac
            </button>
            <button
              type="button"
              onClick={() => setRole(Role.INVESTOR)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                role === Role.INVESTOR ? "border-blue-500 bg-blue-100 text-blue-600" : "border-gray-300 text-gray-500 hover:border-blue-300"
              }`}
            >
              <Building2 size={16} /> Investitor
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* POLJA ZA KUPCA */}
          {mode === "register" && role === Role.BUYER && (
            <>
              <div className="flex gap-3">
                <IconInput icon={User} name="firstName" placeholder="Ime" required onChange={handleChange} />
                <IconInput icon={User} name="lastName" placeholder="Prezime" required onChange={handleChange} />
              </div>
              <IconInput icon={Phone} name="phone" placeholder="Telefon" required onChange={handleChange} />
            </>
          )}

          {/* POLJA ZA INVESTITORA */}
          {mode === "register" && role === Role.INVESTOR && (
            <>
              <IconInput icon={Building2} name="companyName" placeholder="Naziv firme" required onChange={handleChange} />
              <IconInput icon={Hash} name="tin" placeholder="PIB (opciono)" onChange={handleChange} />
              <IconInput icon={Mail} name="contactEmail" type="email" placeholder="Kontakt email firme" required onChange={handleChange} />
              <IconInput icon={Phone} name="contactPhone" placeholder="Kontakt telefon firme" required onChange={handleChange} />
            </>
          )}

          {/* ZAJEDNIČKA POLJA ZA NALOG */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Podaci za pristup</span></div>
          </div>

          <IconInput icon={Mail} name="email" type="email" placeholder="Email adresa" required onChange={handleChange} />
          <IconInput icon={Lock} name="password" type="password" placeholder="Lozinka" required onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Obrada..." : mode === "login" ? "Prijavi se" : "Registruj se"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? "Nemate nalog?" : "Već imate nalog?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-blue-600 hover:underline"
          >
            {mode === "login" ? "Registrujte se" : "Prijavite se"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;