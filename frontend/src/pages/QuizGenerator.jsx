import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sliders,
  Sparkles,
  BookOpen,
  Award,
  BarChart3,
  Clock,
  CheckCircle2,
  FileText,
  Play,
  ArrowRight,
  History,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { generateQuiz, getQuizHistory } from '../services/quiz.service';

const PRESET_COUNTS = [5, 10, 20];
const CUSTOM_SENTINEL = 'custom';
const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 50;

export default function QuizGenerator() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('DevOps & Container Orchestration');
  const [difficulty, setDifficulty] = useState('Medium');

  // "selected" is one of the PRESET_COUNTS or CUSTOM_SENTINEL
  const [selectedPreset, setSelectedPreset] = useState(10);
  const [customCount, setCustomCount] = useState('');
  const [customCountError, setCustomCountError] = useState('');

  const [selectedSourceDoc, setSelectedSourceDoc] = useState('All Indexed Documents');
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [isGenerating, setIsGenerating] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [history, setHistory] = useState([]);

  // Derived: the actual integer count to use
  const resolvedQuestionCount = (() => {
    if (selectedPreset === CUSTOM_SENTINEL) {
      const parsed = parseInt(customCount, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedPreset;
  })();

  useEffect(() => {
    // Load uploaded documents from localStorage
    const storedDocs = localStorage.getItem('uploaded_documents');
    if (storedDocs) {
      try {
        setUploadedDocs(JSON.parse(storedDocs));
      } catch (e) {
        console.error(e);
      }
    }
    // Load quiz history
    setHistory(getQuizHistory());
  }, []);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    if (preset !== CUSTOM_SENTINEL) {
      setCustomCount('');
      setCustomCountError('');
    }
  };

  const handleCustomCountChange = (e) => {
    const raw = e.target.value;
    setCustomCount(raw);

    const parsed = parseInt(raw, 10);
    if (!raw.trim()) {
      setCustomCountError('Please enter a number.');
    } else if (isNaN(parsed) || !Number.isInteger(parsed)) {
      setCustomCountError('Must be a whole number.');
    } else if (parsed < MIN_QUESTIONS) {
      setCustomCountError(`Minimum is ${MIN_QUESTIONS} question.`);
    } else if (parsed > MAX_QUESTIONS) {
      setCustomCountError(`Maximum is ${MAX_QUESTIONS} questions.`);
    } else {
      setCustomCountError('');
    }
  };

  const validateBeforeGenerate = () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or subject.');
      return false;
    }
    if (selectedPreset === CUSTOM_SENTINEL) {
      const parsed = parseInt(customCount, 10);
      if (!customCount.trim() || isNaN(parsed)) {
        setCustomCountError('Please enter a valid number of questions.');
        toast.error('Enter a valid custom question count.');
        return false;
      }
      if (parsed < MIN_QUESTIONS || parsed > MAX_QUESTIONS) {
        setCustomCountError(`Must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.`);
        toast.error(`Question count must be between ${MIN_QUESTIONS} and ${MAX_QUESTIONS}.`);
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateBeforeGenerate()) return;

    const finalCount = resolvedQuestionCount;

    // DEV LOG
    console.log('[QuizGenerator] Selected Question Count:', finalCount);
    console.log('[QuizGenerator] API Payload:', {
      topic: topic.trim(),
      difficulty,
      questionCount: finalCount,
      questionType,
      sourceDoc: selectedSourceDoc,
    });

    setIsGenerating(true);
    const toastId = toast.loading(`Generating ${finalCount} quiz questions...`);

    try {
      const quiz = await generateQuiz({
        topic: topic.trim(),
        difficulty,
        questionCount: finalCount,
        questionType,
        sourceDoc: selectedSourceDoc,
      });

      // UI Validation: verify the generated count matches what was requested
      if (quiz.questions.length !== finalCount) {
        console.warn(
          `[QuizGenerator] Count mismatch — requested ${finalCount}, got ${quiz.questions.length}`
        );
      }

      toast.success(`Quiz generated! ${quiz.questions.length} questions ready.`, { id: toastId });
      setIsGenerating(false);
      navigate(`/student/quiz/take/${quiz.id}`);
    } catch (err) {
      console.error('[QuizGenerator] Generation error:', err);
      toast.error('Failed to generate quiz. Please try again.', { id: toastId });
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Top Header Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>AI Quiz Generator</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Configure custom practice assessments tailored to your study materials and learning goals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/student/quiz/history">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-semibold px-3.5 rounded-xl border-border/60 hover:bg-muted text-foreground flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>History &amp; Analytics</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Grid: Form Config & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quiz Parameters Form */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="bg-card border-border/50 p-5 shadow-sm rounded-2xl">
            <CardHeader className="p-0 pb-4 flex flex-row items-center gap-2.5 border-b border-border/40">
              <Sliders className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">Configure Assessment</CardTitle>
            </CardHeader>

            <CardContent className="p-0 pt-5 space-y-5">
              {/* 1. Select Knowledge Base / Source Document */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Source Context / Document</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {uploadedDocs.length} documents available
                  </span>
                </label>
                <select
                  value={selectedSourceDoc}
                  onChange={(e) => setSelectedSourceDoc(e.target.value)}
                  className="w-full h-10 px-3 bg-muted/30 border border-border/50 rounded-xl text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="All Indexed Documents">All Indexed Knowledge Base Documents</option>
                  {uploadedDocs.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.size})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Quiz Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Quiz Subject or Focus Topic
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Kubernetes Pod Lifecycle, Distributed Systems, Linear Algebra"
                  className="bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 text-xs font-medium"
                />
              </div>

              {/* 3. Difficulty Selection Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Easy', 'Medium', 'Hard'].map((level) => {
                    const isSelected = difficulty === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card border-border/60 hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Question Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Question Format
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Multiple Choice', 'True / False', 'Short Answer'].map((type) => {
                    const isSelected = questionType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setQuestionType(type)}
                        className={`h-9 px-2 rounded-xl text-[11px] font-semibold transition-all border ${
                          isSelected
                            ? 'bg-primary/10 text-primary border-primary/40 font-bold'
                            : 'bg-card border-border/40 hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Number of Questions — Preset Pills + Custom Input */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-foreground">
                    Number of Questions
                  </label>
                  <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                    {selectedPreset === CUSTOM_SENTINEL
                      ? resolvedQuestionCount > 0
                        ? `${resolvedQuestionCount} Questions`
                        : 'Custom'
                      : `${resolvedQuestionCount} Questions`}
                  </span>
                </div>

                {/* Preset Pill Row */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COUNTS.map((count) => {
                    const isSelected = selectedPreset === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => handlePresetSelect(count)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card border-border/60 hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                  {/* Custom Pill */}
                  <button
                    type="button"
                    onClick={() => handlePresetSelect(CUSTOM_SENTINEL)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                      selectedPreset === CUSTOM_SENTINEL
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card border-border/60 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Hash className="h-3 w-3" />
                    Custom
                  </button>
                </div>

                {/* Custom Number Input — visible only when Custom is selected */}
                {selectedPreset === CUSTOM_SENTINEL && (
                  <div className="space-y-1.5 pt-1">
                    <Input
                      type="number"
                      min={MIN_QUESTIONS}
                      max={MAX_QUESTIONS}
                      value={customCount}
                      onChange={handleCustomCountChange}
                      placeholder={`Enter 1–${MAX_QUESTIONS} questions`}
                      className={`bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary rounded-xl h-10 text-xs font-medium ${
                        customCountError ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                      autoFocus
                    />
                    {customCountError && (
                      <p className="text-[11px] text-destructive font-medium">{customCountError}</p>
                    )}
                    {!customCountError && customCount && (
                      <p className="text-[11px] text-muted-foreground">
                        Will generate exactly <span className="font-bold text-primary">{resolvedQuestionCount}</span> questions.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                  <span>5 — Quick Test</span>
                  <span>20 — Standard Assessment</span>
                  <span>Custom — Any count</span>
                </div>
              </div>

              {/* Generate Trigger Button */}
              <div className="pt-3">
                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    !topic.trim() ||
                    (selectedPreset === CUSTOM_SENTINEL && (!!customCountError || !customCount.trim()))
                  }
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-11 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>
                    {isGenerating
                      ? 'Generating Quiz...'
                      : `Generate ${resolvedQuestionCount > 0 ? resolvedQuestionCount : ''} Questions`}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quiz Info & Recent History */}
        <div className="lg:col-span-5 space-y-5">
          {/* Quick Info Badge */}
          <Card className="bg-primary/5 border-primary/20 p-4 rounded-2xl flex gap-3 items-start">
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-foreground">Smart Assessment Synthesis</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Questions are generated directly from your uploaded PDF notes to test key terms, concepts, and analytical application.
              </p>
            </div>
          </Card>

          {/* Assessment Summary Stats */}
          <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-2">
              Quiz Setup Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                <span className="text-[10px] text-muted-foreground font-semibold block">Est. Time</span>
                <span className="font-extrabold text-foreground">
                  {resolvedQuestionCount > 0 ? `${(resolvedQuestionCount * 1.5).toFixed(1)} Mins` : '—'}
                </span>
              </div>
              <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                <span className="text-[10px] text-muted-foreground font-semibold block">Questions</span>
                <span className="font-extrabold text-primary">
                  {resolvedQuestionCount > 0 ? resolvedQuestionCount : '—'}
                </span>
              </div>
              <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                <span className="text-[10px] text-muted-foreground font-semibold block">Difficulty</span>
                <span className="font-extrabold text-foreground">{difficulty}</span>
              </div>
              <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                <span className="text-[10px] text-muted-foreground font-semibold block">Target Accuracy</span>
                <span className="font-extrabold text-primary">80%+ Mastery</span>
              </div>
            </div>
          </Card>

          {/* Recent Quiz Attempts */}
          <Card className="bg-card border-border/50 p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-border/40 pb-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" />
                <span>Recent Quizzes</span>
              </h4>
              <Link to="/student/quiz/history" className="text-[10px] font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            {history.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/30 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0 text-left">
                      <h5 className="text-xs font-bold text-foreground truncate">{item.title}</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.questionCount} Questions • {item.difficulty}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {item.status === 'completed' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/student/quiz/results/${item.id}`)}
                          className="h-7 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg px-2"
                        >
                          {item.scorePercentage}% Score
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/student/quiz/take/${item.id}`)}
                          className="h-7 text-[10px] font-bold bg-primary text-primary-foreground rounded-lg px-2"
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">No recent quizzes yet</p>
                <p className="text-[10px]">Generate your first quiz above to start tracking progress.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
