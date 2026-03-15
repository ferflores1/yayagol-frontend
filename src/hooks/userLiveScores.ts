import { useState } from 'react';
//import { useEffect, useState } from 'react';
//import { getSSEUrl } from '../services/api';
import { MatchScore } from '../types';

export const userLiveScores = () => {
  const [liveScores] = useState<Map<number, MatchScore>>(new Map());
  //const [liveScores, setLiveScores] = useState<Map<number, MatchScore>>(new Map());

//   useeffect(() => {
//     const eventsource = new eventsource(getsseurl('https://api.yayagol.com/api/matches/live-stream'), {
//       withcredentials: true,
//     });
//
//     eventSource.onmessage = (event) => {
//       try {
//         const score: MatchScore = JSON.parse(event.data);
//         setLiveScores((prev) => {
//           const newScores = new Map(prev);
//           newScores.set(score.matchId, score);
//           return newScores;
//         });
//       } catch (error) {
//         console.error('Error parsing SSE data:', error);
//       }
//     };
//
//     eventSource.onerror = (error) => {
//       console.error('SSE connection error:', error);
//       eventSource.close();
//     };
//
//     return () => {
//       eventSource.close();
//     };
//   }, []);

  return liveScores;
};