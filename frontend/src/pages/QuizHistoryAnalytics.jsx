import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Award,
  Clock,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Eye,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import EmptyState from '../components/common/EmptyState';
import { getQuizHistory, deleteQuizFromHistory, generateQuiz } from '../services/quiz.service';

export default function QuizHistoryAnalytics() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setHistory(getQuizHistory());
  }, []);

  const handleDelete = (quizId, title) => {
    if (window.confirm(`Are you sure you want to delete the history record for "${title}"?`)) {
      const updated = deleteQuizFromHistory(quizId);
      setHistory(updated);
      toast.success('Quiz record deleted');
    }
  };

  const handleRetake = async (quiz) => {
    try {
      const newQuiz = await generateQuiz({
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        questionCount: quiz.questionCount,
        sourceDoc: quiz.sourceDoc,
      });
      toast.success('Retake session started!');
      navigate(`/student/quiz/take/${newQuiz.id}`);
    } catch (err) {
      toast.error('Failed to start retake session');
    }
  };

  // Filter & Search logic
  const filteredHistory = history.filter((q) => {
    const matchesSearch =
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ? true : q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate aggregated stats
  const completedQuizzes = history.filter((q) => q.status === 'completed');
  const totalCompleted = completedQuizzes.length;
  const avgScore = totalCompleted > 0
    ? Math.round(completedQuizzes.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) / totalCompleted)
    : 0;

  return (
    <div className="space-y-6 w-full text-left">
      {/* Top Header Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Quiz History & Performance Analytics</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track your assessment score trends, topic mastery, and review past practice tests.
          </p>
        </div>

        <Link to="/student/quiz">
          <Button size="sm" className="h-9 font-bold px-4 rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5 text-xs shadow-md">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Quiz</span>
          </Button>
        </Link>
      </section>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Quizzes</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">{history.length}</p>
          <span className="text-[10px] text-muted-foreground font-semibold block">
            {totalCompleted} Completed • {history.length - totalCompleted} In Progress
          </span>
        </Card>

        <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Score</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground">{avgScore}%</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            Across {totalCompleted} completed tests
          </span>
        </Card>

        <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Study Streak</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground">4 Days</p>
          <span className="text-[10px] text-muted-foreground font-semibold block">Active practice streak</span>
        </Card>

        <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-xs space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider">Concept Mastery</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground">High</p>
          <span className="text-[10px] text-muted-foreground font-semibold block">Based on RAG assessments</span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border/50 p-3 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quiz by topic or title..."
            className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex bg-muted/40 p-1 rounded-xl gap-1 text-xs">
            {['all', 'completed', 'in_progress'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] capitalize transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz History Cards / Table */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <Card
              key={item.id}
              className="bg-card border-border/50 p-4 rounded-2xl hover:border-primary/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {item.topic}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {item.questionCount} Questions • {item.difficulty} Difficulty • Source: {item.sourceDoc}
                </p>
              </div>

              {/* Action Buttons & Score Badge */}
              <div className="flex items-center gap-3 shrink-0 justify-end">
                {item.status === 'completed' ? (
                  <div className="text-right">
                    <span className="text-base font-black text-foreground block">
                      {item.scorePercentage}%
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Completed
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    In Progress
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {item.status === 'completed' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/student/quiz/results/${item.id}`)}
                      className="h-8 text-xs font-bold rounded-xl border-border/60 hover:bg-muted"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                      <span>Results</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/student/quiz/take/${item.id}`)}
                      className="h-8 text-xs font-bold rounded-xl bg-primary text-primary-foreground"
                    >
                      <span>Resume</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRetake(item)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                    title="Retake Quiz"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-xl"
                    title="Delete Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No quizzes match your filter"
          description="Try adjusting your search query or generate a new practice quiz."
          actionText="Create Quiz"
          onAction={() => navigate('/student/quiz')}
        />
      )}
    </div>
  );
}
