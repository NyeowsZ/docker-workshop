"use client";

import { useState, useEffect, useCallback } from "react";

type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const SAMPLE_PRESETS = [
  {
    question: "What is Docker container ephemerality?",
    optionA: "Containers automatically save their files into the cloud before stopping.",
    optionB: "Changes made in a container's writable layer are discarded upon destruction.",
    optionC: "Containers run solely in memory and can never access disk partitions.",
    optionD: "Docker images are purged from disk after 30 days of inactivity.",
    correctAnswer: "B",
    explanation: "Containers are designed to be stateless and temporary. Files written to the container layer are lost when removed unless mounted to a persistent volume.",
    category: "Architecture",
  },
  {
    question: "What is the purpose of the VOLUME instruction in Dockerfile?",
    optionA: "It increases the container's virtual memory allocation.",
    optionB: "It specifies mount points that bypass the container's union filesystem.",
    optionC: "It compresses database tables into tar archives.",
    optionD: "It creates a backup snapshot in Docker Hub.",
    correctAnswer: "B",
    explanation: "Volumes provide persistent and shared storage that lives outside the union file system of the container.",
    category: "Storage",
  },
  {
    question: "Which command runs a container detached in the background?",
    optionA: "docker run -it",
    optionB: "docker run -d",
    optionC: "docker run --daemon-mode",
    optionD: "docker start --bg",
    correctAnswer: "B",
    explanation: "The -d (or --detach) flag runs the container in the background and prints the container ID.",
    category: "CLI",
  },
];

