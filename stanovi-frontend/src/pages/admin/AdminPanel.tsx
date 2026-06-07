import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";
import { getVerificationRequests, handleVerificationRequest } from '@/api/services/investor.service';
import { verificationStatusConfig } from "@/shared/constants/statusConfig";
import { formatDate } from "@/shared/utils/format";

interface VerificationRequest {
  id: string;
  investorId: string;
  companyName: string;
  tin: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const AdminPanel = () => {
  const {isAuthenticated, isAdmin } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const data = await getVerificationRequests();
      setRequests(data);
    } catch {
      toast.error("Greška pri učitavanju zahteva");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  // Zaštita rute
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/profile" replace />;

  const onHandleRequest = async (requestId: string, approve: boolean) => {
    const promise = handleVerificationRequest(requestId, approve);

    toast.promise(promise, {
      loading: approve ? 'Odobravanje...' : 'Odbijanje...',
      success: () => {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: approve ? 'APPROVED' : 'REJECTED' } 
            : req
        ));
        return approve ? "Zahtev odobren" : "Zahtev odbijen";
      },
      error: "Greška prilikom obrade zahteva"
    });
  };

  return (
    <main className="min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto max-w-6xl px-6">
        
        {/* Header Sekcija */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <ShieldCheck size={20} />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold">Admin Panel</span>
            </div>
            <h1 className="font-display text-4xl text-foreground">
              Verifikacija Investitora
            </h1>
            <p className="font-body text-muted-foreground mt-2">
              Upravljajte zahtevima za verifikaciju profila i legalnost kompanija.
            </p>
          </div>

          <div className="flex gap-4">
            <StatCard 
              label="Na čekanju" 
              value={requests.filter(r => r.status === 'PENDING').length} 
              icon={<Clock className="text-amber-500" size={16} />} 
            />
            <StatCard 
              label="Odobreni" 
              value={requests.filter(r => r.status === 'APPROVED').length} 
              icon={<CheckCircle2 className="text-emerald-500" size={16} />} 
            />
            <StatCard 
              label="Odbijeni" 
              value={requests.filter(r => r.status === 'REJECTED').length} 
              icon={<XCircle className="text-red-500" size={16} />} 
            />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Kompanija</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">PIB</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Datum</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <LoadingRows />
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-body">
                        Nema pristiglih zahteva za verifikaciju.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <motion.tr 
                        key={req.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <Building2 size={18} />
                            </div>
                            <span className="font-body font-medium text-foreground">{req.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                          {req.tin}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(req.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => onHandleRequest(req.id, false)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                title="Odbij"
                              >
                                <XCircle size={20} />
                              </button>
                              <button 
                                onClick={() => onHandleRequest(req.id, true)}
                                className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                title="Odobri"
                              >
                                <CheckCircle2 size={20} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Obrađeno</span>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

// Pomoćne komponente
const StatCard = ({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) => (
  <div className="bg-card/40 border border-border px-4 py-2 rounded-xl flex items-center gap-3">
    <div className="p-1.5 rounded-lg bg-background shadow-sm">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-1">{label}</p>
      <p className="text-lg font-display font-bold leading-none">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: VerificationRequest['status'] }) => {
  const config = verificationStatusConfig[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeClassName}`}>
      {config.label}
    </span>
  );
};

const LoadingRows = () => (
  <>
    {[1, 2, 3].map(i => (
      <tr key={i} className="animate-pulse">
        <td colSpan={5} className="px-6 py-6 border-b border-border/50">
          <div className="h-4 bg-muted/40 rounded w-full" />
        </td>
      </tr>
    ))}
  </>
);

export default AdminPanel;