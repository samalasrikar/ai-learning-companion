/**
 * Service for managing Quiz generation, storage, interactive taking, and score evaluation.
 * Uses localStorage for persistent cross-session history with fallback demo quizzes.
 */

const STORAGE_KEY = 'ai_quizzes_history';
const DEV = import.meta.env.DEV; // true in development, false in production

// ─── Question Bank ───────────────────────────────────────────────────────────
// Larger bank to support up to 50 questions without excessive repetition.
// Each bank entry has a unique id, question, options, correctAnswerIndex, explanation, and citation.
const SAMPLE_QUESTION_BANK = {
  'DevOps & Cloud Systems': [
    {
      id: 'devops_q1',
      question: 'What is the primary role of a Container Orchestrator such as Kubernetes?',
      options: [
        'Automating deployment, scaling, and management of containerized applications',
        'Compiling source code into executable binary packages',
        'Directly managing physical server hardware power states',
        'Providing graphic user interfaces for database querying',
      ],
      correctAnswerIndex: 0,
      explanation: 'Container orchestrators automate container lifecycle management, load balancing, horizontal scaling, and self-healing across nodes.',
      citation: 'DevOps_Guide.pdf • Chapter 4 (Container Management)',
    },
    {
      id: 'devops_q2',
      question: 'Which Infrastructure as Code (IaC) tool uses declarative HCL syntax to provision GCP resources?',
      options: ['Terraform', 'Ansible', 'Docker Compose', 'Jenkins'],
      correctAnswerIndex: 0,
      explanation: 'Terraform by HashiCorp uses HashiCorp Configuration Language (HCL) to declaratively define and provision cloud infrastructure.',
      citation: 'DevOps_Guide.pdf • Chapter 7 (IaC Best Practices)',
    },
    {
      id: 'devops_q3',
      question: 'What does CI/CD stand for in modern DevOps workflows?',
      options: [
        'Continuous Integration and Continuous Deployment',
        'Centralized Infrastructure and Cloud Distribution',
        'Container Isolation and Code Debugging',
        'Command Interface and Data Pipeline',
      ],
      correctAnswerIndex: 0,
      explanation: 'CI/CD refers to Continuous Integration (automating code builds and testing) and Continuous Deployment/Delivery (automating release pipelines).',
      citation: 'DevOps_Guide.pdf • Chapter 1 (CI/CD Principles)',
    },
    {
      id: 'devops_q4',
      question: 'What is the function of a reverse proxy like NGINX in microservices architecture?',
      options: [
        'Filtering, load balancing, and routing incoming client HTTP traffic to upstream service pods',
        'Encrypting local disk partitions on production host nodes',
        'Serving as the primary relational database storage engine',
        'Generating TLS certificates automatically without domain verification',
      ],
      correctAnswerIndex: 0,
      explanation: 'Reverse proxies sit in front of web servers, routing client requests to backend services while handling SSL termination and load balancing.',
      citation: 'DevOps_Guide.pdf • Chapter 5 (Gateway Routing)',
    },
    {
      id: 'devops_q5',
      question: 'In Kubernetes, what is a Pod?',
      options: [
        'The smallest deployable unit that can contain one or more containers',
        'A network policy rule for inbound traffic filtering',
        'A persistent disk volume attached to a node',
        'A configuration object that stores environment secrets',
      ],
      correctAnswerIndex: 0,
      explanation: 'A Pod is the atomic deployment unit in Kubernetes and wraps one or more tightly coupled containers sharing network and storage.',
      citation: 'DevOps_Guide.pdf • Chapter 4',
    },
    {
      id: 'devops_q6',
      question: 'Which Kubernetes object ensures a specified number of pod replicas are always running?',
      options: ['ReplicaSet', 'ConfigMap', 'Ingress', 'ServiceAccount'],
      correctAnswerIndex: 0,
      explanation: 'A ReplicaSet maintains the desired number of pod replicas and replaces any that fail or are terminated.',
      citation: 'DevOps_Guide.pdf • Chapter 4',
    },
    {
      id: 'devops_q7',
      question: 'What is the purpose of Docker layers in image construction?',
      options: [
        'Caching reusable filesystem changes to speed up builds and reduce image size',
        'Encrypting container network traffic between hosts',
        'Providing a graphical interface for container management',
        'Scheduling container start order on a swarm cluster',
      ],
      correctAnswerIndex: 0,
      explanation: 'Docker images consist of read-only layers. Each instruction in a Dockerfile creates a layer, enabling caching and sharing of unchanged layers.',
      citation: 'DevOps_Guide.pdf • Chapter 2',
    },
    {
      id: 'devops_q8',
      question: 'What is the role of a Service Mesh in microservices environments?',
      options: [
        'Managing service-to-service communication, observability, and security policies',
        'Synchronising data between relational databases',
        'Compiling polyglot microservices into a single binary',
        'Providing a web-based IDE for remote development',
      ],
      correctAnswerIndex: 0,
      explanation: 'A service mesh (e.g., Istio) provides traffic management, mutual TLS, and observability for inter-service communication without requiring app-level changes.',
      citation: 'DevOps_Guide.pdf • Chapter 6',
    },
  ],
  default: [
    {
      id: 'gen_q1',
      question: 'Which of the following best describes the principle of Least Privilege in security design?',
      options: [
        'Granting users and services only the minimum permissions required to perform their specific task',
        'Restricting administrative login access exclusively to local localhost connections',
        'Enforcing password rotation every 14 days across all user accounts',
        'Disabling all public API endpoints by default during off-peak hours',
      ],
      correctAnswerIndex: 0,
      explanation: 'The Principle of Least Privilege ensures entities have minimum operational access rights, reducing potential attack surfaces.',
      citation: 'Security_Fundamentals.pdf • Chapter 2',
    },
    {
      id: 'gen_q2',
      question: 'In distributed database design, what does the CAP theorem state?',
      options: [
        'A distributed system can deliver at most 2 out of 3 guarantees: Consistency, Availability, and Partition Tolerance',
        'Computation speed doubles every two years across cluster nodes',
        'Caching always improves write throughput across sharded tables',
        'All client requests must be serialized through a single master node',
      ],
      correctAnswerIndex: 0,
      explanation: "Eric Brewer's CAP Theorem proves that a distributed data store can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.",
      citation: 'Distributed_Systems.pdf • Chapter 3',
    },
    {
      id: 'gen_q3',
      question: 'What is the purpose of Vector Embeddings in RAG (Retrieval-Augmented Generation) systems?',
      options: [
        'Converting textual information into high-dimensional numerical vectors to measure semantic similarity',
        'Compressing large PDF files into smaller zip archives for fast network transfer',
        'Encrypting database connection strings using symmetric keys',
        'Parsing HTML document structures into clean markdown trees',
      ],
      correctAnswerIndex: 0,
      explanation: 'Vector embeddings encode text meaning as dense mathematical vectors, allowing vector databases to perform fast semantic similarity searches.',
      citation: 'AI_Knowledge_Base.pdf • RAG Architecture',
    },
    {
      id: 'gen_q4',
      question: 'What is the time complexity of binary search on a sorted array?',
      options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
      correctAnswerIndex: 0,
      explanation: 'Binary search halves the search space on each iteration, yielding a logarithmic O(log n) time complexity.',
      citation: 'Algorithms.pdf • Chapter 5',
    },
    {
      id: 'gen_q5',
      question: 'Which HTTP method is idempotent and used to fully replace a resource?',
      options: ['PUT', 'POST', 'PATCH', 'DELETE'],
      correctAnswerIndex: 0,
      explanation: 'PUT replaces the entire resource at the target URI and is idempotent — calling it multiple times produces the same result.',
      citation: 'REST_APIs.pdf • Chapter 2',
    },
    {
      id: 'gen_q6',
      question: 'In object-oriented programming, what does polymorphism allow?',
      options: [
        'Different objects to respond to the same method call in type-specific ways',
        'Inheriting fields from multiple parent classes simultaneously',
        'Compiling code into multiple target architecture binaries',
        'Running multiple threads on a single CPU core in parallel',
      ],
      correctAnswerIndex: 0,
      explanation: 'Polymorphism allows subclasses to override parent methods, enabling a single interface to operate across different object types.',
      citation: 'OOP_Principles.pdf • Chapter 3',
    },
    {
      id: 'gen_q7',
      question: 'What is the purpose of an index in a relational database?',
      options: [
        'Accelerating query lookups by creating an ordered reference to rows',
        'Encrypting column values at rest with AES-256',
        'Enforcing referential integrity between parent and child tables',
        'Automatically partitioning tables across multiple storage nodes',
      ],
      correctAnswerIndex: 0,
      explanation: 'A database index stores a sorted copy of selected column values with pointers to rows, dramatically reducing full table scan cost.',
      citation: 'Databases.pdf • Chapter 7',
    },
    {
      id: 'gen_q8',
      question: 'Which design pattern separates the construction of a complex object from its representation?',
      options: ['Builder', 'Singleton', 'Observer', 'Decorator'],
      correctAnswerIndex: 0,
      explanation: 'The Builder pattern constructs complex objects step-by-step, allowing the same construction process to produce different representations.',
      citation: 'Design_Patterns.pdf • Chapter 2',
    },
    {
      id: 'gen_q9',
      question: 'What does ACID stand for in database transaction management?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Authentication, Caching, Indexing, Distribution',
        'Availability, Clustering, Integrity, Durability',
        'Atomicity, Concurrency, Idempotency, Decoupling',
      ],
      correctAnswerIndex: 0,
      explanation: 'ACID properties guarantee that database transactions are processed reliably: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent transactions), Durability (persisted commits).',
      citation: 'Databases.pdf • Chapter 4',
    },
    {
      id: 'gen_q10',
      question: 'In networking, what is the role of DNS?',
      options: [
        'Translating human-readable domain names into machine IP addresses',
        'Encrypting data packets in transit between client and server',
        'Assigning dynamic IP addresses to devices on a local network',
        'Routing packets across the shortest path between autonomous systems',
      ],
      correctAnswerIndex: 0,
      explanation: 'DNS (Domain Name System) acts as the internet\'s phonebook, resolving domain names like "example.com" to their corresponding IP addresses.',
      citation: 'Networking.pdf • Chapter 3',
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle — returns a new shuffled array without mutating the original.
 */
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Build a questions array of exactly `count` items from the given bank.
 * Shuffles the bank first, then cycles through it if count > bank.length.
 * Each generated question gets a unique runtime id.
 */
const buildQuestionsFromBank = (bank, count, topic) => {
  if (bank.length === 0) return [];

  const shuffled = shuffleArray(bank);
  const questions = [];

  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length];
    // Add a suffix only when we must cycle (i.e., count > bank.length)
    const suffix = count > bank.length ? ` (Variant ${Math.floor(i / bank.length) + 1})` : '';
    questions.push({
      ...template,
      id: `q_${Date.now()}_${i + 1}_${Math.random().toString(36).slice(2, 6)}`,
      question: `${template.question}${suffix}`,
    });
  }

  return questions;
};

