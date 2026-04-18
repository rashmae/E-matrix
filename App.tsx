/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './Login';
import Dashboard from './Dashboard';
import Catalog from './Catalog';
import SubjectDetail from './SubjectDetail';
import Progress from './Progress';
import Bulletin from './Bulletin';
import Calendar from './Calendar';
import Resources from './Resources';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import SpotlightDemo from './SpotlightDemo';
import StudyTools from './StudyTools';
import AIAssistant from './AIAssistant';

export default function App() {
  return (
    <Router>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:bg-ctu-gold focus:text-white focus:rounded-lg focus:font-bold focus:shadow-xl"
      >
        Skip to content
      </a>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/:id" element={<SubjectDetail />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/study" element={<StudyTools />} />
        <Route path="/bulletin" element={<Bulletin />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/demo" element={<SpotlightDemo />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" theme="dark" />
      <AIAssistant />
    </Router>
  );
}
