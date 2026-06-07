import React from 'react';
import { useFormContext, get } from 'react-hook-form';
import { Input } from '@/shared/components/ui';
import type { LucideIcon } from 'lucide-react';

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label?: string;
  leadingIcon?: LucideIcon;
  valueAsNumber?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  leadingIcon,
  valueAsNumber,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name);

  return (
    <div className="space-y-1">
      {label && (
        <label className="ml-1 font-body text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      )}
      <Input leadingIcon={leadingIcon} {...register(name, { valueAsNumber })} {...props} />
      {error?.message && (
        <p className="ml-1 font-body text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
};
