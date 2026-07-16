import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Label for the empty (reset) selection — shown on the trigger and as the top row. */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

const triggerClass =
  'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-4 py-3 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors';

const rowClass =
  'flex w-full items-center justify-between gap-2 px-4 py-2 text-left font-body text-sm text-foreground transition-colors hover:bg-secondary';

export const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Izaberi...',
  searchPlaceholder = 'Pretraži...',
  emptyText = 'Nema rezultata',
  className,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const handleToggle = () => {
    setQuery('');
    setOpen((o) => !o);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button type="button" onClick={handleToggle} className={triggerClass}>
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <div className="relative border-b border-border p-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-border bg-secondary py-2 pl-9 pr-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <ul className="max-h-60 overflow-y-auto py-1">
            {!query.trim() && (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={cn(rowClass, value === '' && 'text-primary')}
                >
                  {placeholder}
                  {value === '' && <Check size={16} className="shrink-0" />}
                </button>
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-4 py-2 font-body text-sm text-muted-foreground">
                {emptyText}
              </li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(o.value)}
                    className={cn(rowClass, o.value === value && 'text-primary')}
                  >
                    <span className="truncate">{o.label}</span>
                    {o.value === value && <Check size={16} className="shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
