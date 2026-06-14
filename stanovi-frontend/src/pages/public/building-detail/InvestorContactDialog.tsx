import { User, Mail, Phone, BadgeCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/Dialog';
import type { InvestorInfo } from '@/shared/types/building-detail.types';

interface InvestorContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: InvestorInfo | null;
  buildingTitle: string;
}

interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const ContactRow: React.FC<ContactRowProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <div>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
      {value}
    </div>
  </div>
);

export const InvestorContactDialog: React.FC<InvestorContactDialogProps> = ({
  open,
  onOpenChange,
  investor,
  buildingTitle,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">Kontakt investitora</DialogTitle>
        <DialogDescription className="font-body">
          Informacije o investitoru za projekat {buildingTitle}
        </DialogDescription>
      </DialogHeader>
      {investor && (
        <div className="mt-2 space-y-4">
          <div className="flex justify-center pb-2">
            {investor.profilePhotoUrl ? (
              <img
                src={investor.profilePhotoUrl}
                alt={investor.companyName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-indigo text-2xl font-bold text-primary-foreground">
                {(investor.companyName?.[0] ?? '?').toUpperCase()}
              </div>
            )}
          </div>

          <ContactRow
            icon={<User size={20} className="text-primary" />}
            label="Naziv"
            value={
              <div className="flex items-center gap-1.5">
                <p className="font-body font-semibold text-foreground">{investor.companyName}</p>
                {investor.isVerified && <BadgeCheck size={18} className="text-blue-500" />}
              </div>
            }
          />

          {investor.contactEmail && (
            <ContactRow
              icon={<Mail size={20} className="text-primary" />}
              label="Email"
              value={
                <a
                  href={`mailto:${investor.contactEmail}`}
                  className="font-body font-semibold text-foreground hover:text-primary"
                >
                  {investor.contactEmail}
                </a>
              }
            />
          )}

          {investor.contactPhone && (
            <ContactRow
              icon={<Phone size={20} className="text-primary" />}
              label="Telefon"
              value={
                <a
                  href={`tel:${investor.contactPhone}`}
                  className="font-body font-semibold text-foreground hover:text-primary"
                >
                  {investor.contactPhone}
                </a>
              }
            />
          )}

          {!investor.contactEmail && !investor.contactPhone && (
            <p className="font-body text-sm text-muted-foreground">
              Kontakt informacije nisu dostupne.
            </p>
          )}
        </div>
      )}
    </DialogContent>
  </Dialog>
);
