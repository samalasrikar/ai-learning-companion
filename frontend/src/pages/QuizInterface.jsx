import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Flag,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getQuizById, submitQuizEvaluation } from '../services/quiz.service';

export default function QuizInterface() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadedQuiz = getQuizById(quizId);
    if (!loadedQuiz) {
      toast.error('Quiz session not found.');
      navigate('/student/quiz');
      return;
    }
    setQuiz(loadedQuiz);
    if (loadedQuiz.userAnswers) {
      setUserAnswers(loadedQuiz.userAnswers);
    }
  }, [quizId, navigate]);

  // Live timer interval
  useEffect(() => {
    if (!quiz || quiz.status === 'completed') return;

    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < totalQuestions) {
      const confirmUnanswered = window.confirm(
        `You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`
      );
      if (!confirmUnanswered) return;
    }

    setIsSubmitting(true);
    try {
      submitQuizEvaluation(quiz.id, userAnswers, timeSpentSeconds);
      toast.success('Quiz submitted successfully!');
      navigate(`/student/quiz/results/${quiz.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto text-left py-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {quiz.topic}
          </span>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground mt-1">
            {quiz.title}
          </h2>
        </div>

        {/* Timer & Question Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-card border border-border/50 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-foreground">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span>{formatTimer(timeSpentSeconds)}</span>
          </div>

          <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-xl">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="bg-card border-border/50 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-base md:text-lg font-bold text-foreground leading-snug">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h3>

            <button
              type="button"
              onClick={() => toggleFlagQuestion(currentQuestion.id)}
              className={`p-2 rounded-xl transition-all border shrink-0 ${
                flaggedQuestions[currentQuestion.id]
                  ? 'bg-amber-500/10 text-amber-600 border-amber-300'
                  : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted'
              }`}
              title="Flag question for review"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = userAnswers[currentQuestion.id] === idx;
              const optionLetter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl text-left text-xs md:text-sm font-medium transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary/40'
                      : 'bg-card border-border/60 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="leading-relaxed">{optionText}</span>
                  </div>

                  {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="h-10 px-4 text-xs font-bold rounded-xl border-border/60 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-3">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              onClick={handleNext}
              className="h-10 px-5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              <span>Next Question</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="h-10 px-6 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
