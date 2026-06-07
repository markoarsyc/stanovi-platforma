import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import { cn } from '@/shared/utils/cn';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn('w-full max-w-lg', contentClassName)}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
