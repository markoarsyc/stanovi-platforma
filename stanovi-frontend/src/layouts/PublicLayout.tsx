import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../shared/components/Navbar';
import { Spinner } from '@/shared/components/ui';

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Spinner size={32} label="Učitavanje..." />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Indigo Beograd. Sva prava zadržana.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
