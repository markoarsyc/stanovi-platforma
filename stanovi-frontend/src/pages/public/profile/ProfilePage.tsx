import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Building2,
  Hash,
  BadgeCheck,
  ShieldCheck,
  Shield,
  Clock,
  Pencil,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button, Spinner, ErrorAlert } from '@/shared/components/ui';
import {
  uploadBuyerPhoto,
  deleteBuyerPhoto,
} from '@/api/services/buyer.service';
import {
  uploadInvestorPhoto,
  deleteInvestorPhoto,
} from '@/api/services/investor.service';
import { ProfileHeader } from './ProfileHeader';
import { InfoRow } from './InfoRow';
import { VerificationDialog } from './VerificationDialog';
import { EditBuyerDialog } from './EditBuyerDialog';
import { EditInvestorDialog } from './EditInvestorDialog';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ReservationsSection } from './ReservationsSection';
import { useProfile } from './useProfile';

const ProfilePage: React.FC = () => {
  const { user, isInvestor } = useAuth();
  const { buyer, investor, loading, error, refetch } = useProfile();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);

  // The API returns only the most recent request; a pending one blocks a new submission.
  const verificationPending =
    investor?.verificationRequests?.[0]?.status === 'PENDING';

  const roleLabel = isInvestor ? 'Investitor' : 'Kupac';
  const displayName = isInvestor
    ? investor?.companyName || 'Investitor'
    : buyer
      ? `${buyer.firstName} ${buyer.lastName}`
      : 'Kupac';

  const photoUrl = isInvestor ? investor?.profilePhotoUrl : buyer?.profilePhotoUrl;

  const handlePhotoSelected = async (file: File) => {
    try {
      if (isInvestor && investor) {
        await uploadInvestorPhoto(investor.id, file);
      } else if (buyer) {
        await uploadBuyerPhoto(buyer.id, file);
      } else {
        return;
      }
      toast.success('Profilna slika je ažurirana.');
      refetch();
    } catch {
      toast.error('Greška pri otpremanju slike.');
    }
  };

  const handlePhotoRemove = async () => {
    try {
      if (isInvestor && investor) {
        await deleteInvestorPhoto(investor.id);
      } else if (buyer) {
        await deleteBuyerPhoto(buyer.id);
      } else {
        return;
      }
      toast.success('Profilna slika je uklonjena.');
      refetch();
    } catch {
      toast.error('Greška pri uklanjanju slike.');
    }
  };

  const canEdit = !loading && !error && (isInvestor ? !!investor : !!buyer);

  return (
    <main className="min-h-screen pb-24 pt-1">
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
            photoUrl={photoUrl}
            onPhotoSelected={canEdit ? handlePhotoSelected : undefined}
            onPhotoRemove={canEdit ? handlePhotoRemove : undefined}
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
                icon={
                  investor?.isVerified ? ShieldCheck : verificationPending ? Clock : Shield
                }
                label="Status verifikacije"
                value={
                  investor?.isVerified
                    ? 'Verifikovan'
                    : verificationPending
                      ? 'Zahtev za verifikaciju poslat'
                      : 'Nije verifikovan'
                }
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

          {canEdit && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setIsEditOpen(true)}>
                <Pencil size={18} /> Izmeni profil
              </Button>
              <Button variant="secondary" onClick={() => setIsPasswordOpen(true)}>
                <Lock size={18} /> Promeni lozinku
              </Button>
              {isInvestor && investor && !investor.isVerified && !verificationPending && (
                <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>
                  <BadgeCheck size={18} /> Verifikuj profil
                </Button>
              )}
            </div>
          )}

          {!isInvestor && <ReservationsSection />}
        </motion.div>
      </div>

      {isInvestor && investor && (
        <>
          <VerificationDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            investorId={investor.id}
            defaultCompanyName={investor.companyName}
            defaultTin={investor.tin}
            onSuccess={refetch}
          />
          <EditInvestorDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            investor={investor}
            onSuccess={refetch}
          />
        </>
      )}

      {!isInvestor && buyer && (
        <EditBuyerDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          buyer={buyer}
          onSuccess={refetch}
        />
      )}

      <ChangePasswordDialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen} />
    </main>
  );
};

export default ProfilePage;
