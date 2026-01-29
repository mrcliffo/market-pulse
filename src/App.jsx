/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Broadcast } from './pages/Broadcast.jsx';
import { BroadcastPortrait } from './pages/BroadcastPortrait.jsx';
import { Control } from './pages/Control.jsx';
import { Vote } from './pages/Vote.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/broadcast" element={<Broadcast />} />
        <Route path="/broadcast/portrait" element={<BroadcastPortrait />} />
        <Route path="/control" element={<Control />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/" element={<Navigate to="/vote" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
