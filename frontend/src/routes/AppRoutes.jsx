import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Chat from '../pages/Chat';
import Documents from '../pages/Documents';
import QuizGenerator from '../pages/QuizGenerator';
import LearningRoadmap from '../pages/LearningRoadmap';
import Analytics from '../pages/Analytics';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="documents" element={<Documents />} />
        <Route path="quiz" element={<QuizGenerator />} />
        <Route path="roadmap" element={<LearningRoadmap />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
