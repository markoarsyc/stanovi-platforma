import { Outlet } from 'react-router-dom';
import Navbar from '../shared/components/Navbar';

const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <Outlet />
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