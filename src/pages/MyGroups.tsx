import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { QuinielaGroup } from '../types';

export default function MyGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<QuinielaGroup[]>([]);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
    
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await api.get('/quiniela/my-groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectGroup = (id: number) => {
    console.log('storing groupId:', id);
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
    <div className="min-h-screen bg-gray-50">
     <header className="bg-white border-b">
       <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
         <h1 className="text-xl font-semibold">Mis Grupos</h1>
         <button onClick={() => navigate('/profile')} className="text-gray-500 hover:text-primary transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
           </svg>
         </button>
       </div>
     </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-32">
        {groups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No se encontraron grupos</div>
        ) : (
          <div className="space-y-4">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => selectGroup(g.id)}
                className="bg-white rounded-lg p-4 cursor-pointer transition border border-gray-200 hover:bg-green-50 hover:shadow-md"
              >
                <h3 className="font-semibold text-lg">{g.name}</h3>
                <p className="text-sm text-gray-600">Users: {g.users}</p>
              </div>
            ))}
          </div>
        )}

        {showJoinInput && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={groupCode}
                onChange={(e) => {
                  setGroupCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && joinGroup()}
                placeholder="Codigo"
                autoFocus
                maxLength={10}
                className="w-36 px-3 py-2 border-2 border-gray-300 rounded focus:border-primary focus:outline-none text-sm tracking-widest font-mono text-center"
              />
              <button
                onClick={joinGroup}
                disabled={joining || !groupCode.trim()}
                className="bg-primary text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                {joining ? '...' : 'Unirme'}
              </button>
            </div>
            {joinError && (
              <p className="text-red-500 text-xs">{joinError}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              setShowJoinInput(!showJoinInput);
              setGroupCode('');
              setJoinError('');
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-opacity-90 transition"
          >
            <span className="text-2xl leading-none">{showJoinInput ? '−' : '+'}</span>
            <span className="font-semibold">{showJoinInput ? 'Cancelar' : 'Unirse a un grupo'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}