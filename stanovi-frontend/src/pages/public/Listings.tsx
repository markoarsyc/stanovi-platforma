import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import type { Building } from "@/shared/types/entity/building.entity";
import { getBuildings, type BuildingFilters } from "../../api/services/buildings.service"; // Prilagodi putanju
import BuildingCard from "../../features/buildings/BuildingCard"; // Prilagodi putanju
import ListingsFilters from "./components/ListingsFilters";

const Listings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchBuildings = useCallback(async (filters: BuildingFilters = {}) => {
    try {
      setLoading(true);
      const data = await getBuildings(filters);
      setBuildings(data);
      setError(null);
    } catch (err) {
      console.error("Greška pri učitavanju objekata:", err);
      setError("Došlo je do greške prilikom učitavanja podataka.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleApply = (filters: BuildingFilters) => {
    setFiltersApplied(true);
    fetchBuildings(filters);
  };

  const handleClear = () => {
    setFiltersApplied(false);
    fetchBuildings();
  };

  const handleDeleteBuilding = (id: string) => {
    setBuildings(prev => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen pt-24">
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Header sekcija */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-5xl font-bold text-foreground md:text-6xl">
              Projekti <span className="text-gradient-indigo">u ponudi</span>
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg text-muted-foreground">
              Istražite aktuelne stambene objekte i pronađite savršen stan za vas.
            </p>
          </motion.div>

          <ListingsFilters
            onApply={handleApply}
            onClear={handleClear}
            filtersApplied={filtersApplied}
            loading={loading}
          />

          {/* State handling: Loading, Error, Empty, ili Grid */}
          {loading ? (
            <div className="mt-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 font-body text-muted-foreground">Učitavanje projekata...</p>
            </div>
          ) : error ? (
            <div className="mt-12 text-center text-red-400">
              <p>{error}</p>
            </div>
          ) : buildings.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
              <Home size={48} className="text-muted-foreground" />
              <p className="mt-4 font-body text-muted-foreground">
                {filtersApplied
                  ? "Nema projekata za zadate filtere."
                  : "Trenutno nema dostupnih projekata."}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {buildings.map((building) => {
                const buildingData = {
                  ...building,
                  description: building.description ?? undefined
                };
                return (
                  <BuildingCard key={building.id} building={buildingData} onDelete={handleDeleteBuilding} />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Listings;