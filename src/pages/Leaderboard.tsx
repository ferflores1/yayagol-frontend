import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '../services/api';
import { LeaderboardUser } from '../types';

// ── ScoringPanel untouched ──────────────────────────────────────────
const ScoringPanel = () => (
  <div className="md:w-48 md:shrink-0">
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md md:sticky md:top-6">
      <div className="hidden md:block bg-gradient-to-r from-[#de2c4c] to-[#7a1c2f] px-4 py-3">
        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Sistema de</p>
        <p className="text-white text-sm font-bold">Puntuación</p>
      </div>
      <div className="flex md:flex-col gap-2 p-3">
        <div className="flex-1 md:flex-none bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center gap-2">
          <span className="text-yellow-400 font-black text-2xl md:text-3xl leading-none shrink-0">+3</span>
          <div>
            <p className="text-gray-400 text-[9px] uppercase tracking-wider font-semibold hidden md:block">Puntos por</p>
            <p className="text-white text-[11px] md:text-xs font-bold leading-tight">Acertar Resultado</p>
          </div>
        </div>
        <div className="flex-1 md:flex-none bg-gray-800 rounded-lg p-3 border border-emerald-500/30 shadow-[0_0_10px_0px_rgba(16,185,129,0.12)] flex items-center gap-2">
          <span className="text-emerald-400 font-black text-2xl md:text-3xl leading-none shrink-0">+8</span>
          <div>
            <p className="text-gray-400 text-[9px] uppercase tracking-wider font-semibold hidden md:block">Puntos por</p>
            <p className="text-white text-[11px] md:text-xs font-bold leading-tight">Acertar Marcador Exacto</p>
            <span className="hidden md:inline-block mt-1 text-[9px] text-emerald-400 font-semibold bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20">
              ✦ Bonus
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
// ───────────────────────────────────────────────────────────────────

const rankNumStyle: Record<number, string> = {
  1: 'text-[#F0B429]',
  2: 'text-[#B0BEC5]',
  3: 'text-[#C07A4A]',
};

const rowStyle: Record<number, string> = {
  1: 'bg-[#FFFBF0]',
  2: 'bg-[#F9FAFA]',
  3: 'bg-[#FFF8F5]',
};

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const navigate = useNavigate();

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    try {
      const groupId = localStorage.getItem('selectedGroup');
      const response = await api.get(`/leaderboard?groupId=${groupId}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* Header */}
      <div className="bg-[#184A42] px-4 pt-5 pb-8">
        <button
          onClick={() => navigate('/my-groups')}
          className="mb-3 rounded-full p-2.5 bg-white/[0.12] flex items-center justify-center"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-[10px] font-bold tracking-[.18em] uppercase text-white/45 mb-1">
          Quiniela Yayagol
        </p>
        <h1 className="text-3xl font-black text-white">Tabla de Posiciones</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-[20px] -mt-3 px-4 pt-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start gap-4">

          {/* Scoring panel */}
          <div className="order-2 md:order-1">
            <ScoringPanel />
          </div>

          {/* Leaderboard */}
          <div className="order-1 md:order-2 flex-1">

            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#DE2C4C] rounded-full" />
              <span className="text-[11px] md:text-[12px] font-bold tracking-[.15em] uppercase text-[rgba(24,74,66,0.55)]">
                Clasificación
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border-[1.5px] border-[#EEF3F2] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#184A42]">
                    <th className="w-10 px-4 py-3 text-left text-[11px] md:text-[12px] font-bold tracking-[.12em] uppercase text-white/55">#</th>
                    <th className="px-4 py-3 text-left text-[11px] md:text-[12px] font-bold tracking-[.12em] uppercase text-white/55">Jugador</th>
                    <th className="px-4 py-3 text-right text-[11px] md:text-[12px] font-bold tracking-[.12em] uppercase text-white/55">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr
                      key={p.rank}
                      className={`border-b-[1.5px] border-[#F5FAF9] last:border-b-0 ${rowStyle[p.rank] ?? 'bg-white'}`}
                    >
                      <td className={`px-4 py-4 md:py-5 text-[14px] md:text-[16px] font-black ${rankNumStyle[p.rank] ?? 'text-[rgba(24,74,66,0.3)]'}`}>
                        {p.rank}
                      </td>
                      <td className="px-4 py-4 md:py-5 text-[15px] md:text-[17px] font-bold text-[#184A42]">
                        {p.name}
                      </td>
                      <td className="px-4 py-4 md:py-5 text-right">
                        <span className={`text-[16px] md:text-[18px] font-black ${p.rank === 1 ? 'text-[#F0B429]' : 'text-[rgba(24,74,66,0.55)]'}`}>
                          {p.points}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-bold tracking-[.1em] uppercase text-[rgba(24,74,66,0.35)] ml-0.5">
                          pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}