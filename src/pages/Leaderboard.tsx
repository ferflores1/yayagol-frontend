import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import { LeaderboardUser } from '../types';

export default function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
      loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const groupId = localStorage.getItem('selectedGroup');
      const response = await api.get(`/leaderboard?groupId=${groupId}`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const rowColor = (rank: number, points: number) => {
    if (points === 0) return 'bg-white';
    if (rank === 1) return 'bg-yellow-50';
    if (rank === 2) return 'bg-gray-100';
    if (rank === 3) return 'bg-orange-50';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Tabla de Posiciones" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase">Posición</th>
                <th className="px-6 py-3 text-left text-xs uppercase">Nombre</th>
                <th className="px-6 py-3 text-right text-xs uppercase">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map((p, i) => {
                return (
                  <tr key={i} className={rowColor(p.rank, p.points)}>
                   <td className="px-6 py-4 font-bold text-gray-900">{p.rank}</td>
                    <td className="px-6 py-4 font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-right font-semibold">{p.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}