import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Home,
  ArrowLeft,
  CheckCircle,
  Clock,
  ImageIcon,
  User,
  Mail,
  Phone,
  Zap,
} from 'lucide-react';
import { getBuildingById } from '@/api/services/buildings.service';
import { getInvestorInfo } from '@/api/services/investor.service';
import ApartmentViewToggle from '@/shared/components/ApartmentViewToggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import type {
  BuildingDetail,
  ApartmentDetail,
  InvestorInfo,
  ApartmentStatus,
} from '@/shared/types/building-detail.types';
import { statusConfig } from '@/shared/types/building-detail.types';

const iconMap = {
  Clock: Clock,
  Zap: Zap,
  CheckCircle: CheckCircle,
} as const;

const BuildingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [building, setBuilding] = useState<BuildingDetail | null>(null);
  const [apartments, setApartments] = useState<ApartmentDetail[]>([]);
  const [investor, setInvestor] = useState<InvestorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApt, setSelectedApt] = useState<ApartmentDetail | null>(null);
  const [aptView, setAptView] = useState<'list' | 'cards'>('list');
  const [showInvestor, setShowInvestor] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Projekat nije pronađen.');
        setLoading(false);
        return;
      }

      try {
        // Fetch building with apartments
        const buildingData = await getBuildingById(id);
        setBuilding(buildingData);

        // Extract apartments from building response
        if (buildingData.apartments && Array.isArray(buildingData.apartments)) {
          setApartments(buildingData.apartments);
        }

        // Fetch investor info if investorId exists
        if (buildingData.investorId) {
          try {
            const investorData = await getInvestorInfo(buildingData.investorId);
            setInvestor(investorData);
          } catch (err) {
            // Investor might not be available, continue without it
            console.log('Could not fetch investor info:', err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching building details:', err);
        setError('Greška pri učitavanju podataka. Pokušajte ponovo.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <p className="font-body text-muted-foreground">
          {error || 'Projekat nije pronađen.'}
        </p>
      </div>
    );
  }

  const getApartmentStatusConfig = (status: ApartmentStatus) => {
    const config = statusConfig[status];
    const IconComponent = config && iconMap[config.icon as keyof typeof iconMap];
    return { ...config, IconComponent };
  };

  const formattedDate = new Date(building.dueDate).toLocaleDateString('sr-RS', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden md:h-96">
        {building.image_url ? (
          <img
            src={building.image_url}
            alt={building.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Home size={64} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <Link
              to="/oglasi"
              className="mb-4 inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft size={14} /> Nazad na oglase
            </Link>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              {building.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {building.address}{' '}
                {building.location ? `, ${building.location.name}` : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Home size={14} /> {apartments.length} stanova
              </span>
              {investor && (
                <span className="flex items-center gap-1">
                  <User size={14} /> {investor.companyName}
                </span>
              )}
            </div>
            {investor && (
              <button
                onClick={() => setShowInvestor(true)}
                className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 font-body text-sm hover:bg-secondary hover:text-primary transition-colors"
              >
                <User size={14} /> Kontakt investitora
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground"
          >
            {building.description || 'Nema dostupnog opisa za ovaj projekat.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Stanovi ({apartments.length})
              </h2>
              <ApartmentViewToggle view={aptView} onChange={setAptView} />
            </div>

            {apartments.length === 0 ? (
              <p className="mt-6 font-body text-muted-foreground">
                Nema dodanih stanova za ovaj projekat.
              </p>
            ) : aptView === 'list' ? (
              // List view
              <div className="mt-6 overflow-x-auto rounded-xl border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Stan
                      </th>
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Sprat
                      </th>
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Sobe
                      </th>
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Površina
                      </th>
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Cena
                      </th>
                      <th className="px-5 py-4 text-left font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartments.map((apt) => {
                      const config = getApartmentStatusConfig(apt.status);
                      return (
                        <tr
                          key={apt.id}
                          onClick={() => setSelectedApt(apt)}
                          className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/30"
                        >
                          <td className="px-5 py-4 font-body text-sm font-medium text-foreground">
                            {apt.aptNo}
                          </td>
                          <td className="px-5 py-4 font-body text-sm text-muted-foreground">
                            {apt.floor}.
                          </td>
                          <td className="px-5 py-4 font-body text-sm text-muted-foreground">
                            {apt.rooms}
                          </td>
                          <td className="px-5 py-4 font-body text-sm text-muted-foreground">
                            {Number(apt.area)} m²
                          </td>
                          <td className="px-5 py-4 font-body text-sm font-semibold text-accent">
                            €{Number(apt.price).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1 font-body text-sm font-medium ${config.className}`}
                            >
                              {config.IconComponent && (
                                <config.IconComponent size={14} />
                              )}
                              {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Cards view
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {apartments.map((apt) => {
                  const config = getApartmentStatusConfig(apt.status);
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedApt(apt)}
                      className="cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                        <ImageIcon size={40} className="text-muted-foreground/40" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Stan {apt.aptNo}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 font-body text-xs font-medium ${config.className}`}
                          >
                            {config.IconComponent && (
                              <config.IconComponent size={12} />
                            )}
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          Sprat {apt.floor}. · {apt.rooms} sobe ·{' '}
                          {Number(apt.area)} m²
                        </p>
                        <p className="mt-2 font-body text-lg font-semibold text-accent">
                          €{Number(apt.price).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Floor plan dialog */}
      <Dialog
        open={!!selectedApt}
        onOpenChange={(open: boolean) => !open && setSelectedApt(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Stan br. {selectedApt?.aptNo} — {selectedApt?.rooms}-soban
            </DialogTitle>
            <DialogDescription className="font-body">
              Sprat {selectedApt?.floor}. · {Number(selectedApt?.area)} m² ·
              €{Number(selectedApt?.price).toLocaleString()} ·{' '}
              {selectedApt && getApartmentStatusConfig(selectedApt.status).label}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <ImageIcon size={48} className="text-muted-foreground" />
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Plan stana nije dostupan
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investor contact dialog */}
      <Dialog open={showInvestor} onOpenChange={setShowInvestor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Kontakt investitora
            </DialogTitle>
            <DialogDescription className="font-body">
              Informacije o investitoru za projekat {building?.title}
            </DialogDescription>
          </DialogHeader>
          {investor && (
            <div className="mt-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-body text-xs text-muted-foreground">
                    Naziv
                  </p>
                  <p className="font-body font-semibold text-foreground">
                    {investor.companyName}
                  </p>
                </div>
              </div>
              {investor.contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">
                      Email
                    </p>
                    <a
                      href={`mailto:${investor.contactEmail}`}
                      className="font-body font-semibold text-foreground hover:text-primary"
                    >
                      {investor.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {investor.contactPhone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">
                      Telefon
                    </p>
                    <a
                      href={`tel:${investor.contactPhone}`}
                      className="font-body font-semibold text-foreground hover:text-primary"
                    >
                      {investor.contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {!investor.contactEmail && !investor.contactPhone && (
                <p className="font-body text-sm text-muted-foreground">
                  Kontakt informacije nisu dostupne.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildingDetailPage;
