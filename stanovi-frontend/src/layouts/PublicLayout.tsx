import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './layouts.scss';

const PublicLayout = () => {
  return (
    <>
      <header className='public-header'>
        <nav>
          <ul>
            <li>
              <Link to="/">O nama</Link>
            </li>
            <li>
              <Link to="/auth">Prijava</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;