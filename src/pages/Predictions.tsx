import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLiveScores } from '../hooks/userLiveScores';
import api from '../services/api';
import { Match } from '../types';

export default function Predictions() {
  const [selectedDate, setSelectedDate] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<number, { homeGoals: string; awayGoals: string }>>(new Map());
  const [savedMatches, setSavedMatches] = useState<Set<number>>(new Set());
  const [disabledMatches, setDisabledMatches] = useState<Set<number>>(new Set());
  const groupId = localStorage.getItem('selectedGroup');
  const liveMatches = useMemo(
    () => matches.filter(m => m.gameStatus === 'LIVE'),
    [matches]
  );
  const liveScores = useLiveScores(liveMatches);

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

      // Fetch prediction-disabled matches
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
      setPredictions(map);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const savePrediction = async (matchId: number) => {
    const pred = predictions.get(matchId);
    if (!pred?.homeGoals || !pred?.awayGoals) {
      alert('Enter both scores');
      return;
    }
    try {
      await api.post('/predictions', {
        matchId,
        homeGoals: parseInt(pred.homeGoals),
        awayGoals: parseInt(pred.awayGoals),
        groupId: groupId ? parseInt(groupId) : null
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Mis Predicciones" />
      <div className="bg-green-50 border-b border-green-100 sticky top-16">
        <div className="flex overflow-x-auto">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-3 text-sm whitespace-nowrap ${
                date === selectedDate ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 hover:text-primary'
              }`}
            >
              {new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}
            </button>
          ))}
        </div>
      </div>
      <main className="divide-y">
        {matches.map((match) => {
          const liveScore = liveScores.get(match.matchId);
          const pred = predictions.get(match.matchId) || { homeGoals: '', awayGoals: '' };
          const isLocked = disabledMatches.has(match.matchId);
          return (
            <div key={match.matchId} className="bg-white p-6">
              <p className="text-center text-sm text-gray-600 mb-4">{new Date(match.kickoffTime).toLocaleString()}</p>
              <div className="flex items-center justify-center gap-6 mb-4">
                <img src={match.homeTeamLogo} className="w-12 h-12 object-contain" />
                <div className="w-20 text-center"><p className="font-semibold">{match.homeTeam}</p></div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={pred.homeGoals}
                    onChange={(e) => updatePrediction(match.matchId, 'homeGoals', e.target.value.replace(/\D/g, ''))}
                    disabled={isLocked}
                    className={`w-14 h-14 text-center text-xl border-2 rounded focus:border-primary ${isLocked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : ''}`}
                  />
                  <span className="text-2xl text-gray-400">vs</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={pred.awayGoals}
                    onChange={(e) => updatePrediction(match.matchId, 'awayGoals', e.target.value.replace(/\D/g, ''))}
                    disabled={isLocked}
                    className={`w-14 h-14 text-center text-xl border-2 rounded focus:border-primary ${isLocked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="w-20 text-center"><p className="font-semibold">{match.awayTeam}</p></div>
                <img src={match.awayTeamLogo} className="w-12 h-12 object-contain" />
              </div>

              {/* Actual match score — live or finished */}
              {(match.gameStatus === 'FINISHED' || match.gameStatus === 'LIVE') && (
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-500">
                    {match.gameStatus === 'LIVE' ? 'En vivo: ' : 'Resultado: '}
                  </span>
                  <span className="font-bold text-primary">
                    {match.gameStatus === 'LIVE' && liveScore
                      ? `${liveScore.homeGoals} - ${liveScore.awayGoals}`
                      : `${match.matchScore?.homeGoals ?? '-'} - ${match.matchScore?.awayGoals ?? '-'}`
                    }
                  </span>
                </div>
              )}

             <div className="text-center">
               {savedMatches.has(match.matchId) && (
                 <div className="flex items-center justify-center gap-1 text-green-600 text-xs mb-1 font-medium">
                   <span>✓ Prediccion guardada</span>
                 </div>
               )}
               <span className={`px-3 py-1 rounded text-xs ${match.gameStatus === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                 {match.gameStatus}
               </span>
               <button
                 onClick={() => savePrediction(match.matchId)}
                 disabled={savedMatches.has(match.matchId) || isLocked}
                 className={`block mx-auto mt-2 text-sm ${savedMatches.has(match.matchId) || isLocked ? 'text-gray-300' : 'text-primary'}`}
               >
                 Guardar
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