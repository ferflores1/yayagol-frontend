import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around py-2">
        <Link
          to="/predictions"
          className={`flex flex-col items-center gap-1 ${
            isActive('/predictions') ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <div
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
              isActive('/predictions') ? 'bg-primary text-white' : 'text-gray-400'
            }`}
          >
            1:2
          </div>
          <span className="text-xs font-medium">Predicciones</span>
        </Link>

        <Link
          to="/group-predictions"
          className={`flex flex-col items-center gap-1 ${
            isActive('/group-predictions') ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-xs">Pronósticos</span>
        </Link>

        <Link
          to="/leaderboard"
          className={`flex flex-col items-center gap-1 ${
            isActive('/leaderboard') ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
          <span className="text-xs">Tabla de Posiciones</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 ${
            isActive('/profile') ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}