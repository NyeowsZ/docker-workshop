<?php

namespace App\Http\Controllers;

use App\Models\IdentificationQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class QuizController extends Controller
{
    const DEFAULT_QUESTIONS = [
        [
            'question' => 'What is the term for the temporary, disposable lifecycle of Docker containers where changes made to the writable layer are discarded upon destruction?',
            'answer' => 'ephemerality',
            'acceptable_answers' => 'ephemerality, ephemeral, ephemeral storage, stateless',
            'category' => 'Architecture',
            'hint' => "Starts with 'E' — the opposite of persistent.",
            'explanation' => 'Container filesystems are ephemeral by design. When a container is removed, its writable layer is discarded unless backed by a Docker volume.'
        ],
        [
            'question' => 'Which Docker storage mechanism bypasses the union filesystem and persists database data on the host machine independently of container lifecycles?',
            'answer' => 'volume',
            'acceptable_answers' => 'volume, volumes, docker volume, docker volumes',
            'category' => 'Storage',
            'hint' => "Specified under the 'volumes' key in docker-compose.yml.",
            'explanation' => 'Docker volumes are stored outside container layers and retain database tables across container restarts and recreations.'
        ],
        [
            'question' => 'What built-in Docker feature automatically translates container and service names to IP addresses on user-defined bridge networks?',
            'answer' => 'DNS',
            'acceptable_answers' => 'DNS, embedded DNS, Docker DNS, DNS resolver, 127.0.0.11',
            'category' => 'Networking',
            'hint' => 'Standard 3-letter acronym for domain/name resolution.',
            'explanation' => 'Docker runs an embedded 127.0.0.11 DNS server inside user-defined bridge networks (like laravel-net) to route service names to container IPs.'
        ],
        [
            'question' => "Which CLI flag passed to 'docker run' executes a container in detached background mode instead of foreground interactive mode?",
            'answer' => '-d',
            'acceptable_answers' => '-d, --detach, detach, -d / --detach',
            'category' => 'Commands',
            'hint' => "A single letter flag that stands for 'detach'.",
            'explanation' => 'The -d flag runs the container process in the background and prints its container ID.'
        ],
        [
            'question' => 'Which instruction in a Dockerfile documents the incoming ports the container expects to listen on without actually publishing them to host interfaces?',
            'answer' => 'EXPOSE',
            'acceptable_answers' => 'EXPOSE, expose',
            'category' => 'Dockerfile',
            'hint' => "A 6-letter Dockerfile keyword starting with 'E'.",
            'explanation' => 'EXPOSE functions primarily as documentation between developers. Publishing ports requires -p or -P at runtime.'
        ]
    ];

    /**
     * Ensures database table exists and is populated with demo questions.
     */
    public function ensureInitialized(): void
    {
        try {
            if (!Schema::hasTable('identification_questions')) {
                Schema::create('identification_questions', function ($table) {
                    $table->id();
                    $table->text('question');
                    $table->string('answer');
                    $table->text('acceptable_answers')->nullable();
                    $table->string('category')->default('Docker Core');
                    $table->string('hint')->nullable();
                    $table->text('explanation')->nullable();
                    $table->timestamps();
                });
            }

            if (IdentificationQuestion::count() === 0) {
                foreach (self::DEFAULT_QUESTIONS as $q) {
                    IdentificationQuestion::create($q);
                }
            }
        } catch (\Throwable $e) {
            // Silently handle if DB is connecting
        }
    }

    public function index()
    {
        $this->ensureInitialized();
        return view('welcome');
    }

    public function ping()
    {
        $start = microtime(true);
        $status = 'connected';
        $latency = 0;
        $error = null;

        try {
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $start) * 1000, 2);
        } catch (\Throwable $e) {
            $status = 'error';
            $error = $e->getMessage();
        }

        return response()->json([
            'status' => $status,
            'latency_ms' => $latency,
            'database' => config('database.connections.mysql.database'),
            'host' => config('database.connections.mysql.host'),
            'php_version' => PHP_VERSION,
            'container' => gethostname(),
            'error' => $error
        ]);
    }

    public function getQuestions(Request $request)
    {
        $this->ensureInitialized();

        $query = IdentificationQuestion::query();
        if ($search = $request->input('search')) {
            $query->where('question', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%");
        }

        $questions = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
            'count' => $questions->count()
        ]);
    }

    public function checkAnswer(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'answer' => 'required|string'
        ]);

        $question = IdentificationQuestion::findOrFail($request->input('id'));
        $isCorrect = $question->checkAnswer($request->input('answer'));

        return response()->json([
            'success' => true,
            'is_correct' => $isCorrect,
            'canonical_answer' => $question->answer,
            'acceptable_answers' => $question->acceptable_answers,
            'explanation' => $question->explanation
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
            'acceptable_answers' => 'nullable|string',
            'category' => 'nullable|string',
            'hint' => 'nullable|string',
            'explanation' => 'nullable|string',
        ]);

        $question = IdentificationQuestion::create([
            'question' => trim($validated['question']),
            'answer' => trim($validated['answer']),
            'acceptable_answers' => $validated['acceptable_answers'] ?? null,
            'category' => $validated['category'] ?? 'Docker Core',
            'hint' => $validated['hint'] ?? null,
            'explanation' => $validated['explanation'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Identification question created successfully',
            'data' => $question
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $question = IdentificationQuestion::findOrFail($id);

        $validated = $request->validate([
            'question' => 'sometimes|required|string',
            'answer' => 'sometimes|required|string',
            'acceptable_answers' => 'nullable|string',
            'category' => 'nullable|string',
            'hint' => 'nullable|string',
            'explanation' => 'nullable|string',
        ]);

        $question->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question
        ]);
    }

    public function destroy($id)
    {
        $question = IdentificationQuestion::findOrFail($id);
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully'
        ]);
    }

    public function reset()
    {
        $this->ensureInitialized();
        IdentificationQuestion::truncate();

        foreach (self::DEFAULT_QUESTIONS as $q) {
            IdentificationQuestion::create($q);
        }

        $all = IdentificationQuestion::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Reset quiz to default Docker identification questions',
            'data' => $all
        ]);
    }
}
