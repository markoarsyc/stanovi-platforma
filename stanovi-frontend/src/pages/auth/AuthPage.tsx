import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, Phone, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "../../shared/types/enums/role.enum";
import { authService } from "../../api/services/auth.service";
import { useAuth } from "../../features/auth/context/AuthContext";
import { Button, ErrorAlert } from "@/shared/components/ui";
import { FormField } from "@/shared/forms";
import type { AuthResponse } from "@/features/auth/types";
import {
  loginSchema,
  registerBuyerSchema,
  registerInvestorSchema,
  type LoginFormData,
  type RegisterBuyerFormData,
  type RegisterInvestorFormData,
} from "./schemas";

type AuthMode = "login" | "register";
type UserRole = typeof Role.BUYER | typeof Role.INVESTOR;

const extractError = (err: unknown): string => {
  const axiosErr = err as { response?: { status?: number; data?: { message?: string | string[] } } };
  if (axiosErr?.response?.status === 429) return "Previše pokušaja. Pokušajte ponovo za 1 minut.";
  const message = axiosErr?.response?.data?.message ?? "Došlo je do greške";
  return Array.isArray(message) ? message[0] : String(message);
};

const LoginForm: React.FC<{ onAuth: (r: AuthResponse) => void; onError: (msg: string) => void }> = ({
  onAuth,
  onError,
}) => {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onValid = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      onAuth(res);
    } catch (err) {
      onError(extractError(err));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onValid)} className="space-y-4">
        <FormField leadingIcon={Mail} name="email" type="email" placeholder="Email adresa" />
        <FormField leadingIcon={Lock} name="password" type="password" placeholder="Lozinka" />
        <Button type="submit" fullWidth disabled={methods.formState.isSubmitting} className="mt-2">
          {methods.formState.isSubmitting ? "Obrada..." : "Prijavi se"}
        </Button>
      </form>
    </FormProvider>
  );
};

const RegisterBuyerForm: React.FC<{ onAuth: (r: AuthResponse) => void; onError: (msg: string) => void }> = ({
  onAuth,
  onError,
}) => {
  const methods = useForm<RegisterBuyerFormData>({
    resolver: zodResolver(registerBuyerSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "", phone: "" },
  });

  const onValid = async (data: RegisterBuyerFormData) => {
    try {
      const res = await authService.registerBuyer(data);
      onAuth(res);
    } catch (err) {
      onError(extractError(err));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onValid)} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 overflow-hidden"
        >
          <div className="flex gap-3">
            <FormField leadingIcon={User} name="firstName" placeholder="Ime" />
            <FormField leadingIcon={User} name="lastName" placeholder="Prezime" />
          </div>
          <FormField leadingIcon={Phone} name="phone" placeholder="Telefon" />
        </motion.div>
        <FormField leadingIcon={Mail} name="email" type="email" placeholder="Email adresa" />
        <FormField leadingIcon={Lock} name="password" type="password" placeholder="Lozinka" />
        <Button type="submit" fullWidth disabled={methods.formState.isSubmitting} className="mt-2">
          {methods.formState.isSubmitting ? "Obrada..." : "Registruj se"}
        </Button>
      </form>
    </FormProvider>
  );
};

const RegisterInvestorForm: React.FC<{ onAuth: (r: AuthResponse) => void; onError: (msg: string) => void }> = ({
  onAuth,
  onError,
}) => {
  const methods = useForm<RegisterInvestorFormData>({
    resolver: zodResolver(registerInvestorSchema),
    defaultValues: {
      email: "",
      password: "",
      companyName: "",
      tin: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const onValid = async (data: RegisterInvestorFormData) => {
    try {
      const res = await authService.registerInvestor(data);
      onAuth(res);
    } catch (err) {
      onError(extractError(err));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onValid)} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 overflow-hidden"
        >
          <FormField leadingIcon={Building2} name="companyName" placeholder="Naziv firme" />
          <FormField leadingIcon={Hash} name="tin" placeholder="PIB (opciono)" />
          <FormField leadingIcon={Mail} name="contactEmail" type="email" placeholder="Email firme" />
          <FormField leadingIcon={Phone} name="contactPhone" placeholder="Telefon firme" />
        </motion.div>
        <FormField leadingIcon={Mail} name="email" type="email" placeholder="Email adresa" />
        <FormField leadingIcon={Lock} name="password" type="password" placeholder="Lozinka" />
        <Button type="submit" fullWidth disabled={methods.formState.isSubmitting} className="mt-2">
          {methods.formState.isSubmitting ? "Obrada..." : "Registruj se"}
        </Button>
      </form>
    </FormProvider>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>(Role.BUYER);
  const [error, setError] = useState("");

  const handleAuth = (res: AuthResponse) => {
    contextLogin(res);
    navigate("/");
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
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

        {error && <ErrorAlert message={error} className="mb-6" />}

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

        {mode === "login" && <LoginForm onAuth={handleAuth} onError={setError} />}
        {mode === "register" && role === Role.BUYER && (
          <RegisterBuyerForm onAuth={handleAuth} onError={setError} />
        )}
        {mode === "register" && role === Role.INVESTOR && (
          <RegisterInvestorForm onAuth={handleAuth} onError={setError} />
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Nemaš nalog?" : "Već imaš nalog?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
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
