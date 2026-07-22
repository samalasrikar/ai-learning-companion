import React, { useState } from 'react';
import { Milestone, Sparkles, CheckCircle2, PlayCircle, Lock, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

export default function LearningRoadmap() {
  const [goal, setGoal] = useState('');
  const [milestones, setMilestones] = useState([]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    toast.info('Roadmap Planner prepared', {
      description: `The curriculum planner is ready. Generating a roadmap for "${goal}" will connect to AI services in the next phase.`,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4.5 w-4.5 text-primary-foreground fill-current" />;
      case 'in-progress':
        return <PlayCircle className="h-4.5 w-4.5 text-primary-foreground fill-current animate-pulse" />;
      default:
        return <Lock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground border-border/40';
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title Header */}
      <section>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          Build Your Path to Mastery
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
          Define your target and let our AI curate a personalized learning trajectory optimized for your current skill level.
        </p>
      </section>

      {/* Goal Generator Bar */}
      <Card className="bg-card border-border/40 p-4 relative overflow-hidden shadow-sm rounded-xl">
        <form onSubmit={handleGenerate} className="relative z-10 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              What do you want to learn?
            </label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Become a Senior Frontend Architect with focus on Performance"
              className="bg-muted/30 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-lg py-2 h-9 text-xs text-foreground w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={!goal.trim()}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 px-4 rounded-lg transition-all shadow-md shadow-primary/20 shrink-0 flex items-center gap-1.5 text-xs active:scale-98"
          >
            <span>Generate Roadmap</span>
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
        </form>
        {/* Backdrop visual style decoration */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-primary/5 rounded-full blur-3xl"></div>
      </Card>

      {/* Roadmap Timeline nodes list */}
      {milestones.length > 0 ? (
        <div className="relative pl-6 border-l border-border/40 ml-3 py-2 space-y-8">
          {milestones.map((step) => (
            <div key={step.id} className="relative group">
              {/* Timeline bullet icon */}
              <div
                className={`absolute -left-[31px] top-1 w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 border z-10 shadow-sm ring-4 ring-background transition-all duration-300 ${
                  step.status === 'completed'
                    ? 'bg-primary border-primary'
                    : step.status === 'in-progress'
                    ? 'bg-primary border-primary'
                    : 'bg-muted border-border'
                }`}
              >
                {getStatusIcon(step.status)}
              </div>

              {/* Stage Card */}
              <Card className="bg-card border-border/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm p-4 space-y-3 rounded-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-3">
                  <div className="space-y-0.5">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-[9px] uppercase tracking-wider">
                      {step.phase}
                    </span>
                    <h4 className="text-sm font-extrabold text-foreground tracking-tight block mt-0.5">
                      {step.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto text-[11px]">
                    <div className="flex items-center gap-1 text-muted-foreground font-semibold">
                      <Hourglass className="h-3 w-3" />
                      <span>{step.duration}</span>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] ${getStatusBadge(step.status)}`}>
                      {step.status === 'completed' ? 'Completed' : step.status === 'in-progress' ? 'Active' : 'Locked'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Grid detail metrics: objectives list & progress bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 bg-muted/30 border border-border/40 rounded-lg space-y-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Learning Objectives
                    </span>
                    <ul className="space-y-1">
                      {step.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <span className="w-1 h-1 bg-primary rounded-full shrink-0"></span>
                          <span className="truncate">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-muted/30 border border-border/40 rounded-lg flex flex-col justify-center gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                      <span>Mastery Progress</span>
                      <span className="font-bold text-foreground">{step.progress}%</span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`bg-primary h-full rounded-full transition-all duration-500`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-left max-w-4xl">
          <EmptyState
            icon={Milestone}
            title="No roadmap generated yet"
            description="Enter a learning objective in the form above to generate a customized step-by-step master plan."
          />
        </div>
      )}
    </div>
  );
}
