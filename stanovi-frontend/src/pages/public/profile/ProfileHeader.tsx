import React, { useRef } from 'react';
import { BadgeCheck, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  displayName: string;
  roleLabel: string;
  fallbackChar: string;
  isVerified?: boolean;
  photoUrl?: string | null;
  onPhotoSelected?: (file: File) => void;
  onPhotoRemove?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  roleLabel,
  fallbackChar,
  isVerified = false,
  photoUrl,
  onPhotoSelected,
  onPhotoRemove,
}) => {
  const initial = (displayName?.[0] ?? fallbackChar ?? '?').toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editable = Boolean(onPhotoSelected);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Dozvoljene su samo JPG i PNG slike.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Slika mora biti manja od 5MB.');
      return;
    }
    onPhotoSelected?.(file);
  };

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={editable ? () => fileInputRef.current?.click() : undefined}
            disabled={!editable}
            className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-indigo text-2xl font-bold text-primary-foreground disabled:cursor-default"
            aria-label="Promeni profilnu sliku"
          >
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
            {editable && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={20} className="text-white" />
              </span>
            )}
          </button>

          {editable && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFile}
            />
          )}

          {isVerified && (
            <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
              <BadgeCheck size={20} className="fill-blue-500/20 text-blue-500" />
            </div>
          )}
        </div>

        {editable && photoUrl && onPhotoRemove && (
          <button
            type="button"
            onClick={onPhotoRemove}
            className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground transition-colors hover:text-red-500 hover:underline"
          >
            <X size={12} /> Ukloni sliku
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl text-foreground">{displayName}</h1>
          {isVerified && <BadgeCheck size={20} className="text-blue-500" />}
        </div>
        <p className="font-body text-sm text-muted-foreground">{roleLabel}</p>
      </div>
    </div>
  );
};
