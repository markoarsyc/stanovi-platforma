import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Hash, BadgeCheck, ShieldCheck, Shield } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button, Spinner, ErrorAlert } from '@/shared/components/ui';
import { ProfileHeader } from './ProfileHeader';
import { InfoRow } from './InfoRow';
import { VerificationDialog } from './VerificationDialog';
import { useProfile } from './useProfile';

const ProfilePage: React.FC = () => {
  const { user, isInvestor } = useAuth();
  const { buyer, investor, loading, error, refetch } = useProfile();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const roleLabel = isInvestor ? 'Investitor' : 'Kupac';
  const displayName = isInvestor
    ? investor?.companyName || 'Investitor'
    : buyer
      ? `${buyer.firstName} ${buyer.lastName}`
      : 'Kupac';

  return (
    <main className="min-h-screen pb-24 pt-32">
      <div className="container mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur"
        >
          <ProfileHeader
            displayName={displayName}
            roleLabel={roleLabel}
            fallbackChar={user?.email?.[0] ?? '?'}
            isVerified={isInvestor && investor?.isVerified}
          />

          {loading ? (
            <div className="py-10">
              <Spinner label="Učitavanje profila..." />
            </div>
          ) : error ? (
            <ErrorAlert message={error} />
          ) : isInvestor ? (
            <div className="space-y-4">
              <InfoRow icon={Building2} label="Naziv kompanije" value={investor?.companyName} />
              <InfoRow icon={Hash} label="PIB" value={investor?.tin} />
              <InfoRow icon={Mail} label="Kontakt email" value={investor?.contactEmail} />
              <InfoRow icon={Phone} label="Kontakt telefon" value={investor?.contactPhone} />
              <InfoRow
                icon={investor?.isVerified ? ShieldCheck : Shield}
                label="Status verifikacije"
                value={investor?.isVerified ? 'Verifikovan' : 'Nije verifikovan'}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={User} label="Ime" value={buyer?.firstName} />
              <InfoRow icon={User} label="Prezime" value={buyer?.lastName} />
              <InfoRow icon={Mail} label="Email" value={user?.email} />
              <InfoRow icon={Phone} label="Telefon" value={buyer?.phone} />
            </div>
          )}

          {isInvestor && !loading && !error && investor && !investor.isVerified && (
            <Button onClick={() => setIsDialogOpen(true)} className="mt-8">
              <BadgeCheck size={18} /> Verifikuj investitorski profil
            </Button>
          )}
        </motion.div>
      </div>

      {isInvestor && investor && (
        <VerificationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          investorId={investor.id}
          defaultCompanyName={investor.companyName}
          defaultTin={investor.tin}
          onSuccess={refetch}
        />
      )}
    </main>
  );
};

export default ProfilePage;