export default function Home() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"quiz" | "manage">("quiz");
  
  // Quiz Play State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    category: "Docker Core",
  });

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        if (data.meta?.latencyMs !== undefined) {
          setDbLatency(data.meta.latencyMs);
        }
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Quiz Interaction Handlers
  const handleSelectOption = (optionKey: string) => {
    if (hasAnswered) return;
    setSelectedOption(optionKey);
    setHasAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionKey === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = questions[prevIdx];
      const savedAns = userAnswers[prevQ.id];
      if (savedAns) {
        setSelectedOption(savedAns);
        setHasAnswered(true);
      } else {
        setSelectedOption(null);
        setHasAnswered(false);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers({});
  };

  // CRUD Handlers
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
      category: "Docker Core",
    });
    setShowModal(true);
  };

  const openEditModal = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setFormData({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      category: q.category || "Docker Core",
    });
    setShowModal(true);
  };

  const applyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setFormData({
      question: preset.question,
      optionA: preset.optionA,
      optionB: preset.optionB,
      optionC: preset.optionC,
      optionD: preset.optionD,
      correctAnswer: preset.correctAnswer,
      explanation: preset.explanation,
      category: preset.category,
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.optionA || !formData.optionB) return;

    try {
      if (editingQuestion) {
        const res = await fetch(`/api/questions/${editingQuestion.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          notify("Question updated in MySQL via Drizzle ORM");
          setShowModal(false);
          fetchQuestions();
        }
      } else {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          notify("New question created successfully");
          setShowModal(false);
          fetchQuestions();
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify("Question deleted");
        fetchQuestions();
        if (currentIndex >= questions.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleResetDefaults = async () => {
    try {
      const res = await fetch("/api/questions/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        notify("Reset quiz with standard presentation questions!");
        fetchQuestions();
        handleRestartQuiz();
      }
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const currentQ = questions[currentIndex];
  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col minimal-dot-bg min-h-screen">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          {notification}
        </div>
      )}

      {/* Top Navigation Bar: Minimal 60-30-10 Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm0 2.715h2.118a.186.186 0 00.186-.186V6.29a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.186.185.186zm-2.954 0h2.119a.186.186 0 00.186-.186V6.29a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186zm0 2.715h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm-2.954 0h2.119a.186.186 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.12a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185zm8.862 2.715h2.119a.186.186 0 00.186-.185v-1.888a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185zm-2.954 0h2.118a.186.186 0 00.186-.185v-1.888a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.888c0 .102.082.185.185.185zm-2.954 0h2.119a.186.186 0 00.186-.185v-1.888a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185zm-2.954 0h2.119a.186.186 0 00.185-.185v-1.888a.185.185 0 00-.185-.186H5.12a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185zm-2.954 0h2.119a.186.186 0 00.186-.185v-1.888a.186.186 0 00-.186-.186H2.167a.185.185 0 00-.185.186v1.888c0 .102.083.185.185.185zM23.95 12.35c-.212-.395-.815-.558-1.527-.457-.34-.73-.956-1.32-1.745-1.666l-.326-.14-.236.265c-.562.632-.977 1.405-1.218 2.247-.468-.073-.96-.107-1.464-.107H.5c-.276 0-.5.224-.5.5 0 2.87 1.107 5.064 3.292 6.524 1.77 1.183 4.148 1.837 7.07 1.837 6.643 0 11.536-3.328 12.91-9.288.583-.105 1.127-.47 1.488-.992.36-.522.428-1.168.19-1.72z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">Docker Quiz Lab</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium border border-sky-100">
                  Drizzle ORM
                </span>
              </div>
            </div>
          </div>

          {/* Tab Switcher & DB Latency */}
          <div className="flex items-center gap-3">
            {dbLatency !== null && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                MySQL {dbLatency}ms
              </span>
            )}

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "quiz"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quiz Mode
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === "manage"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manage Questions
              </button>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Question</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col justify-start">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <svg className="w-6 h-6 animate-spin text-sky-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-xs text-slate-500">Loading Docker questions from MySQL...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm my-auto">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900">No questions available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              The quiz table is empty. Create your first question or load standard presentation questions.
            </p>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Load Default Questions
            </button>
          </div>
        ) : activeTab === "quiz" ? (
          /* ================= QUIZ PLAY VIEW ================= */
          quizFinished ? (
            /* Finished Summary Card */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-4 border border-sky-100">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quiz Complete!</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                You tested your knowledge on Docker fundamentals and container architecture.
              </p>

              {/* Score Display */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex justify-around items-center">
                <div>
                  <div className="text-2xl font-bold text-sky-600">{score} / {questions.length}</div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Correct Answers</div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {Math.round((score / questions.length) * 100)}%
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Score</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Restart Quiz
                </button>
                <button
                  onClick={() => setActiveTab("manage")}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                >
                  Manage Questions
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Card */
            <div className="space-y-4">
              {/* Progress & Header */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-[11px] font-medium">
                    {currentQ.category}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Score: <span className="text-sky-600 font-semibold">{score}</span>
                </div>
              </div>

              {/* Progress Bar (Light Blue 10% Accent) */}
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Main Question Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                {/* Question Title */}
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug tracking-tight">
                  {currentQ.question}
                </h1>

                {/* Multiple Choice Options List */}
                <div className="space-y-2.5">
                  {[
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                  ].map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    const isCorrect = opt.key === currentQ.correctAnswer;
                    
                    let cardStyle = "bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-slate-800";
                    let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

                    if (hasAnswered) {
                      if (isCorrect) {
                        cardStyle = "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium";
                        badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                      } else if (isSelected && !isCorrect) {
                        cardStyle = "bg-rose-50/70 border-rose-300 text-rose-950";
                        badgeStyle = "bg-rose-500 text-white border-rose-500";
                      } else {
                        cardStyle = "bg-slate-50/50 border-slate-200 text-slate-400 opacity-60";
                        badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        disabled={hasAnswered}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 ${cardStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${badgeStyle}`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-xs sm:text-sm leading-relaxed flex-1">
                          {opt.text}
                        </span>
                        {hasAnswered && isCorrect && (
                          <span className="text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100/60 shrink-0">
                            ✓ Correct
                          </span>
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <span className="text-rose-600 text-xs font-semibold px-2 py-0.5 rounded bg-rose-100/60 shrink-0">
                            ✕ Your Choice
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box (Appears after answer) */}
                {hasAnswered && (
                  <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-4 text-xs leading-relaxed text-sky-950 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="font-semibold text-sky-900 flex items-center gap-1.5 mb-1">
                      <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Explanation:</span>
                    </div>
                    <p className="text-slate-600">
                      {currentQ.explanation || "This illustrates how Docker handles container execution and resource lifecycle."}
                    </p>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {hasAnswered && (
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.01]"
                      >
                        {currentIndex < questions.length - 1 ? "Next Question →" : "See Results"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ================= MANAGE / CRUD VIEW ================= */
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search questions or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
                <svg
                  className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Reset to Defaults button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  + Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 text-[11px] font-medium">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium">
                        Answer: {q.correctAnswer}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h3>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 pt-1">
                      <div className={`p-2 rounded-lg border text-[11px] ${q.correctAnswer === "A" ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium" : "bg-slate-50 border-slate-100"}`}>
                        <span className="font-bold mr-1">A:</span> {q.optionA}
                      </div>
                      <div className={`p-2 rounded-lg border text-[11px] ${q.correctAnswer === "B" ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium" : "bg-slate-50 border-slate-100"}`}>
                        <span className="font-bold mr-1">B:</span> {q.optionB}
                      </div>
                      <div className={`p-2 rounded-lg border text-[11px] ${q.correctAnswer === "C" ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium" : "bg-slate-50 border-slate-100"}`}>
                        <span className="font-bold mr-1">C:</span> {q.optionC}
                      </div>
                      <div className={`p-2 rounded-lg border text-[11px] ${q.correctAnswer === "D" ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium" : "bg-slate-50 border-slate-100"}`}>
                        <span className="font-bold mr-1">D:</span> {q.optionD}
                      </div>
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => openEditModal(q)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CRUD Modal for Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingQuestion ? `Editing record #${editingQuestion.id} in MySQL via Drizzle` : "Stores into MySQL table `quiz_questions`"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Presets for Live Demo */}
            {!editingQuestion && (
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                  1-Click Presentation Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.category}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-medium border border-sky-100 transition-colors"
                    >
                      + {p.category} Question
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-3.5">
              {/* Question Text */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Question *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What is Docker container ephemerality?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              {/* Options A & B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option A description"
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option B description"
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Options C & D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option C description"
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    placeholder="Option D description"
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Correct Answer & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Correct Answer *</label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Architecture"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this answer is correct..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  {editingQuestion ? "Update Question" : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimalist Presentation Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Docker Workshop • Drizzle ORM + MySQL 8.0</span>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Container: <code className="text-slate-700">node-app</code></span>
            <span>•</span>
            <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
              phpMyAdmin :8080
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
