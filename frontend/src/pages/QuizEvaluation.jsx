import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  PlusCircle,
  BarChart3,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getQuizById, generateQuiz } from '../services/quiz.service';

export default function QuizEvaluation() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const loadedQuiz = getQuizById(quizId);
    if (!loadedQuiz) {
      toast.error('Quiz record not found.');
      navigate('/student/quiz');
      return;
    }
    setQuiz(loadedQuiz);
  }, [quizId, navigate]);

  if (!quiz) return null;

  const score = quiz.scorePercentage || 0;
  const questions = quiz.questions || [];
  const correctCount = quiz.correctCount || 0;
  const totalCount = questions.length;
  const timeSpentMins = Math.ceil((quiz.timeSpentSeconds || 0) / 60);

  const handleRetake = async () => {
    try {
      const newQuiz = await generateQuiz({
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questionCount: quiz.questionCount,
        sourceDoc: quiz.sourceDoc,
      });
      toast.success('Retake session created!');
      navigate(`/student/quiz/take/${newQuiz.id}`);
    } catch (err) {
      toast.error('Failed to create retake quiz session.');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto text-left py-2">
      {/* Back & Header Nav */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <Link
            to="/student/quiz"
            className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Quiz Generator</span>
          </Link>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
            Evaluation & Score Analysis
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Detailed performance breakdown and conceptual feedback for &quot;{quiz.title}&quot;
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRetake}
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold px-3.5 rounded-xl border-border/60 hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5 text-primary" />
            <span>Retake Quiz</span>
          </Button>
          <Link to="/student/quiz">
            <Button size="sm" className="h-9 text-xs font-bold px-3.5 rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Assessment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Scorecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Score Badge Card */}
        <Card className="md:col-span-4 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Score Summary
            </span>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {score}%
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                ({correctCount}/{totalCount} Correct)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-between text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block">Time Spent</span>
              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {timeSpentMins} mins
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block">Accuracy</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {score >= 80 ? 'Mastery Level' : score >= 60 ? 'Passing' : 'Needs Practice'}
              </span>
            </div>
          </div>
        </Card>

        {/* AI Performance Feedback Summary */}
        <Card className="md:col-span-8 bg-card border-border/50 p-5 rounded-2xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Conceptual Feedback</span>
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {quiz.analysis?.feedback || 'Your performance has been evaluated against indexed knowledge base concepts.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/30">
              <span className="text-[10px] font-semibold text-muted-foreground block">Correct Answers</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{correctCount}</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border border-border/30">
              <span className="text-[10px] font-semibold text-muted-foreground block">Incorrect Answers</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">{totalCount - correctCount}</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border border-border/30 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-muted-foreground block">Difficulty</span>
              <span className="text-sm font-extrabold text-foreground">{quiz.difficulty}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Itemized Question Review List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-base font-bold text-foreground">Detailed Question Review</h3>

        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const isCorrect = q.isCorrect;
            const selectedIdx = q.selectedAnswerIndex;

            return (
              <Card
                key={q.id || qIdx}
                className={`bg-card border p-5 rounded-2xl shadow-xs transition-all ${
                  isCorrect
                    ? 'border-emerald-500/30 dark:border-emerald-500/20'
                    : 'border-rose-500/30 dark:border-rose-500/20'
                }`}
              >
                {/* Question Header & Status Badge */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/30">
                  <h4 className="text-sm font-bold text-foreground leading-snug">
                    {qIdx + 1}. {q.question}
                  </h4>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Options Review List */}
                <div className="space-y-2 py-3">
                  {q.options.map((optionText, optIdx) => {
                    const isSelected = selectedIdx === optIdx;
                    const isTargetCorrect = q.correctAnswerIndex === optIdx;

                    let optionStyle = 'bg-card border-border/40 text-muted-foreground';
                    if (isTargetCorrect) {
                      optionStyle = 'bg-emerald-500/10 border-emerald-500/50 text-foreground font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-500/10 border-rose-500/50 text-foreground';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="truncate">{optionText}</span>
                        </div>

                        {isTargetCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                            Correct Answer
                          </span>
                        )}
                        {isSelected && !isTargetCorrect && (
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md shrink-0">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation & Source Citation */}
                <div className="bg-muted/30 p-3.5 rounded-xl border border-border/30 space-y-2 mt-2 text-xs">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-foreground block">Explanation:</span>
                      <p className="leading-relaxed mt-0.5">{q.explanation}</p>
                    </div>
                  </div>

                  {q.citation && (
                    <div className="pt-2 border-t border-border/20 text-[10px] font-bold text-primary flex items-center gap-1">
                      <span>Source Reference:</span>
                      <span className="bg-primary/10 px-2 py-0.5 rounded-md">{q.citation}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
