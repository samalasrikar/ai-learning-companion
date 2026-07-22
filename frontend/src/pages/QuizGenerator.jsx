import React, { useState } from 'react';
import { Sliders, Award, Lightbulb, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionsCount, setQuestionsCount] = useState(15);
  const [history] = useState([]); // Empty history list to remove mock records

  const handleGenerate = () => {
    toast.info('Quiz Generation prepared', {
      description: 'The front-end parameters are prepared. Quiz generation endpoints will be connected in the next phase.',
    });
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Page Title */}
      <section>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          Quiz Generator
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Test your memory and track your conceptual comprehension with custom AI-generated quizzes.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Quiz Config form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-card border-border/40 p-4 shadow-sm rounded-xl">
            <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-sm font-bold text-foreground">Configure Quiz</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {/* Subject Topic */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Topic or Subject
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Linear Algebra, Neural Networks"
                  className="bg-muted/30 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-lg py-2 h-9 text-xs"
                />
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      variant={difficulty === lvl ? 'default' : 'outline'}
                      onClick={() => setDifficulty(lvl)}
                      className={`h-8 rounded-lg text-xs font-semibold transition-all ${
                        difficulty === lvl
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'border-border/40 hover:bg-muted'
                      }`}
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Questions Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Question Count
                  </label>
                  <span className="text-xs font-extrabold text-primary">{questionsCount}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questionsCount}
                  onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>

              {/* Generate Trigger */}
              <Button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs active:scale-98"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Generate Quiz</span>
              </Button>
            </CardContent>
          </Card>

          {/* Helper Tips */}
          <Card className="bg-primary-container/10 border-primary-container/20 p-4 rounded-xl flex gap-3">
            <Lightbulb className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-primary">Pro Tip</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Quizzes are dynamically adapted from your indexed documents and notes to focus on your weak points.
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Quiz History (Starts empty) */}
        <div className="lg:col-span-7">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-foreground tracking-tight">Quiz History</h3>
            </div>
            {history.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {/* Historical records would go here */}
              </div>
            ) : (
              <EmptyState
                icon={Award}
                title="No quizzes generated yet"
                description="Use the configuration form on the left to create your first custom study quiz."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
