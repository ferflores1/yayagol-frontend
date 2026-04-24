import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '../services/api';

export default function GroupPredictions() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState<any>({ users: [], matches: [] });
  const groupId = localStorage.getItem('selectedGroup');
  const [dates, setDates] = useState<string[]>([]);

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
        <h1 className="text-3xl font-black text-white">Predicciones del Grupo</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-[20px] -mt-3">

        {/* Date tabs */}
        <div className="overflow-x-auto border-b-[1.5px] border-[#E8F2F0] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex whitespace-nowrap px-1">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
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
                {data.matches.map((m: any) => (
                  <th key={m.id} className="bg-[#184A42] px-2.5 py-2.5 text-[10px] font-bold tracking-[.08em] uppercase text-white/60 min-w-[76px]">
                    {m.team1} vs {m.team2}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map((user: any) => (
                <tr key={user.id} className="group">
                  <td className="sticky left-0 z-[2] bg-white group-hover:bg-[#F5FAF9] border-r-[1.5px] border-[#E8F2F0] border-b-[1.5px] border-b-[#F5FAF9] px-4 py-2.5 text-[13px] font-bold text-[#184A42] transition-colors">
                    {user.name}
                  </td>
                  {data.matches.map((m: any) => {
                    const pred = user.predictions?.[m.id];
                    return (
                      <td key={m.id} className="border-b-[1.5px] border-[#F5FAF9] px-2.5 py-2.5 text-center bg-white group-hover:bg-[#FAFCFC] transition-colors">
                        {pred
                          ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-extrabold tracking-[.04em] bg-[#E8F2F0] text-[#184A42]">
                              {pred.score1}–{pred.score2}
                            </span>
                          : <span className="text-[rgba(24,74,66,0.25)] text-base font-bold">—</span>
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <p className="text-[11px] font-medium text-[rgba(24,74,66,0.45)] px-4 py-3">
        * Los resultados de los demás participantes aparecen al momento del inicio de los partidos.
      </p>

      <Footer />
    </div>
  );
}