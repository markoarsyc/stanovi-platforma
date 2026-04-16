import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">{children}</div>
    </div>
  );
};

export const DialogContent = ({ children, className = '' }: DialogContentProps) => {
  return (
    <div
      className={`relative rounded-lg border border-border bg-card p-6 shadow-lg ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children, className = '' }: DialogTitleProps) => {
  return (
    <h2 className={`font-display text-2xl font-bold text-foreground ${className}`}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children, className = '' }: DialogDescriptionProps) => {
  return (
    <p className={`font-body text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};
