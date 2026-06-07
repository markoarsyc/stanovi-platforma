import React from 'react';
import { useFormContext, get } from 'react-hook-form';
import { Textarea } from '@/shared/components/ui';

interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string;
  label?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  name,
  label,
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
      <Textarea {...register(name)} {...props} />
      {error?.message && (
        <p className="ml-1 font-body text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
};
