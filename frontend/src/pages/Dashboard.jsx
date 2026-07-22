import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Award,
  Milestone,
  ArrowRight,
  TrendingUp,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FeatureCard from '../components/common/FeatureCard';
import EmptyState from '../components/common/EmptyState';

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses] = useState([]);

  return (
    <div className="space-y-6 w-full text-left">
      {/* Welcome Banner */}
      <section className="bg-card border border-border/40 p-6 rounded-2xl relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 max-w-xl relative z-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Good morning, Alex.
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Ready to accelerate your learning? Upload study notes and documents to get started.
          </p>
        </div>
        <Button
          onClick={() => navigate('/roadmap')}
          size="sm"
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 h-9 rounded-lg shadow-md shadow-primary/10 shrink-0 transition-all flex items-center gap-1.5 group relative z-10"
        >
          <span>Get Started</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-primary-container/5 rounded-full blur-3xl"></div>
      </section>

      {/* Feature Bento Grid & Sidebar widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Bento Cards */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-base font-bold text-foreground tracking-tight">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FeatureCard
              title="AI Chat Interface"
              description="Deep dive into your study notes or ask the assistant any questions."
              icon={MessageSquare}
              to="/chat"
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <FeatureCard
              title="Upload Documents"
              description="Index PDFs, word docs, or text snippets into your private knowledge base."
              icon={FileText}
              to="/documents"
              iconBg="bg-primary-container/10"
              iconColor="text-primary-container"
            />
            <FeatureCard
              title="Quiz Generator"
              description="Test your mastery levels with instant custom assessments."
              icon={Award}
              to="/quiz"
              iconBg="bg-tertiary-container/10"
              iconColor="text-tertiary-container"
            />
            <FeatureCard
              title="Learning Roadmap"
              description="View your active milestones and structured paths to master subjects."
              icon={Milestone}
              to="/roadmap"
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
          </div>
        </div>

        {/* Right Side: Progress and Streaks */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-bold text-foreground tracking-tight">Active Metrics</h3>

          {/* Mastery Circular Progress Widget */}
          <Card className="bg-card border-border/40 shadow-sm p-4 flex items-center justify-between gap-3 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Syllabus Mastery
              </span>
              <span className="text-xl font-black text-foreground">0%</span>
              <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span>No active progress</span>
              </p>
            </div>
            <div className="relative h-14 w-14 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted"
                  strokeWidth="2.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary"
                  strokeWidth="3"
                  strokeDasharray="0, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-foreground">
                0%
              </div>
            </div>
          </Card>

          {/* Study Streak Card */}
          <Card className="bg-card border-border/40 shadow-sm p-4 flex items-center gap-4 relative overflow-hidden rounded-xl">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-destructive/5 rounded-full blur-xl"></div>
            <div className="p-3 bg-muted text-muted-foreground rounded-xl shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Study Streak
              </span>
              <span className="text-lg font-extrabold text-foreground block mt-0.5">0 Days</span>
              <span className="text-[9px] text-muted-foreground block mt-0.5">Start studying to build a streak</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Active Courses List */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">Active Courses / Modules</h3>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Courses will render dynamically here */}
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No active courses"
            description="Create a learning roadmap to partition your subjects into study modules."
            actionText="Create Roadmap"
            onAction={() => navigate('/roadmap')}
          />
        )}
      </section>
    </div>
  );
}
