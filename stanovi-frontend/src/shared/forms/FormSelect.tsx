import React from 'react';
import { useFormContext, get } from 'react-hook-form';
import { Select } from '@/shared/components/ui';

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string;
  label?: string;
  children: React.ReactNode;
  valueAsNumber?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  children,
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
      <Select {...register(name, { valueAsNumber })} {...props}>
        {children}
      </Select>
      {error?.message && (
        <p className="ml-1 font-body text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
};
