import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center px-6">
    <div className="text-center space-y-4">
      <p className="font-display text-7xl font-bold text-gradient-indigo">404</p>
      <h1 className="font-display text-2xl text-foreground">Stranica nije pronađena</h1>
      <p className="font-body text-sm text-muted-foreground">
        Adresa koju ste posetili ne postoji ili je premeštena.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Nazad na početnu
      </Link>
    </div>
  </main>
);

export default NotFoundPage;
