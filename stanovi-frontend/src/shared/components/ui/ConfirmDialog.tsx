import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Potvrdi',
  cancelLabel = 'Otkaži',
  variant = 'danger',
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => (
  <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
    <DialogContent className="w-full max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Obrada...' : confirmLabel}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
