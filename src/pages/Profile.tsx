import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api, { logout } from '../services/api';

export default function Profile() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
      api.get('/auth/me').then(res => {
        setName(res.data.name || '');
        setEmail(res.data.email || '');
      });
    }, []);

    const emoji = ['😊', '😎', '🤓', '😺', '🐶'][Math.floor(Math.random() * 5)];

    const saveProfile = async () => {
        try {
          await api.put('/auth/user/update', null, {
            params: { name, email }
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        } catch (error) {
          console.log('Error saving');
        }
    };

      return (
        <div className="min-h-screen bg-gray-50 pb-20">
          <Header title="Menu" />
          <main className="max-w-2xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-7xl">
                {emoji}
              </div>
              <h2 className="text-3xl font-bold">{name}</h2>
            </div>
            <div className="flex border-b mb-6">
              <button className="px-6 py-2 border-b-2 border-primary text-primary font-medium">Mis datos</button>
            </div>
            <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded"
                />
                {saved && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm text-xl font-medium animate-pulse">
                    ✓
                  </span>
                )}
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-200 rounded cursor-not-allowed text-gray-500"
                />
              </div>
              <div className="flex gap-4">
                <button className="flex-1 border-2 border-primary text-primary py-3 rounded font-semibold">
                  Cancelar
                </button>
                <button onClick={saveProfile} className="flex-1 bg-primary text-white py-3 rounded font-semibold">
                  Guardar
                </button>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button onClick={logout} className="text-red-500 font-medium">Cerrar Sesión</button>
            </div>
          </main>
          <Footer />
        </div>
      );
}