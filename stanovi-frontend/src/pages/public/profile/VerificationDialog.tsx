import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, Hash } from 'lucide-react';
import { Button, FormDialog } from '@/shared/components/ui';
import { FormField } from '@/shared/forms';
import { requestInvestorVerification } from '@/api/services/investor.service';
import {
  verificationRequestSchema,
  type VerificationRequestFormData,
} from './verificationSchema';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investorId: string;
  defaultCompanyName?: string;
  defaultTin?: string | null;
  onSuccess: () => void;
}

export const VerificationDialog: React.FC<VerificationDialogProps> = ({
  open,
  onOpenChange,
  investorId,
  defaultCompanyName = '',
  defaultTin = '',
  onSuccess,
}) => {
  const methods = useForm<VerificationRequestFormData>({
    resolver: zodResolver(verificationRequestSchema),
    defaultValues: { companyName: '', tin: '' },
  });
  const { isSubmitting } = methods.formState;

  useEffect(() => {
    if (open) {
      methods.reset({
        companyName: defaultCompanyName,
        tin: defaultTin ?? '',
      });
    }
  }, [open, defaultCompanyName, defaultTin, methods]);

  const handleSubmit = async (data: VerificationRequestFormData) => {
    try {
      await requestInvestorVerification(investorId, data);
      toast.success('Zahtev za verifikaciju je uspešno poslat!');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      toast.error(String(axiosErr?.response?.data?.message || 'Došlo je do greške.'));
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Verifikacija profila"
      description="Unesite zvanične podatke vaše kompanije za proveru."
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            name="companyName"
            label="Naziv kompanije"
            leadingIcon={Building2}
            placeholder="Npr. Invest d.o.o."
          />
          <FormField
            name="tin"
            label="PIB (TIN)"
            leadingIcon={Hash}
            placeholder="Unesite PIB vaše kompanije"
          />
          <Button type="submit" disabled={isSubmitting} fullWidth className="mt-2">
            {isSubmitting ? 'Slanje...' : 'Pošalji zahtev za verifikaciju'}
          </Button>
        </form>
      </FormProvider>
    </FormDialog>
  );
};
