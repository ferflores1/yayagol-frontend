import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';

export default function GroupPredictions() {
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState<any>({ users: [], matches: [] });
  const groupId = localStorage.getItem('selectedGroup');
  const [dates, setDates] = useState<string[]>([]);


 useEffect(() => {
      api.get('/matches/dates').then(res => {
          setDates(res.data);
          if (res.data.length > 0) setSelectedDate(res.data[0]);
      });
  }, []);

  useEffect(() => {
    if (selectedDate) loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const response = await api.get(`/group-predictions?date=${selectedDate}&groupId=${groupId}`);

      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Predicciones del Grupo" />
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
      <main className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm">{data.groupName}</th>
              {data.matches.map((m: any) => (
                <th key={m.id} className="px-4 py-3 text-center text-sm">{m.team1} vs {m.team2}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.users.map((user: any) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">{user.name}</td>
                {data.matches.map((m: any) => {
                  const pred = user.predictions?.[m.id];
                  return (
                    <td key={m.id} className="px-4 py-3 text-center">
                      {pred ? <span className="bg-gray-100 px-3 py-1 rounded">{pred.score1}-{pred.score2}</span> : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <Footer />
    </div>
  );
}