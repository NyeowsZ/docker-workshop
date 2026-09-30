<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Docker Identification Quiz • Laravel + MySQL</title>
    <!-- Tailwind CSS CDN for lightweight standalone rendering -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        laravel: {
                            50: '#fff7ed',
                            100: '#ffedd5',
                            200: '#fed7aa',
                            500: '#f97316',
                            600: '#ea580c',
                            700: '#c2410c',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        .minimal-dot-bg {
            background-color: #f8fafc;
            background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
            background-size: 20px 20px;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>
<body class="min-h-full flex flex-col minimal-dot-bg text-slate-900 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
    <div id="app" class="flex-1 flex flex-col">
        <!-- Toast Notification -->
        <div id="toast" class="hidden fixed top-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>
            <span id="toast-msg"></span>
        </div>

        <!-- 60-30-10 Header with Laravel Orange Accent -->
        <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
            <div class="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <!-- Brand Title -->
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
                        <!-- Laravel Vector Logo -->
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.2 5.5l-8.7-5c-.3-.2-.7-.2-1 0l-8.7 5c-.3.2-.5.5-.5.8v10.4c0 .3.2.7.5.8l8.7 5c.1.1.3.1.5.1s.3 0 .5-.1l8.7-5c.3-.2.5-.5.5-.8V6.3c0-.3-.2-.6-.5-.8zM12 2.3l7 4-2.8 1.6-7-4 2.8-1.6zm-1.8 1.6l7 4-2.8 1.6-7-4 2.8-1.6zM3.8 6.9l7 4v3.2l-7-4V6.9zm8 14.8l-7-4v-6.3l7 4v6.3zm1.8 0v-6.3l7-4v6.3l-7 4zm7-7.9l-7-4v-3.2l7 4v3.2z" />
                        </svg>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-slate-900 text-sm tracking-tight">Docker Identification Lab</span>
                            <span class="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium border border-orange-200">
                                Laravel 11
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Latency Badge & Controls -->
                <div class="flex items-center gap-3">
                    <button onclick="pingDb()" title="Click to test live DB latency" class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-[11px] text-slate-600 font-mono transition-colors">
                        <span id="db-indicator" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span id="db-latency-text">MySQL: Testing...</span>
                    </button>

                    <!-- Mode Switcher -->
                    <div class="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button id="tab-quiz-btn" onclick="switchTab('quiz')" class="px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-sm transition-all">
                            Quiz Mode
                        </button>
                        <button id="tab-manage-btn" onclick="switchTab('manage')" class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-all">
                            Manage Questions
                        </button>
                    </div>

                    <!-- New Question CTA -->
                    <button onclick="openCreateModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New Question</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Body -->
        <main class="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col justify-start">
            <!-- Loading Indicator -->
            <div id="loading-state" class="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <svg class="w-6 h-6 animate-spin text-orange-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p class="text-xs text-slate-500">Querying MySQL database...</p>
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="hidden bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm my-auto">
                <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center mb-3">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-base font-semibold text-slate-900">No Identification Questions</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    The quiz table is empty. Create your first question or load default workshop questions.
                </p>
                <button onclick="resetDefaults()" class="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors">
                    Load Default Questions
                </button>
            </div>

            <!-- ================= QUIZ PLAY VIEW ================= -->
            <div id="quiz-view" class="hidden space-y-4">
                <!-- Header Stats & Progress -->
                <div class="flex items-center justify-between text-xs text-slate-500">
                    <div class="flex items-center gap-2">
                        <span id="quiz-progress-text" class="font-semibold text-slate-800">Question 1 of 5</span>
                        <span class="text-slate-300">•</span>
                        <span id="quiz-category-badge" class="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-medium">Architecture</span>
                    </div>
                    <div class="text-slate-400 font-mono text-[11px]">
                        Score: <span id="quiz-score-text" class="text-orange-600 font-semibold">0</span>
                    </div>
                </div>

                <!-- 10% Accent Progress Bar -->
                <div class="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div id="progress-bar-fill" class="bg-orange-600 h-full rounded-full transition-all duration-300 ease-out" style="width: 20%"></div>
                </div>

                <!-- Question Card -->
                <div class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
                    <div>
                        <div class="text-[11px] font-semibold uppercase tracking-wider text-orange-600 mb-1">
                            Identification Prompt
                        </div>
                        <h1 id="question-title" class="text-lg sm:text-xl font-semibold text-slate-900 leading-snug tracking-tight">
                            What is the term for the temporary, disposable lifecycle of Docker containers?
                        </h1>
                    </div>

                    <!-- Hint Disclosure -->
                    <div id="hint-container">
                        <button id="hint-toggle-btn" onclick="toggleHint()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors">
                            <span>💡 Need a hint?</span>
                        </button>
                        <div id="hint-box" class="hidden mt-2 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
                            <span class="font-semibold">Hint:</span> <span id="hint-text"></span>
                        </div>
                    </div>

                    <!-- Identification Answer Input Form -->
                    <form id="answer-form" onsubmit="submitAnswer(event)" class="space-y-3">
                        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div class="relative flex-1">
                                <input
                                    type="text"
                                    id="user-answer-input"
                                    autocomplete="off"
                                    placeholder="Type the exact Docker term, command, or concept..."
                                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                                />
                            </div>
                            <button
                                type="submit"
                                id="submit-answer-btn"
                                class="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] shrink-0"
                            >
                                Submit Answer
                            </button>
                        </div>
                    </form>

                    <!-- Interactive Result Feedback Box -->
                    <div id="feedback-box" class="hidden rounded-xl p-4 text-xs leading-relaxed space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div id="feedback-badge" class="font-bold flex items-center gap-2"></div>
                        <div id="feedback-details" class="text-slate-600"></div>
                        <div id="feedback-explanation" class="text-slate-700 pt-2 border-t border-slate-200/60 leading-relaxed"></div>
                    </div>

                    <!-- Navigation Footer -->
                    <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                            id="prev-btn"
                            onclick="prevQuestion()"
                            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                        >
                            ← Previous
                        </button>

                        <button
                            id="next-btn"
                            onclick="nextQuestion()"
                            class="hidden px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            Next Question →
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quiz Finished Score Summary Card -->
            <div id="quiz-finished-view" class="hidden bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto w-full animate-in fade-in zoom-in-95 duration-200">
                <div class="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center mb-4 border border-orange-200">
                    <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h2 class="text-xl font-bold text-slate-900 tracking-tight">Identification Quiz Complete!</h2>
                <p class="text-xs text-slate-500 mt-1 mb-6">
                    You tested your recall of Docker architecture, volumes, networking, and CLI flags.
                </p>

                <!-- Score Grid -->
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex justify-around items-center">
                    <div>
                        <div id="final-score-raw" class="text-2xl font-bold text-orange-600">0 / 0</div>
                        <div class="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Identified Correctly</div>
                    </div>
                    <div class="h-8 w-px bg-slate-200"></div>
                    <div>
                        <div id="final-score-percent" class="text-2xl font-bold text-slate-800">0%</div>
                        <div class="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">Accuracy</div>
                    </div>
                </div>

                <div class="flex items-center justify-center gap-3">
                    <button onclick="restartQuiz()" class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors">
                        Restart Quiz
                    </button>
                    <button onclick="switchTab('manage')" class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors">
                        Manage Questions
                    </button>
                </div>
            </div>

            <!-- ================= MANAGE / CRUD VIEW ================= -->
            <div id="manage-view" class="hidden space-y-4">
                <!-- Action & Filter Bar -->
                <div class="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div class="relative w-full sm:w-72">
                        <input
                            type="text"
                            id="search-input"
                            oninput="searchQuestions(this.value)"
                            placeholder="Search questions or categories..."
                            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                        />
                        <svg class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button onclick="resetDefaults()" class="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors">
                            Reset Defaults
                        </button>
                        <button onclick="openCreateModal()" class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors">
                            + Add Question
                        </button>
                    </div>
                </div>

                <!-- Questions List Container -->
                <div id="questions-list" class="space-y-3"></div>
            </div>
        </main>

        <!-- Create / Edit Modal -->
        <div id="crud-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div class="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 id="modal-title" class="font-semibold text-slate-900 text-base">Add Identification Question</h3>
                        <p class="text-xs text-slate-500">Stores into MySQL table `identification_questions`</p>
                    </div>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-lg p-1">✕</button>
                </div>

                <!-- 1-Click Presentation Presets -->
                <div id="modal-presets">
                    <label class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                        1-Click Presentation Presets
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                        <button type="button" onclick="applyPreset(0)" class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200 transition-colors">
                            + Ephemerality
                        </button>
                        <button type="button" onclick="applyPreset(1)" class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200 transition-colors">
                            + Volumes
                        </button>
                        <button type="button" onclick="applyPreset(2)" class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium border border-orange-200 transition-colors">
                            + DNS Network
                        </button>
                    </div>
                </div>

                <form onsubmit="handleSaveQuestion(event)" class="space-y-3.5">
                    <input type="hidden" id="edit-id" value="">

                    <div>
                        <label class="text-xs font-medium text-slate-700 block mb-1">Question Prompt *</label>
                        <textarea id="form-question" required rows="2" placeholder="e.g. What is the term for the temporary lifecycle of Docker containers?" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"></textarea>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="text-xs font-medium text-slate-700 block mb-1">Canonical Answer *</label>
                            <input type="text" id="form-answer" required placeholder="e.g. ephemerality" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white">
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-700 block mb-1">Category</label>
                            <input type="text" id="form-category" placeholder="e.g. Architecture" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white">
                        </div>
                    </div>

                    <div>
                        <label class="text-xs font-medium text-slate-700 block mb-1">Acceptable Answer Variants (comma separated)</label>
                        <input type="text" id="form-acceptable" placeholder="e.g. ephemerality, ephemeral, stateless" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white">
                    </div>

                    <div>
                        <label class="text-xs font-medium text-slate-700 block mb-1">Hint (Optional)</label>
                        <input type="text" id="form-hint" placeholder="e.g. Starts with 'E' — opposite of persistence" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white">
                    </div>

                    <div>
                        <label class="text-xs font-medium text-slate-700 block mb-1">Explanation</label>
                        <textarea id="form-explanation" rows="2" placeholder="Explain the Docker concept behind this answer..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white resize-none"></textarea>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors">
                            Save Question
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Footer -->
        <footer class="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-400">
            <div class="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Docker Workshop • Laravel 11 + MySQL 8.0 + Nginx</span>
                <div class="flex items-center gap-3 text-slate-500">
                    <span>Container: <code class="text-slate-700">laravel-app</code></span>
                    <span>•</span>
                    <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:underline">
                        phpMyAdmin :8081
                    </a>
                </div>
            </div>
        </footer>
    </div>

    <!-- Client-side Logic -->
    <script>
        const PRESETS = [
            {
                question: "What is the term for the temporary, disposable lifecycle of Docker containers where changes made to the writable layer are discarded upon destruction?",
                answer: "ephemerality",
                acceptable: "ephemerality, ephemeral, ephemeral storage, stateless",
                category: "Architecture",
                hint: "Starts with 'E' — the opposite of persistent.",
                explanation: "Container filesystems are ephemeral by design. When a container is removed, its writable layer is discarded unless backed by a Docker volume."
            },
            {
                question: "Which Docker storage mechanism bypasses the union filesystem and persists database data on the host machine independently of container lifecycles?",
                answer: "volume",
                acceptable: "volume, volumes, docker volume, docker volumes",
                category: "Storage",
                hint: "Specified under the 'volumes' key in docker-compose.yml.",
                explanation: "Docker volumes are stored outside container layers and retain database tables across container restarts and recreations."
            },
            {
                question: "What built-in Docker feature automatically translates container and service names to IP addresses on user-defined bridge networks?",
                answer: "DNS",
                acceptable: "DNS, embedded DNS, Docker DNS, DNS resolver, 127.0.0.11",
                category: "Networking",
                hint: "Standard 3-letter acronym for domain/name resolution.",
                explanation: "Docker runs an embedded 127.0.0.11 DNS server inside user-defined bridge networks (like laravel-net) to route service names to container IPs."
            }
        ];

        let questions = [];
        let currentIndex = 0;
        let score = 0;
        let hasAnswered = false;
        let activeTab = 'quiz';
        let answeredQuestions = {};

        function notify(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        async function pingDb() {
            try {
                const res = await fetch('/api/ping');
                const data = await res.json();
                document.getElementById('db-latency-text').innerText = `MySQL: ${data.latency_ms}ms`;
                notify(`Ping: MySQL roundtrip latency is ${data.latency_ms}ms`);
            } catch (err) {
                document.getElementById('db-latency-text').innerText = `MySQL: Offline`;
            }
        }

        async function loadQuestions() {
            try {
                const res = await fetch('/api/questions');
                const data = await res.json();
                questions = data.data || [];
                document.getElementById('loading-state').classList.add('hidden');

                if (questions.length === 0) {
                    document.getElementById('empty-state').classList.remove('hidden');
                    document.getElementById('quiz-view').classList.add('hidden');
                    document.getElementById('manage-view').classList.add('hidden');
                } else {
                    document.getElementById('empty-state').classList.add('hidden');
                    renderQuiz();
                    renderManageList();
                    if (activeTab === 'quiz') {
                        document.getElementById('quiz-view').classList.remove('hidden');
                    } else {
                        document.getElementById('manage-view').classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error("Failed to load questions", err);
            }
        }

        function switchTab(tab) {
            activeTab = tab;
            const quizBtn = document.getElementById('tab-quiz-btn');
            const manageBtn = document.getElementById('tab-manage-btn');
            const quizView = document.getElementById('quiz-view');
            const manageView = document.getElementById('manage-view');
            const finishedView = document.getElementById('quiz-finished-view');

            if (tab === 'quiz') {
                quizBtn.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-sm transition-all";
                manageBtn.className = "px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-all";
                manageView.classList.add('hidden');
                if (currentIndex >= questions.length && questions.length > 0) {
                    finishedView.classList.remove('hidden');
                } else {
                    quizView.classList.remove('hidden');
                }
            } else {
                manageBtn.className = "px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-slate-900 shadow-sm transition-all";
                quizBtn.className = "px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 transition-all";
                quizView.classList.add('hidden');
                finishedView.classList.add('hidden');
                manageView.classList.remove('hidden');
            }
        }

        function renderQuiz() {
            if (currentIndex >= questions.length) {
                showQuizFinished();
                return;
            }

            const q = questions[currentIndex];
            document.getElementById('quiz-progress-text').innerText = `Question ${currentIndex + 1} of ${questions.length}`;
            document.getElementById('quiz-category-badge').innerText = q.category || 'Docker Core';
            document.getElementById('quiz-score-text').innerText = score;
            document.getElementById('progress-bar-fill').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

            document.getElementById('question-title').innerText = q.question;
            document.getElementById('hint-text').innerText = q.hint || "Think about core container lifecycle design.";
            document.getElementById('hint-box').classList.add('hidden');

            const answerInput = document.getElementById('user-answer-input');
            const submitBtn = document.getElementById('submit-answer-btn');
            const feedbackBox = document.getElementById('feedback-box');
            const nextBtn = document.getElementById('next-btn');

            document.getElementById('prev-btn').disabled = currentIndex === 0;

            if (answeredQuestions[q.id]) {
                const prev = answeredQuestions[q.id];
                answerInput.value = prev.userAnswer;
                answerInput.disabled = true;
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-40');
                displayFeedback(prev.isCorrect, prev.canonical, prev.explanation, prev.userAnswer);
                nextBtn.classList.remove('hidden');
            } else {
                answerInput.value = '';
                answerInput.disabled = false;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-40');
                feedbackBox.classList.add('hidden');
                nextBtn.classList.add('hidden');
                answerInput.focus();
            }
        }

        function toggleHint() {
            const hintBox = document.getElementById('hint-box');
            hintBox.classList.toggle('hidden');
        }

        async function submitAnswer(e) {
            e.preventDefault();
            const input = document.getElementById('user-answer-input');
            const userAns = input.value.trim();
            if (!userAns) return;

            const q = questions[currentIndex];

            try {
                const res = await fetch('/api/questions/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: q.id, answer: userAns })
                });
                const data = await res.json();

                if (data.is_correct) {
                    score++;
                    document.getElementById('quiz-score-text').innerText = score;
                }

                answeredQuestions[q.id] = {
                    userAnswer: userAns,
                    isCorrect: data.is_correct,
                    canonical: data.canonical_answer,
                    explanation: data.explanation
                };

                input.disabled = true;
                const submitBtn = document.getElementById('submit-answer-btn');
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-40');

                displayFeedback(data.is_correct, data.canonical_answer, data.explanation, userAns);
                document.getElementById('next-btn').classList.remove('hidden');
            } catch (err) {
                console.error("Submit error", err);
            }
        }

        function displayFeedback(isCorrect, canonical, explanation, userAns) {
            const feedbackBox = document.getElementById('feedback-box');
            const badge = document.getElementById('feedback-badge');
            const details = document.getElementById('feedback-details');
            const exp = document.getElementById('feedback-explanation');

            feedbackBox.classList.remove('hidden');

            if (isCorrect) {
                feedbackBox.className = "rounded-xl p-4 text-xs leading-relaxed space-y-2 bg-emerald-50/80 border border-emerald-200 text-emerald-950";
                badge.className = "font-bold text-emerald-800 flex items-center gap-1.5 text-sm";
                badge.innerHTML = `✓ Identified Correctly!`;
                details.innerHTML = `You answered: <span class="font-mono font-semibold">${userAns}</span> (Accepted)`;
            } else {
                feedbackBox.className = "rounded-xl p-4 text-xs leading-relaxed space-y-2 bg-rose-50/80 border border-rose-200 text-rose-950";
                badge.className = "font-bold text-rose-800 flex items-center gap-1.5 text-sm";
                badge.innerHTML = `✕ Not Quite`;
                details.innerHTML = `Your answer: <span class="font-mono line-through">${userAns}</span> • Expected: <span class="font-mono font-bold text-rose-900">${canonical}</span>`;
            }

            exp.innerHTML = `<span class="font-semibold text-slate-800">Docker Concept:</span> ${explanation || "Containers are isolated execution units."}`;
        }

        function nextQuestion() {
            if (currentIndex < questions.length - 1) {
                currentIndex++;
                renderQuiz();
            } else {
                showQuizFinished();
            }
        }

        function prevQuestion() {
            if (currentIndex > 0) {
                currentIndex--;
                renderQuiz();
            }
        }

        function showQuizFinished() {
            document.getElementById('quiz-view').classList.add('hidden');
            document.getElementById('quiz-finished-view').classList.remove('hidden');
            document.getElementById('final-score-raw').innerText = `${score} / ${questions.length}`;
            const pct = Math.round((score / questions.length) * 100);
            document.getElementById('final-score-percent').innerText = `${pct}%`;
        }

        function restartQuiz() {
            currentIndex = 0;
            score = 0;
            answeredQuestions = {};
            document.getElementById('quiz-finished-view').classList.add('hidden');
            document.getElementById('quiz-view').classList.remove('hidden');
            renderQuiz();
        }

        /* CRUD Logic */
        function renderManageList() {
            const list = document.getElementById('questions-list');
            list.innerHTML = '';

            questions.forEach((q, idx) => {
                const item = document.createElement('div');
                item.className = "bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start justify-between gap-4";
                item.innerHTML = `
                    <div class="space-y-2 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] font-mono text-slate-400 font-semibold">#${idx + 1}</span>
                            <span class="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-medium">${q.category || 'Docker Core'}</span>
                            <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">Answer: ${q.answer}</span>
                        </div>
                        <h3 class="text-sm font-semibold text-slate-900 leading-snug">${q.question}</h3>
                        ${q.acceptable_answers ? `<div class="text-xs text-slate-500 font-mono text-[11px]"><span class="font-medium text-slate-700 font-sans">Acceptable:</span> ${q.acceptable_answers}</div>` : ''}
                        ${q.hint ? `<div class="text-xs text-amber-700 text-[11px]"><span class="font-medium">Hint:</span> ${q.hint}</div>` : ''}
                    </div>
                    <div class="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-start">
                        <button onclick="openEditModal(${q.id})" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">Edit</button>
                        <button onclick="deleteQuestion(${q.id})" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors">Delete</button>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        function searchQuestions(val) {
            const query = val.toLowerCase();
            const list = document.getElementById('questions-list');
            list.innerHTML = '';

            const filtered = questions.filter(q =>
                q.question.toLowerCase().includes(query) ||
                (q.category && q.category.toLowerCase().includes(query)) ||
                q.answer.toLowerCase().includes(query)
            );

            filtered.forEach((q, idx) => {
                const item = document.createElement('div');
                item.className = "bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4";
                item.innerHTML = `
                    <div class="space-y-2 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] font-mono text-slate-400 font-semibold">#${idx + 1}</span>
                            <span class="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-medium">${q.category || 'Docker Core'}</span>
                            <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">Answer: ${q.answer}</span>
                        </div>
                        <h3 class="text-sm font-semibold text-slate-900 leading-snug">${q.question}</h3>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button onclick="openEditModal(${q.id})" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-orange-600">Edit</button>
                        <button onclick="deleteQuestion(${q.id})" class="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600">Delete</button>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        function openCreateModal() {
            document.getElementById('edit-id').value = '';
            document.getElementById('modal-title').innerText = 'Add Identification Question';
            document.getElementById('modal-presets').classList.remove('hidden');
            document.getElementById('form-question').value = '';
            document.getElementById('form-answer').value = '';
            document.getElementById('form-category').value = 'Docker Core';
            document.getElementById('form-acceptable').value = '';
            document.getElementById('form-hint').value = '';
            document.getElementById('form-explanation').value = '';
            document.getElementById('crud-modal').classList.remove('hidden');
        }

        function openEditModal(id) {
            const q = questions.find(item => item.id === id);
            if (!q) return;

            document.getElementById('edit-id').value = q.id;
            document.getElementById('modal-title').innerText = `Edit Question #${q.id}`;
            document.getElementById('modal-presets').classList.add('hidden');
            document.getElementById('form-question').value = q.question;
            document.getElementById('form-answer').value = q.answer;
            document.getElementById('form-category').value = q.category || 'Docker Core';
            document.getElementById('form-acceptable').value = q.acceptable_answers || '';
            document.getElementById('form-hint').value = q.hint || '';
            document.getElementById('form-explanation').value = q.explanation || '';
            document.getElementById('crud-modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('crud-modal').classList.add('hidden');
        }

        function applyPreset(idx) {
            const p = PRESETS[idx];
            document.getElementById('form-question').value = p.question;
            document.getElementById('form-answer').value = p.answer;
            document.getElementById('form-category').value = p.category;
            document.getElementById('form-acceptable').value = p.acceptable;
            document.getElementById('form-hint').value = p.hint;
            document.getElementById('form-explanation').value = p.explanation;
        }

        async function handleSaveQuestion(e) {
            e.preventDefault();
            const editId = document.getElementById('edit-id').value;
            const payload = {
                question: document.getElementById('form-question').value.trim(),
                answer: document.getElementById('form-answer').value.trim(),
                category: document.getElementById('form-category').value.trim(),
                acceptable_answers: document.getElementById('form-acceptable').value.trim(),
                hint: document.getElementById('form-hint').value.trim(),
                explanation: document.getElementById('form-explanation').value.trim(),
            };

            try {
                if (editId) {
                    const res = await fetch(`/api/questions/${editId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (data.success) {
                        notify('Question updated successfully!');
                        closeModal();
                        loadQuestions();
                    }
                } else {
                    const res = await fetch('/api/questions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();
                    if (data.success) {
                        notify('New identification question created!');
                        closeModal();
                        loadQuestions();
                    }
                }
            } catch (err) {
                console.error("Save error", err);
            }
        }

        async function deleteQuestion(id) {
            if (!confirm('Are you sure you want to delete this question?')) return;
            try {
                const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    notify('Question deleted.');
                    loadQuestions();
                }
            } catch (err) {
                console.error("Delete error", err);
            }
        }

        async function resetDefaults() {
            try {
                const res = await fetch('/api/questions/reset', { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    notify('Reset quiz to default identification questions!');
                    loadQuestions();
                    restartQuiz();
                }
            } catch (err) {
                console.error("Reset error", err);
            }
        }

        // Init
        document.addEventListener('DOMContentLoaded', () => {
            pingDb();
            loadQuestions();
        });
    </script>
</body>
</html>
