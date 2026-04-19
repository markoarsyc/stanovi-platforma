import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Home, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "../auth/context/AuthContext";
import { deleteBuilding } from "../../api/services/buildings.service";

interface BuildingImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

interface BuildingCardProps {
  building: {
    id: string;
    title: string;
    address: string;
    description?: string;
    image_url?: string | null;
    images?: BuildingImage[];
    dueDate: string | Date;
    status: string;
    location?: { name: string };
    _count?: { apartments: number };
  };
  onDelete?: (id: string) => void; // Callback za obaveštavanje roditelja o brisanju
}

const statusColor: Record<string, string> = {
  "PLANNED": "bg-accent/20 text-accent",
  "UNDER_CONSTRUCTION": "bg-primary/20 text-primary",
  "COMPLETED": "bg-green-500/20 text-green-400",
};

const BuildingCard = ({ building, onDelete }: BuildingCardProps) => {
  const { isAdmin } = useAuth();
  const formattedDate = new Date(building.dueDate).toLocaleDateString("sr-RS", {
    month: "long",
    year: "numeric",
  });

  // Prikaži prvu sliku iz images niza, ili fallback na image_url, ili Home ikonu
  const imageToDisplay = building.images && building.images.length > 0
    ? building.images[0].imageUrl
    : building.image_url;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj objekat?")) {
      try {
        await deleteBuilding(building.id);
        alert("Objekat uspešno obrisan");
        if (onDelete) {
          onDelete(building.id);
        }
      } catch (error) {
        console.error("Greška pri brisanju:", error);
        alert("Došlo je do greške prilikom brisanja objekta.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {isAdmin && (
        <button
          onClick={handleDelete}
          type="button"
          className="absolute left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-all hover:bg-red-700 active:scale-90"
          title="Obriši oglas"
        >
          <Trash2 size={20} />
        </button>
      )}
      <Link
        to={`/oglasi/${building.id}`}
        className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-indigo"
      >
        <div className="relative h-52 overflow-hidden bg-secondary flex items-center justify-center">
          {imageToDisplay ? (
            <img
              src={imageToDisplay}
              alt={building.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Home size={48} className="text-muted-foreground" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
          <span className={`absolute top-3 right-3 rounded-full px-3 py-1 font-body text-xs font-semibold uppercase ${statusColor[building.status] || "bg-secondary text-muted-foreground"}`}>
            {building.status.replace("_", " ")}
          </span>
        </div>

        <div className="p-6">
          <h3 className="font-display text-xl font-bold text-foreground">{building.title}</h3>
          <p className="mt-1 flex items-center gap-1 font-body text-sm text-muted-foreground">
            <MapPin size={12} /> {building.address} {building.location ? `, ${building.location.name}` : ""}
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {building.description || "Nema opisa za ovaj objekat."}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
              <Home size={12} /> {building._count?.apartments || 0} jedinica
            </span>
            <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
              <Calendar size={12} /> {formattedDate}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BuildingCard;