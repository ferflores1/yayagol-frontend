import { useState, useEffect } from 'react';
import { MatchScore, Match } from '../types';
import { getSSEUrl } from '../services/api';

export const useLiveScores = (liveMatches: Match[]) => {
  const [liveScores, setLiveScores] = useState<Map<number, MatchScore>>(new Map());

  useEffect(() => {
    if (liveMatches.length === 0) return;

    // Open one SSE connection per live match
    const sources = liveMatches.map(match => {
      const url = getSSEUrl(`/api/live/match/${match.matchId}`);
      const source = new EventSource(url, { withCredentials: true });

      // Listen for goal events
      source.addEventListener('goal', (e) => {
        const data = JSON.parse(e.data);
        setLiveScores(prev => {
          const next = new Map(prev);
          next.set(match.matchId, {
            homeGoals: data.homeScore,
            awayGoals: data.awayScore
          });
          return next;
        });
      });

      // Close connection when match finishes
      source.addEventListener('match_finished', () => {
        source.close();
      });

      source.onerror = () => {
        console.error(`SSE error for match ${match.matchId}`);
        source.close();
      };

      return source;
    });

    // Cleanup all connections when leaving the page
    return () => sources.forEach(s => s.close());

  }, [liveMatches]);

  return liveScores;
};