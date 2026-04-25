import { useState, useEffect, useRef } from 'react';
import { useDateSwipe } from '../hooks/useDateSwipe';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '../services/api';

type MatchColumn = {
  id: number;
  team1: string;
  team2: string;
  gameStatus: string;
  score1: number | null;
  score2: number | null;
};

type UserPrediction = {
  hasPrediction: boolean;
  score1: number | null;
  score2: number | null;
};
type UserRow = { id: number; name: string; predictions: Record<string, UserPrediction> };
type PredictionColor = 'gold' | 'green' | 'gray';
type GroupData = {
  groupName?: string;
  currentUserId?: number;
  users: UserRow[];
  matches: MatchColumn[];
};

function getPredictionColor(pred: UserPrediction, match: MatchColumn): PredictionColor {
  const active = match.gameStatus === 'LIVE' || match.gameStatus === 'FINISHED';
  if (!active || match.score1 === null || match.score2 === null) return 'gray';
  if (pred.score1 === null || pred.score2 === null) return 'gray';
  if (pred.score1 === match.score1 && pred.score2 === match.score2) return 'green';
  const predResult = Math.sign(pred.score1 - pred.score2);
  const actualResult = Math.sign(match.score1 - match.score2);
  if (predResult === actualResult) return 'gold';
  return 'gray';
}

const PILL_STYLES: Record<PredictionColor, { background: string; color: string }> = {
  gold:  { background: '#FFF3CD', color: '#9A6700' },
  green: { background: '#D1FAE5', color: '#065F46' },
  gray:  { background: '#E8F2F0', color: '#184A42' },
};

function PredictionCell({ pred, match, isCurrentUser }: {
  pred: UserPrediction | undefined;
  match: MatchColumn;
  isCurrentUser: boolean;
}) {
  // No prediction made at all
  if (!pred?.hasPrediction) {
    return <span className="text-[rgba(24,74,66,0.25)] text-base font-bold">—</span>;
  }

  // Other user + scheduled → scores are null on purpose, show checkmark only
  if (!isCurrentUser && match.gameStatus === 'SCHEDULED') {
    return (
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-full"
        style={{ background: '#E8F2F0' }}
        title="Predicción realizada"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-5"
            stroke="#184A42"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  // Current user always sees their score; everyone sees scores once match starts
  const color = getPredictionColor(pred, match);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-extrabold tracking-[.04em]"
      style={PILL_STYLES[color]}
    >
      {pred.score1}–{pred.score2}
    </span>
  );
}

export default function GroupPredictions() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState<GroupData>({ users: [], matches: [] });
  const groupId = localStorage.getItem('selectedGroup');
  const [dates, setDates] = useState<string[]>([]);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const pageRef = useDateSwipe({ dates, selectedDate, setSelectedDate, tabBarRef });

  useEffect(() => {
    api.get('/matches/dates').then(res => {
      setDates(res.data);
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
      const todayExists = res.data.find((d: string) => d === today);
      setSelectedDate(todayExists ? today : res.data[0]);
    });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!groupId) return;
        const response = await api.get(`/group-predictions?date=${selectedDate}&groupId=${groupId}`);
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const validateAndLoad = async () => {
      if (!groupId) return;
      const groupsRes = await api.get('/quiniela/my-groups');
      const belongsToUser = groupsRes.data.some((g: any) => g.id.toString() === groupId);
      if (!belongsToUser) { localStorage.removeItem('selectedGroup'); return; }
      loadData();
    };

    if (selectedDate) validateAndLoad();
    const interval = setInterval(() => { if (selectedDate) loadData(); }, 30_000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  return (
    <div ref={pageRef} className="min-h-screen bg-white pb-20">

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
        <h1 className="text-3xl font-black text-white">Predicciones del Grupo</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-[20px] -mt-3">

        {/* Date tabs */}
        <div ref={tabBarRef} className="overflow-x-auto border-b-[1.5px] border-[#E8F2F0] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex whitespace-nowrap px-1">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                data-active={date === selectedDate}
                className={`px-3 py-2.5 text-[11px] font-bold tracking-[.05em] uppercase border-b-2 transition-all ${
                  date === selectedDate
                    ? 'text-[#184A42] border-[#DE2C4C]'
                    : 'text-[rgba(24,74,66,0.45)] border-transparent'
                }`}
              >
                {new Date(date + 'T12:00:00').toLocaleDateString('es', {
                  weekday: 'short', day: 'numeric', month: 'short',
                })}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="border-collapse" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-[3] bg-[#184A42] text-left px-4 py-2.5 text-[10px] font-bold tracking-[.08em] uppercase text-white/55 min-w-[100px]">
                  Jugador
                </th>
                {data.matches.map((m) => (
                  <th key={m.id} className="bg-[#184A42] px-2.5 py-2.5 min-w-[76px]">
                    <div className="text-[10px] font-bold tracking-[.08em] uppercase text-white/60">
                      {m.team1} vs {m.team2}
                    </div>
                    {(m.gameStatus === 'LIVE' || m.gameStatus === 'FINISHED') &&
                      m.score1 !== null && m.score2 !== null && (
                      <div className={`mt-1 text-[11px] font-black ${
                        m.gameStatus === 'LIVE' ? 'text-[#DE2C4C]' : 'text-white/80'
                      }`}>
                        {m.score1}–{m.score2}
                        {m.gameStatus === 'LIVE' && (
                          <span className="ml-1 text-[9px] font-bold opacity-70">EN VIVO</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => {
                const isCurrentUser = user.id === data.currentUserId;
                return (
                  <tr key={user.id} className="group">
                    <td className={`sticky left-0 z-[2] border-r-[1.5px] border-[#E8F2F0] border-b-[1.5px] border-b-[#F5FAF9] px-4 py-2.5 text-[13px] font-bold text-[#184A42] transition-colors ${
                      isCurrentUser ? 'bg-[#F5FAF9]' : 'bg-white group-hover:bg-[#F5FAF9]'
                    }`}>
                      {user.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-[9px] font-bold text-[rgba(24,74,66,0.4)] uppercase tracking-wide">tú</span>
                      )}
                    </td>
                    {data.matches.map((m) => (
                      <td key={m.id} className={`border-b-[1.5px] border-[#F5FAF9] px-2.5 py-2.5 text-center transition-colors ${
                        isCurrentUser ? 'bg-[#FAFCFC]' : 'bg-white group-hover:bg-[#FAFCFC]'
                      }`}>
                        <PredictionCell
                          pred={user.predictions?.[String(m.id)]}
                          match={m}
                          isCurrentUser={isCurrentUser}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] font-medium text-[rgba(24,74,66,0.45)] px-4 py-3">
        ** Los resultados de los demás participantes aparecen al momento del inicio de los partidos.
      </p>

      <Footer />
    </div>
  );
}
