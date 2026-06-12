import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
    <Icon size={18} className="text-primary" />
    <div className="flex-1">
      <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-body text-sm text-foreground">{value || '—'}</p>
    </div>
  </div>
);
