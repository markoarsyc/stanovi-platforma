import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Shield, TrendingUp } from "lucide-react";

// Importi tvojih resursa i servisa
import heroBelgrade from "../../shared/assets/hero-belgrade.jpg"; 
import { getBuildings } from "../../api/services/buildings.service";
import BuildingCard from "../../features/buildings/BuildingCard";

const features = [
  { 
    icon: Building2, 
    title: "Premium Lokacije", 
    desc: "Ekskluzivni projekti na najprestižnijim lokacijama Beograda." 
  },
  { 
    icon: Shield, 
    title: "Sigurna Investicija", 
    desc: "Transparentni uslovi, pravna zaštita i garantovani rokovi izgradnje." 
  },
  { 
    icon: TrendingUp, 
    title: "Rast Vrednosti", 
    desc: "Nekretnine koje konstantno dobijaju na vrednosti." 
  },
];

const LandingPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await getBuildings();
        // Prikazujemo samo prva 3 projekta na početnoj strani
        setBuildings(data.slice(0, 3));
      } catch (error) {
        console.error("Greška prilikom učitavanja projekata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  
  const handleDeleteBuilding = (id: string) => {
    setBuildings(prev => prev.filter((b: any) => b.id !== id));
  }

  return (
    <div className="min-h-screen">
      {/* --- Hero Section --- */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img 
          src={heroBelgrade} 
          alt="Beograd noću" 
          className="absolute inset-0 h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl font-bold leading-tight tracking-wide text-foreground md:text-7xl lg:text-8xl">
              Vaš novi dom u <br />
              <span className="text-gradient-indigo">srcu Beograda</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-muted-foreground md:text-xl">
              Otkrijte ekskluzivne stanove u izgradnji na najprestižnijim lokacijama. 
              Investirajte u budućnost sa Indigo Beograd.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/oglasi"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-indigo px-8 py-4 font-body text-sm font-semibold text-primary-foreground shadow-indigo transition-transform hover:scale-105"
              >
                Pregledaj Oglase <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-4xl font-bold text-foreground md:text-5xl"
          >
            Zašto <span className="text-gradient-gold">Indigo Beograd</span>?
          </motion.h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-xl border border-border bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-indigo"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-indigo">
                  <f.icon size={24} className="text-primary-foreground" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Featured Projects Section --- */}
      <section className="border-t border-border py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
                Istaknuti projekti
              </h2>
              <p className="mt-3 font-body text-muted-foreground">
                Naši najnoviji stambeni objekti u izgradnji
              </p>
            </div>
            <Link 
              to="/oglasi" 
              className="hidden items-center gap-1 font-body text-sm font-semibold text-primary hover:underline md:flex"
            >
              Vidi sve <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Dinamički render sadržaja zavisno od statusa učitavanja */}
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((skeleton) => (
                <div 
                  key={skeleton} 
                  className="h-[400px] w-full animate-pulse rounded-xl bg-card border border-border" 
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {buildings.length > 0 ? (
                buildings.map((b: any) => (
                  <BuildingCard key={b.id} building={b} onDelete={handleDeleteBuilding} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="font-body text-lg text-muted-foreground">
                    Trenutno nema dostupnih projekata za prikaz.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mobilni "Vidi sve" link koji se vidi samo na malim ekranima */}
          <div className="mt-10 flex justify-center md:hidden">
            <Link 
              to="/oglasi" 
              className="flex items-center gap-2 font-body font-semibold text-primary"
            >
              Vidi sve oglase <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;