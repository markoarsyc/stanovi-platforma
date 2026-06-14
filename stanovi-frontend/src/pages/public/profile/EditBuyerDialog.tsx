import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Phone } from 'lucide-react';
import { Button, FormDialog, ConfirmDialog } from '@/shared/components/ui';
import { FormField } from '@/shared/forms';
import { updateBuyer } from '@/api/services/buyer.service';
import type { Buyer } from '@/shared/types/entity/buyer.entity';
import { buyerProfileSchema, type BuyerProfileFormData } from './buyerProfileSchema';

interface EditBuyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyer: Buyer;
  onSuccess: () => void;
}

export const EditBuyerDialog: React.FC<EditBuyerDialogProps> = ({
  open,
  onOpenChange,
  buyer,
  onSuccess,
}) => {
  const methods = useForm<BuyerProfileFormData>({
    resolver: zodResolver(buyerProfileSchema),
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });
  const [pendingData, setPendingData] = useState<BuyerProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      methods.reset({
        firstName: buyer.firstName,
        lastName: buyer.lastName,
        phone: buyer.phone,
      });
    }
  }, [open, buyer, methods]);

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);
    try {
      await updateBuyer(buyer.id, pendingData);
      toast.success('Podaci su uspešno izmenjeni.');
      setPendingData(null);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      toast.error(String(axiosErr?.response?.data?.message || 'Došlo je do greške.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Izmena podataka"
        description="Ažurirajte svoje lične podatke."
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data) => setPendingData(data))}
            className="space-y-4"
          >
            <FormField name="firstName" label="Ime" leadingIcon={User} placeholder="Ime" />
            <FormField name="lastName" label="Prezime" leadingIcon={User} placeholder="Prezime" />
            <FormField name="phone" label="Telefon" leadingIcon={Phone} placeholder="Telefon" />
            <Button type="submit" fullWidth className="mt-2">
              Sačuvaj izmene
            </Button>
          </form>
        </FormProvider>
      </FormDialog>

      <ConfirmDialog
        open={pendingData !== null}
        title="Potvrda izmene"
        description="Da li ste sigurni da želite da sačuvate izmene?"
        confirmLabel="Sačuvaj"
        variant="primary"
        onConfirm={handleConfirm}
        onCancel={() => setPendingData(null)}
        isSubmitting={isSaving}
      />
    </>
  );
};
