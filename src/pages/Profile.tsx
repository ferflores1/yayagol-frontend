import { useState, useEffect } from 'react';
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
      await api.put('/auth/user/update', null, { params: { name, email } });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (error) {
      console.log('Error saving');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* Header */}
      <div className="bg-[#184A42] px-4 pt-5 pb-14">
        <p className="text-[10px] font-bold tracking-[.18em] uppercase text-white/45 mb-1">
          Quiniela Yayagol
        </p>
        <h1 className="text-3xl font-black text-white">Mi Perfil</h1>
      </div>

      {/* Content */}
      <div className="bg-white rounded-t-[20px] -mt-3 max-w-2xl mx-auto px-4">

        {/* Avatar — overlaps header */}
        <div className="flex justify-center -mt-9 mb-3">
          <div className="w-[72px] h-[72px] rounded-full bg-[#E8F2F0] border-[3px] border-white flex items-center justify-center text-[38px] shadow-[0_2px_12px_rgba(24,74,66,0.10)]">
            {emoji}
          </div>
        </div>

        {/* Name display */}
        <p className="text-center text-[22px] font-black text-[#184A42] mb-6">{name}</p>

        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#DE2C4C] rounded-full" />
          <span className="text-[10px] font-bold tracking-[.15em] uppercase text-[rgba(24,74,66,0.55)]">
            Mis datos
          </span>
        </div>

        {/* Fields */}
        <div className="space-y-4">

          {/* Name input */}
          <div>
            <label className="block text-[10px] font-bold tracking-[.12em] uppercase text-[rgba(24,74,66,0.55)] mb-1.5">
              Nombre
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-[#184A42] text-[14px] font-bold text-[#184A42] outline-none bg-white"
              />
              {saved && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#184A42] font-black text-base animate-pulse">
                  ✓
                </span>
              )}
            </div>
          </div>

          {/* Email input — locked */}
          <div>
            <label className="block text-[10px] font-bold tracking-[.12em] uppercase text-[rgba(24,74,66,0.55)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E8F2F0] bg-[#F5FAF9] text-[14px] font-bold text-[#aaa] cursor-not-allowed outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-4 rounded-full bg-[#E8F2F0] text-[#184A42] font-bold text-[15px] border-[1.5px] border-[#BDD9D5]">
              Cancelar
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 py-4 rounded-full bg-[#F0B429] text-white font-bold text-[15px] shadow-md"
            >
              Guardar
            </button>
          </div>

        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button onClick={logout} className="text-[#DE2C4C] text-[13px] font-bold">
            Cerrar Sesión
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
}