// ─── Exported Service Functions ───────────────────────────────────────────────

/**
 * Get stored quiz history from localStorage
 */
export const getQuizHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading quiz history:', err);
    return [];
  }
};

/**
 * Get a specific quiz session by ID
 */
export const getQuizById = (quizId) => {
  const history = getQuizHistory();
  return history.find((q) => q.id === quizId) || null;
};

/**
 * Create a new quiz session from topic, difficulty, count, and question type.
 *
 * @param {Object} params
 * @param {string}  params.topic         - Subject/topic for the quiz
 * @param {string}  [params.difficulty]  - 'Easy' | 'Medium' | 'Hard'
 * @param {number}  [params.questionCount] - Exact number of questions (1–50)
 * @param {string}  [params.questionType]  - 'Multiple Choice' | 'True / False' | 'Short Answer'
 * @param {string}  [params.sourceDoc]   - Source document context label
 */
export const generateQuiz = async ({
  topic,
  difficulty = 'Medium',
  questionCount = 10,
  questionType = 'Multiple Choice',
  sourceDoc = 'All Indexed Documents',
}) => {
  // ── Validate questionCount ──
  const parsedCount = parseInt(questionCount, 10);
  if (isNaN(parsedCount) || parsedCount < 1) {
    throw new Error('questionCount must be a positive integer of at least 1.');
  }
  const clampedCount = Math.min(parsedCount, 50);

  if (DEV) {
    console.log('[quiz.service] Received Question Count:', clampedCount);
    console.log('[quiz.service] Question Type:', questionType);
    console.log('[quiz.service] Difficulty:', difficulty);
  }

  const history = getQuizHistory();

  // ── Pick the right bank ──
  const isDevOps =
    topic.toLowerCase().includes('devops') ||
    topic.toLowerCase().includes('cloud') ||
    topic.toLowerCase().includes('kubernetes') ||
    topic.toLowerCase().includes('container') ||
    topic.toLowerCase().includes('docker') ||
    topic.toLowerCase().includes('cicd') ||
    topic.toLowerCase().includes('ci/cd');

  const bankKey = isDevOps ? 'DevOps & Cloud Systems' : 'default';
  const bank = SAMPLE_QUESTION_BANK[bankKey] || SAMPLE_QUESTION_BANK.default;

  // ── Build exactly clampedCount questions ──
  const questions = buildQuestionsFromBank(bank, clampedCount, topic);

  // ── Assert count before saving ──
  if (questions.length !== clampedCount) {
    const msg = `[quiz.service] ASSERTION FAILED — requested ${clampedCount} questions but generated ${questions.length}.`;
    console.error(msg);
    throw new Error(msg);
  }

  if (DEV) {
    console.log('[quiz.service] Generated Count:', questions.length);
  }

  const newQuiz = {
    id: `quiz_${Date.now()}`,
    title: topic || 'Custom Practice Quiz',
    topic: topic || 'General Study',
    sourceDoc,
    difficulty,
    questionType,
    questionCount: questions.length, // always the actual count
    requestedCount: clampedCount,    // what the user asked for
    status: 'in_progress',           // 'in_progress' | 'completed'
    createdAt: new Date().toISOString(),
    questions,
    userAnswers: {},
    timeSpentSeconds: 0,
    scorePercentage: null,
    correctCount: 0,
  };

  const updatedHistory = [newQuiz, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newQuiz;
};

/**
 * Evaluate submitted quiz responses and save score
 */
export const submitQuizEvaluation = (quizId, userAnswers, timeSpentSeconds = 0) => {
  const history = getQuizHistory();
  const quizIndex = history.findIndex((q) => q.id === quizId);

  if (quizIndex === -1) {
    throw new Error(`Quiz ${quizId} not found in history`);
  }

  const quiz = history[quizIndex];
  let correctCount = 0;

  const evaluatedQuestions = quiz.questions.map((q) => {
    const selectedAnswerIndex = userAnswers[q.id];
    const isCorrect = selectedAnswerIndex === q.correctAnswerIndex;
    if (isCorrect) correctCount++;
    return {
      ...q,
      selectedAnswerIndex,
      isCorrect,
    };
  });

  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);

  const completedQuiz = {
    ...quiz,
    status: 'completed',
    completedAt: new Date().toISOString(),
    timeSpentSeconds,
    userAnswers,
    questions: evaluatedQuestions,
    correctCount,
    scorePercentage,
    analysis: {
      strengthSummary:
        scorePercentage >= 80
          ? 'Mastery Demonstrated'
          : scorePercentage >= 60
          ? 'Good Understanding'
          : 'Needs Review',
      feedback:
        scorePercentage >= 80
          ? 'Excellent work! You have a solid grasp of core concepts and principles.'
          : 'Good effort! Review the cited document sections below to reinforce key concepts.',
      accuracyBadge:
        scorePercentage >= 80 ? 'High Accuracy' : scorePercentage >= 60 ? 'Moderate' : 'Needs Focus',
    },
  };

  history[quizIndex] = completedQuiz;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return completedQuiz;
};

/**
 * Delete quiz from history log
 */
export const deleteQuizFromHistory = (quizId) => {
  const history = getQuizHistory();
  const filtered = history.filter((q) => q.id !== quizId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};
