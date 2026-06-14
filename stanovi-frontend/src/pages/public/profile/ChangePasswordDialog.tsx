import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { Button, FormDialog } from '@/shared/components/ui';
import { FormField } from '@/shared/forms';
import { authService } from '@/api/services/auth.service';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from './changePasswordSchema';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  const { isSubmitting } = methods.formState;

  useEffect(() => {
    if (open) {
      methods.reset({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [open, methods]);

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast.success('Lozinka je uspešno promenjena.');
      onOpenChange(false);
    } catch (error) {
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr?.response?.status === 401) {
        methods.setError('oldPassword', { message: 'Pogrešna trenutna lozinka' });
      } else {
        toast.error('Došlo je do greške. Pokušajte ponovo.');
      }
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Promena lozinke"
      description="Unesite trenutnu lozinku i novu lozinku."
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            name="oldPassword"
            type="password"
            label="Trenutna lozinka"
            leadingIcon={Lock}
            placeholder="Trenutna lozinka"
          />
          <FormField
            name="newPassword"
            type="password"
            label="Nova lozinka"
            leadingIcon={Lock}
            placeholder="Nova lozinka"
          />
          <FormField
            name="confirmPassword"
            type="password"
            label="Potvrda nove lozinke"
            leadingIcon={Lock}
            placeholder="Potvrdite novu lozinku"
          />
          <Button type="submit" disabled={isSubmitting} fullWidth className="mt-2">
            {isSubmitting ? 'Čuvanje...' : 'Promeni lozinku'}
          </Button>
        </form>
      </FormProvider>
    </FormDialog>
  );
};
