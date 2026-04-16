import { List, Grid } from 'lucide-react';

interface ApartmentViewToggleProps {
  view: 'list' | 'cards';
  onChange: (view: 'list' | 'cards') => void;
}

const ApartmentViewToggle = ({ view, onChange }: ApartmentViewToggleProps) => {
  return (
    <div className="flex gap-2 rounded-lg border border-border bg-secondary/50 p-1">
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List size={16} />
        Lista
      </button>
      <button
        onClick={() => onChange('cards')}
        className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
          view === 'cards'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Grid size={16} />
        Kartice
      </button>
    </div>
  );
};

export default ApartmentViewToggle;
