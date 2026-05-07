import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Mail, Phone, Building2, Hash, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getInvestorInfoByUserId, requestInvestorVerification } from '@/api/services/investor.service';
import type { Investor } from "@/shared/types/entity/investor.entity";
import { toast } from "sonner";

const Profile = () => {
  const { user, isInvestor, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Investor | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // State za modal i formu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ companyName: "", tin: "" });

  useEffect(() => {
    if (isInvestor && user) {
      getInvestorInfoByUserId(user.id)
        .then((data) => {
          setProfile(data);
          setFormData({ 
            companyName: data.companyName || "", 
            tin: data.tin || "" 
          });
          setLoadingProfile(false);
        })
        .catch((error) => {
          console.error("Greška prilikom dohvatanja informacija o investitoru:", error);
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, [isInvestor, user]);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => !isSubmitting && setIsModalOpen(false);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      await requestInvestorVerification(profile.id, formData);
      toast.success("Zahtev za verifikaciju je uspešno poslat!");
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Došlo je do greške.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInvestor) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display text-foreground">Ova stranica još uvek nije implementirana.</h2>
          <p className="text-muted-foreground">Hvala na razumevanju.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft size={18} /> Vrati se na početnu stranu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur"
        >
          {/* Header sekcija */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-indigo text-2xl font-bold text-primary-foreground">
                {(profile?.companyName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()}
              </div>
              {profile?.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                  <BadgeCheck size={20} className="text-blue-500 fill-blue-500/20" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl text-foreground">
                  {profile?.companyName || "Investitor"}
                </h1>
                {profile?.isVerified && <BadgeCheck size={20} className="text-blue-500"/>}
              </div>
              <p className="font-body text-sm text-muted-foreground">Investitor</p>
            </div>
          </div>

          {/* Podaci */}
          {loadingProfile ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-muted/20 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={<Building2 size={18} />} label="Naziv kompanije" value={profile?.companyName || "—"} />
              <InfoRow icon={<Hash size={18} />} label="PIB" value={profile?.tin || "—"} />
              <InfoRow icon={<Mail size={18} />} label="Kontakt email" value={profile?.contactEmail || "—"} />
              <InfoRow icon={<Phone size={18} />} label="Kontakt telefon" value={profile?.contactPhone || "—"} />
            </div>
          )}

          {/* Dugme za otvaranje modala */}
          {!profile?.isVerified && (
            <button
              onClick={handleOpenModal}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-indigo px-6 py-3 font-body text-sm font-semibold text-primary-foreground shadow-indigo transition-all hover:scale-105 active:scale-95"
            >
              <BadgeCheck size={18} /> Verifikuj investitorski profil
            </button>
          )}
        </motion.div>
      </div>

      {/* Modal za verifikaciju */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-2xl"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="font-display text-2xl text-foreground mb-2">Verifikacija profila</h3>
              <p className="text-sm text-muted-foreground mb-6">Unesite zvanične podatke vaše kompanije za proveru.</p>

              <form onSubmit={handleSubmitVerification} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground ml-1">Naziv kompanije</label>
                  <input
                    required
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="Npr. Invest d.o.o."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground ml-1">PIB (TIN)</label>
                  <input
                    required
                    type="text"
                    value={formData.tin}
                    onChange={(e) => setFormData({...formData, tin: e.target.value})}
                    className="w-full rounded-lg border border-border bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors"
                    placeholder="Unesite PIB vaše kompanije"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 rounded-lg bg-gradient-indigo py-3 font-semibold text-primary-foreground shadow-indigo transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? "Slanje..." : "Pošalji zahtev za verifikaciju"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
    <div className="text-primary">{icon}</div>
    <div className="flex-1">
      <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-body text-sm text-foreground">{value}</p>
    </div>
  </div>
);

export default Profile;