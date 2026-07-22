import React, { useState } from 'react';
import { Flame, BookOpen, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

export default function Analytics() {
  const [syllabusCompletion] = useState([]);

  const handleExport = () => {
    toast.info('Report Export prepared', {
      description: 'Analytics compiled reports will connect to server compiler modules in the next phase.',
    });
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Title Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Performance Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tracking your cognitive growth, study time habits, and milestone mastery levels.
          </p>
        </div>
        <Button
          onClick={handleExport}
          size="sm"
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 h-9 rounded-lg shadow-md shadow-primary/10 transition-all flex items-center gap-1.5 active:scale-98 text-xs"
        >
          <span>Export Report</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </section>

      {/* Bento Stats & Graphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Streak Metric Card */}
        <Card className="md:col-span-4 lg:col-span-3 bg-card border-border/40 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm rounded-xl">
          <div className="absolute -top-6 -right-6 w-16 h-16 bg-tertiary-container/5 rounded-full blur-xl"></div>
          <div className="w-12 h-12 bg-muted text-muted-foreground rounded-xl flex items-center justify-center mb-3 shrink-0 shadow-sm">
            <Flame className="h-5 w-5" />
          </div>
          <span className="text-4xl font-black text-foreground tracking-tight leading-none block">0</span>
          <span className="text-xs font-bold text-muted-foreground block mt-1.5">Day Streak</span>
          <span className="text-[10px] text-muted-foreground block mt-1 leading-relaxed">
            Start studying daily to build your learning streak.
          </span>
        </Card>

        {/* Study Hours Bar Chart */}
        <Card className="md:col-span-8 lg:col-span-6 bg-card border-border/40 p-4 shadow-sm flex flex-col justify-between rounded-xl">
          <div className="flex justify-between items-start pb-3 border-b border-border/40">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Study Time
              </span>
              <span className="text-lg font-black text-foreground block">0 Hours</span>
            </div>
            <span className="px-2 py-0.5 bg-muted text-muted-foreground font-bold rounded-full text-[9px] flex items-center gap-1">
              <span>No study logs</span>
            </span>
          </div>

          {/* Empty Bar Chart area */}
          <div className="flex items-center justify-center h-24 pt-4 w-full text-center">
            <p className="text-[11px] text-muted-foreground">Study logs will display here as you complete modules.</p>
          </div>
        </Card>

        {/* Quiz Avg Score Card */}
        <Card className="md:col-span-12 lg:col-span-3 bg-card border-border/40 p-4 flex flex-col justify-between shadow-sm relative overflow-hidden rounded-xl">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Quiz Accuracy
            </span>
            <span className="text-3xl font-black text-foreground block">0%</span>
            <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <span>No quizzes completed</span>
            </p>
          </div>

          <div className="space-y-3 pt-3">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span>Tests Completed</span>
              <span className="font-bold text-foreground">0 Quizzes</span>
            </div>
            <div className="h-6 bg-muted/20 border border-dashed border-border/40 rounded-lg flex items-center justify-center">
              <span className="text-[9px] text-muted-foreground">No quiz scores recorded</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Syllabus Completion list */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">Syllabus Completion</h3>
        {syllabusCompletion.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Courses completion modules would render dynamically here */}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No syllabus metrics"
            description="Complete learning roadmap tasks to monitor your course syllabus completion progress."
          />
        )}
      </section>
    </div>
  );
}
