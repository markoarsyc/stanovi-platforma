import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, Hash, Mail, Phone, AlertTriangle } from 'lucide-react';
import { Button, FormDialog, ConfirmDialog } from '@/shared/components/ui';
import { FormField } from '@/shared/forms';
import { updateInvestor } from '@/api/services/investor.service';
import type { Investor } from '@/shared/types/entity/investor.entity';
import {
  investorProfileSchema,
  type InvestorProfileFormData,
} from './investorProfileSchema';

interface EditInvestorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: Investor;
  onSuccess: () => void;
}

const VERIFICATION_WARNING =
  'Izmena naziva kompanije ili PIB-a poništava verifikaciju — moraćete ponovo da se verifikujete.';

export const EditInvestorDialog: React.FC<EditInvestorDialogProps> = ({
  open,
  onOpenChange,
  investor,
  onSuccess,
}) => {
  const methods = useForm<InvestorProfileFormData>({
    resolver: zodResolver(investorProfileSchema),
    defaultValues: { companyName: '', tin: '', contactEmail: '', contactPhone: '' },
  });
  const [pendingData, setPendingData] = useState<InvestorProfileFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      methods.reset({
        companyName: investor.companyName,
        tin: investor.tin ?? '',
        contactEmail: investor.contactEmail,
        contactPhone: investor.contactPhone,
      });
    }
  }, [open, investor, methods]);

  const watchedCompanyName = methods.watch('companyName');
  const watchedTin = methods.watch('tin');
  const identityChanged =
    watchedCompanyName !== investor.companyName ||
    (watchedTin ?? '') !== (investor.tin ?? '');
  const willResetVerification = investor.isVerified && identityChanged;

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);
    try {
      await updateInvestor(investor.id, pendingData);
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
        description="Ažurirajte podatke o vašoj kompaniji."
      >
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((data) => setPendingData(data))}
            className="space-y-4"
          >
            <FormField
              name="companyName"
              label="Naziv kompanije"
              leadingIcon={Building2}
              placeholder="Naziv kompanije"
            />
            <FormField name="tin" label="PIB (TIN)" leadingIcon={Hash} placeholder="PIB" />
            <FormField
              name="contactEmail"
              label="Kontakt email"
              leadingIcon={Mail}
              placeholder="Kontakt email"
            />
            <FormField
              name="contactPhone"
              label="Kontakt telefon"
              leadingIcon={Phone}
              placeholder="Kontakt telefon"
            />

            {willResetVerification && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="font-body text-sm text-amber-600 dark:text-amber-400">
                  {VERIFICATION_WARNING}
                </p>
              </div>
            )}

            <Button type="submit" fullWidth className="mt-2">
              Sačuvaj izmene
            </Button>
          </form>
        </FormProvider>
      </FormDialog>

      <ConfirmDialog
        open={pendingData !== null}
        title="Potvrda izmene"
        description={
          willResetVerification
            ? `Da li ste sigurni da želite da sačuvate izmene? ${VERIFICATION_WARNING}`
            : 'Da li ste sigurni da želite da sačuvate izmene?'
        }
        confirmLabel="Sačuvaj"
        variant={willResetVerification ? 'danger' : 'primary'}
        onConfirm={handleConfirm}
        onCancel={() => setPendingData(null)}
        isSubmitting={isSaving}
      />
    </>
  );
};
