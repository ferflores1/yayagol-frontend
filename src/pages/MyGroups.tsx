import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QuinielaGroup } from '../types';

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.25 9.71 2 12 2c2.291 0 4.545.25 6.75.721v1.515m0 0a48.667 48.667 0 00-2.916-.52c.18.3.349.611.506.934m-.506-.934v.264c0 2.108-.966 3.99-2.48 5.228m2.986-5.758a6.003 6.003 0 015.396 5.492M18.75 4.236V4.5" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const rankBadge = (i: number) => {
  if (i === 0) return { bg: '#F0B429', color: '#fff', label: '1' };
  if (i === 1) return { bg: '#184A42', color: '#fff', label: '2' };
  if (i === 2) return { bg: '#184A42', color: '#fff', label: '3' };
  return { bg: '#E8F2F0', color: '#184A42', label: String(i + 1) };
};

export default function MyGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<QuinielaGroup[]>([]);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => { loadGroups(); }, []);

  const loadGroups = async () => {
    try {
      const response = await api.get('/quiniela/my-groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectGroup = (id: number) => {
    localStorage.setItem('selectedGroup', id.toString());
    navigate('/predictions');
  };

  const joinGroup = async () => {
    if (!groupCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      await api.post('/quiniela/join', { code: groupCode.trim() });
      await loadGroups();
      setGroupCode('');
      setShowJoinInput(false);
    } catch (error: any) {
      setJoinError(error.response?.data?.message || 'Codigo invalido. Intenta de nuevo.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#ffffff' }}>

      {/* ── Header ── */}
      <header style={{ background: '#184A42' }}>
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-10 flex items-start justify-between">
          <div>
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Quiniela Yayagol - Mundial 2026
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight">Mis Grupos</h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-1 rounded-full p-2.5 transition"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
          >
            <ProfileIcon />
          </button>
        </div>
      </header>

      {/* ── Lifted card area overlapping header ── */}
      <main className="max-w-2xl mx-auto px-4 -mt-5">

        {/* Stat pill row */}
        {groups.length > 0 && (
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-3 mb-5 shadow-sm"
            style={{ background: '#ffffff', border: '1px solid #E8F2F0' }}
          >
            <span style={{ color: '#F0B429' }}><TrophyIcon /></span>
            <div className="h-4 w-px" style={{ background: '#E8F2F0' }} />
            <p className="text-base font-semibold" style={{ color: '#184A42' }}>
              {groups.length} {groups.length === 1 ? 'quiniela activa' : 'quinielas activas'}
            </p>
            <div className="ml-auto flex -space-x-1.5">
              {groups.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black"
                  style={{ background: i === 0 ? '#F0B429' : '#184A42', color: '#fff' }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section label with red left bar */}
        <div className="flex items-center gap-2.5 mb-3 px-1">
          <div
            className="w-1 h-4 rounded-full shrink-0"
            style={{ background: '#DE2C4C' }}
          />
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase"
            style={{ color: '#184A42', opacity: 0.55 }}
          >
            Selecciona una quiniela
          </p>
        </div>

        {/* ── Group list ── */}
        {groups.length === 0 ? (
          <div
            className="rounded-2xl py-16 text-center"
            style={{ background: '#F5FAF9', border: '1.5px dashed #BDD9D5' }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#E8F2F0' }}
            >
              <span style={{ color: '#184A42' }}><TrophyIcon /></span>
            </div>
            <p className="font-bold text-base" style={{ color: '#184A42' }}>Aún no tienes grupos</p>
            <p className="text-sm mt-1" style={{ color: '#184A42', opacity: 0.45 }}>
              Únete a uno para empezar a competir
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {groups.map((g, i) => {
              const badge = rankBadge(i);
              const isTop3 = i < 3;
              return (
                <button
                  key={g.id}
                  onClick={() => selectGroup(g.id)}
                  className="w-full text-left rounded-2xl flex items-center gap-4 transition active:scale-[0.98]"
                  style={{
                    background: '#ffffff',
                    border: `1.5px solid ${isTop3 ? '#184A42' : '#EEF3F2'}`,
                    padding: '16px 18px',
                    boxShadow: isTop3 ? '0 2px 12px rgba(24,74,66,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base shrink-0"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate" style={{ color: '#111' }}>{g.name}</p>
                    <div className="flex items-center gap-1 mt-1" style={{ color: '#184A42', opacity: 0.6 }}>
                      <UsersIcon />
                      <span className="text-sm">{g.users} participantes</span>
                    </div>
                  </div>

                  <span style={{ color: isTop3 ? '#F0B429' : '#ccc' }}>
                    <ChevronRight />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Join flow ── */}
        {showJoinInput && (
          <div
            className="mt-4 rounded-2xl p-4"
            style={{ background: '#F5FAF9', border: '1.5px solid #BDD9D5' }}
          >
            <p
              className="text-xs font-bold tracking-[0.15em] uppercase mb-3"
              style={{ color: '#184A42' }}
            >
              Ingresa el código
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={groupCode}
                onChange={(e) => { setGroupCode(e.target.value.toUpperCase()); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && joinGroup()}
                placeholder="XXXXXX"
                autoFocus
                maxLength={10}
                className="flex-1 px-3 py-3 rounded-xl font-mono text-lg tracking-widest text-center font-bold outline-none"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #184A42',
                  color: '#184A42',
                }}
              />
              <button
                onClick={joinGroup}
                disabled={joining || !groupCode.trim()}
                className="px-5 py-3 rounded-xl font-bold text-base transition disabled:opacity-40"
                style={{ background: '#184A42', color: '#ffffff' }}
              >
                {joining ? '...' : 'Entrar'}
              </button>
            </div>
            {joinError && (
              <p className="mt-2 text-sm font-medium" style={{ color: '#DE2C4C' }}>{joinError}</p>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => { setShowJoinInput(!showJoinInput); setGroupCode(''); setJoinError(''); }}
            className="flex items-center gap-2 px-9 py-4 rounded-full font-bold text-base transition active:scale-95 shadow-md"
            style={
              showJoinInput
                ? { background: '#E8F2F0', color: '#184A42', border: '1.5px solid #BDD9D5' }
                : { background: '#F0B429', color: '#fff' }
            }
          >
            <span className="text-2xl leading-none font-black">{showJoinInput ? '−' : '+'}</span>
            <span>{showJoinInput ? 'Cancelar' : 'Unirse a una quiniela'}</span>
          </button>
        </div>

      </main>
    </div>
  );
}