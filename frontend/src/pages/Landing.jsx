import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, MessageSquareText, FileText, HelpCircle, Map, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/constants/app.constants';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Responsive Public Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <Brain className="w-7 h-7 text-blue-500" />
            <span>{APP_NAME}</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-blue-400 transition-colors">How it works</a>
            <Link to="/student" className="hover:text-blue-400 transition-colors">Student Hub</Link>
            <Link to="/admin" className="hover:text-blue-400 transition-colors">Admin Panel</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link to="/student" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Next Generation AI Tutor
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Learn Smarter with {APP_NAME} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{APP_TAGLINE}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Upload course materials, ask instant document questions, generate adaptive quizzes, and map step-by-step learning roadmaps in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/student/chat" className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3">
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/student/documents" className="h-12 px-8 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Master Any Subject</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Powered by advanced RAG context retrieval and structured tutor prompt engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link to="/student/chat" className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive AI Tutor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engage with a friendly tutor persona designed to explain complex topics concisely with examples.
            </p>
          </Link>

          {/* Card 2 */}
          <Link to="/student/documents" className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">PDF Document Grounding</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload PDFs and chat directly with document content with zero hallucination.
            </p>
          </Link>

          {/* Card 3 */}
          <Link to="/student/quiz" className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Quiz Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instantly create multiple-choice practice quizzes tailored to your active study materials.
            </p>
          </Link>

          {/* Card 4 */}
          <Link to="/student/roadmap" className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 hover:border-blue-500/50 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Learning Roadmaps</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate structured, step-by-step learning roadmaps with clear skill milestones.
            </p>
          </Link>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-6 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Accelerate Your Learning?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join students and researchers using {APP_NAME} to study smarter.
          </p>
          <Link to="/student" className="inline-flex items-center gap-3 h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-blue-600/30">
            <span>Explore Student Hub</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        © 2026 {APP_NAME}. {APP_TAGLINE}. All rights reserved.
      </footer>
    </div>
  );
}
