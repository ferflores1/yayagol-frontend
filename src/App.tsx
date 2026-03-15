import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/api';
import MyGroups from './pages/MyGroups';
import Predictions from './pages/Predictions';
import GroupPredictions from './pages/GroupPredictions';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    isAuthenticated().then(setAllowed);
  }, []);

  if (allowed === null) return null;
  if (!allowed) {
    window.location.href = '/login.html';
    return null;
  }

  return <>{children}</>;
}



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Navigate to="/my-groups" replace /></ProtectedRoute>} />
        <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
        <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
        <Route path="/group-predictions" element={<ProtectedRoute><GroupPredictions /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/my-groups" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;