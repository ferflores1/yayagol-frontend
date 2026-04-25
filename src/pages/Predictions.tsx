import { useState, useEffect, useMemo, useRef } from 'react';
import { useDateSwipe } from '../hooks/useDateSwipe';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useLiveScores } from '../hooks/userLiveScores';
import api from '../services/api';
import { Match } from '../types';

export default function Predictions() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, { homeGoals: string; awayGoals: string }>>(new Map());
  const [savedMatches, setSavedMatches] = useState<Set<number>>(new Set());
  const [disabledMatches, setDisabledMatches] = useState<Set<number> | null>(null);
  const groupId = localStorage.getItem('selectedGroup');
  const liveMatches = useMemo(() => matches.filter(m => m.gameStatus === 'LIVE'), [matches]);
  const liveScores = useLiveScores(liveMatches);
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
    if (selectedDate) loadMatches();
    const interval = setInterval(() => {
      if (selectedDate) loadMatches();
    }, 30_000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const loadMatches = async () => {
    try {
      const response = await api.get(`/matches?date=${selectedDate}`);
      setMatches(response.data);
      await loadPredictions(response.data.map((m: Match) => m.matchId));
      const disabledRes = await api.get(`/matches/pred-disabled?date=${selectedDate}`);
      const disabledIds = new Set<number>(disabledRes.data.map((m: Match) => m.matchId));
      setDisabledMatches(disabledIds);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadPredictions = async (matchIds: number[]) => {
    try {
      const response = await api.get(`/predictions?matchIds=${matchIds.join(',')}&groupId=${groupId}`);
      const map = new Map<number, { homeGoals: string; awayGoals: string }>();
      response.data.forEach((p: any) => {
        map.set(p.matchId, { homeGoals: p.homeGoals.toString(), awayGoals: p.awayGoals.toString() });
      });
      setPredictions(prev => {
        const merged = new Map(map);
        prev.forEach((val, matchId) => {
          if (val.homeGoals !== '' || val.awayGoals !== '') merged.set(matchId, val);
        });
        return merged;
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const savePrediction = async (matchId: number) => {
    const pred = predictions.get(matchId);
    if (!pred?.homeGoals || !pred?.awayGoals) {
      alert('Ingresa goles de ambos equipos.');
      return;
    }
    try {
      await api.post('/predictions', {
        matchId,
        homeGoals: parseInt(pred.homeGoals),
        awayGoals: parseInt(pred.awayGoals),
        groupId: groupId ? parseInt(groupId) : null,
      });
      setSavedMatches(prev => new Set(prev).add(matchId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updatePrediction = (matchId: number, field: 'homeGoals' | 'awayGoals', value: string) => {
    const current = predictions.get(matchId) || { homeGoals: '', awayGoals: '' };
    setPredictions(new Map(predictions.set(matchId, { ...current, [field]: value })));
    setSavedMatches(prev => {
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  };

  const formatDate = (date: string) =>
    new Date(date + 'T12:00:00').toLocaleDateString('es', {
      weekday: 'short', day: 'numeric', month: 'short',
    });

  return (
    <div ref={pageRef} className="min-h-screen pb-28" style={{ background: '#ffffff' }}>

      {/* ── Header ── */}
      <header style={{ background: '#184A42' }}>
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-10 flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate('/my-groups')}
              className="mb-3 rounded-full p-2.5 bg-white/[0.12] flex items-center justify-center"
              aria-label="Back"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Quiniela Yayagol - Mundial 2026
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight">Mis Predicciones</h1>
          </div>
        </div>
      </header>

      {/* ── Date tabs overlapping header ── */}
      <div
        className="sticky top-0 z-10 -mt-5 mx-4 max-w-2xl md:mx-auto rounded-2xl overflow-hidden shadow-sm"
        style={{ background: '#ffffff', border: '1px solid #E8F2F0' }}
      >
        <div ref={tabBarRef} className="flex overflow-x-auto scrollbar-hide" style={{ touchAction: 'pan-x' }}>
          {dates.map((date) => {
            const isActive = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                data-active={isActive}
                className="px-4 py-3 text-sm whitespace-nowrap font-semibold transition shrink-0"
                style={{
                  color: isActive ? '#184A42' : 'rgba(24,74,66,0.4)',
                  borderBottom: isActive ? '2.5px solid #184A42' : '2.5px solid transparent',
                  background: 'transparent',
                }}
              >
                {formatDate(date)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Match cards ── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-3">

        {/* Section label */}
        <div className="flex items-center gap-2.5 px-1 mt-1">
          <div className="w-1 h-4 rounded-full shrink-0" style={{ background: '#DE2C4C' }} />
          <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#184A42', opacity: 0.55 }}>
            Partidos del día
          </p>
        </div>

        {disabledMatches === null ? null : matches.map((match) => {
          const liveScore = liveScores.get(match.matchId);
          const pred = predictions.get(match.matchId) || { homeGoals: '', awayGoals: '' };
          const isLocked = disabledMatches.has(match.matchId);
          const isSaved = savedMatches.has(match.matchId);
          const isLive = match.gameStatus === 'LIVE';
          const isFinished = match.gameStatus === 'FINISHED';

          return (
            <div
              key={match.matchId}
              className="rounded-2xl transition"
              style={{
                background: '#ffffff',
                border: `1.5px solid ${isLive ? '#DE2C4C' : '#E8F2F0'}`,
                boxShadow: isLive
                  ? '0 2px 12px rgba(222,44,76,0.08)'
                  : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Card top bar: time + status */}
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-t-2xl"
                style={{ background: isLive ? 'rgba(222,44,76,0.05)' : '#F5FAF9', borderBottom: '1px solid #E8F2F0' }}
              >
                <p className="text-xs font-semibold" style={{ color: '#184A42', opacity: 0.6 }}>
                  {new Date(match.kickoffTime).toLocaleString('es', {
                    weekday: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: isLive ? 'rgba(222,44,76,0.1)' : '#E8F2F0',
                    color: isLive ? '#DE2C4C' : '#184A42',
                  }}
                >
                  {isLive && <span className="mr-1">●</span>}
                  {match.gameStatusLabel}
                </span>
              </div>

              {/* Match row */}
              <div className="px-4 py-4">
                <div className="grid grid-cols-3 items-center gap-3">

                  {/* Home team */}
                  <div className="flex flex-col items-center gap-1.5">
                    <img src={match.homeTeamLogo} className="w-10 h-10 object-contain" />
                    <p className="font-bold text-xs text-center leading-tight" style={{ color: '#111' }}>
                      {match.homeTeam}
                    </p>
                  </div>

                  {/* Score inputs */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={pred.homeGoals}
                        onChange={(e) => updatePrediction(match.matchId, 'homeGoals', e.target.value.replace(/\D/g, ''))}
                        disabled={isLocked}
                        className="w-11 h-11 text-center text-lg font-black rounded-xl outline-none transition"
                        style={{
                          border: `2px solid ${isLocked ? '#E8F2F0' : '#184A42'}`,
                          color: isLocked ? '#aaa' : '#184A42',
                          background: isLocked ? '#F5FAF9' : '#ffffff',
                        }}
                      />
                      <span className="text-xs font-bold" style={{ color: 'rgba(24,74,66,0.35)' }}>vs</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={pred.awayGoals}
                        onChange={(e) => updatePrediction(match.matchId, 'awayGoals', e.target.value.replace(/\D/g, ''))}
                        disabled={isLocked}
                        className="w-11 h-11 text-center text-lg font-black rounded-xl outline-none transition"
                        style={{
                          border: `2px solid ${isLocked ? '#E8F2F0' : '#184A42'}`,
                          color: isLocked ? '#aaa' : '#184A42',
                          background: isLocked ? '#F5FAF9' : '#ffffff',
                        }}
                      />
                    </div>

                    {/* Live / finished actual score */}
                    {(isFinished || isLive) && (
                      <div
                        className="text-xs font-bold px-3 py-0.5 rounded-full"
                        style={{
                          background: isLive ? 'rgba(222,44,76,0.08)' : '#E8F2F0',
                          color: isLive ? '#DE2C4C' : '#184A42',
                        }}
                      >
                        {isLive && liveScore
                          ? `${liveScore.homeGoals} - ${liveScore.awayGoals}`
                          : `${match.matchScore?.homeGoals ?? '-'} - ${match.matchScore?.awayGoals ?? '-'}`}
                      </div>
                    )}
                  </div>

                  {/* Away team */}
                  <div className="flex flex-col items-center gap-1.5">
                    <img src={match.awayTeamLogo} className="w-10 h-10 object-contain" />
                    <p className="font-bold text-xs text-center leading-tight" style={{ color: '#111' }}>
                      {match.awayTeam}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card footer: save action */}
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-b-2xl"
                style={{ borderTop: '1px solid #E8F2F0' }}
              >
                {isSaved ? (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                      style={{ background: '#184A42' }}
                    >
                      ✓
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#184A42' }}>
                      Predicción guardada
                    </span>
                  </div>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => savePrediction(match.matchId)}
                  disabled={isSaved || isLocked}
                  className="px-5 py-1.5 rounded-full text-sm font-bold transition active:scale-95 disabled:opacity-30"
                  style={{
                    background: isSaved || isLocked ? '#E8F2F0' : '#F0B429',
                    color: isSaved || isLocked ? '#184A42' : '#ffffff',
                  }}
                >
                  {isSaved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
            </div>
          );
        })}
      </main>

      <Footer />
    </div>
  );
}