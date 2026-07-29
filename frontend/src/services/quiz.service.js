/**
 * Service for managing Quiz generation, storage, interactive taking, and score evaluation.
 * Uses localStorage for persistent cross-session history with fallback demo quizzes.
 */

const STORAGE_KEY = 'ai_quizzes_history';

// Sample fallback questions library for generating instant rich study quizzes
const SAMPLE_QUESTION_BANK = {
  'DevOps & Cloud Systems': [
    {
      id: 'q1',
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
      id: 'q2',
      question: 'Which Infrastructure as Code (IaC) tool uses declarative HCL syntax to provision GCP resources?',
      options: [
        'Terraform',
        'Ansible',
        'Docker Compose',
        'Jenkins',
      ],
      correctAnswerIndex: 0,
      explanation: 'Terraform by HashiCorp uses HashiCorp Configuration Language (HCL) to declaratively define and provision cloud infrastructure.',
      citation: 'DevOps_Guide.pdf • Chapter 7 (IaC Best Practices)',
    },
    {
      id: 'q3',
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
      id: 'q4',
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
  ],
  default: [
    {
      id: 'qd1',
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
      id: 'qd2',
      question: 'In distributed database design, what does the CAP theorem state?',
      options: [
        'A distributed system can deliver at most 2 out of 3 guarantees: Consistency, Availability, and Partition Tolerance',
        'Computation speed doubles every two years across cluster nodes',
        'Caching always improves write throughput across sharded tables',
        'All client requests must be serialized through a single master node',
      ],
      correctAnswerIndex: 0,
      explanation: 'Eric Brewer’s CAP Theorem proves that a distributed data store can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously.',
      citation: 'Distributed_Systems.pdf • Chapter 3',
    },
    {
      id: 'qd3',
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
  ],
};

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
 * Create a new quiz session from topic, difficulty, and count
 */
export const generateQuiz = async ({ topic, difficulty = 'Medium', questionCount = 5, sourceDoc = 'All Indexed Documents' }) => {
  const history = getQuizHistory();
  
  // Pick matching sample questions or generate generic ones
  const bankKey = Object.keys(SAMPLE_QUESTION_BANK).find((key) =>
    topic.toLowerCase().includes('devops') || topic.toLowerCase().includes('cloud')
  ) ? 'DevOps & Cloud Systems' : 'default';

  const baseQuestions = SAMPLE_QUESTION_BANK[bankKey] || SAMPLE_QUESTION_BANK.default;
  
  // Synthesize questions array matching requested count
  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    const template = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...template,
      id: `q_${Date.now()}_${i + 1}`,
      question: `${template.question} (${topic} Context - Q${i + 1})`,
    });
  }

  const newQuiz = {
    id: `quiz_${Date.now()}`,
    title: topic || 'Custom Practice Quiz',
    topic: topic || 'General Study',
    sourceDoc,
    difficulty,
    questionCount: questions.length,
    status: 'in_progress', // 'in_progress' | 'completed'
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
      strengthSummary: scorePercentage >= 80 ? 'Mastery Demonstrated' : scorePercentage >= 60 ? 'Good Understanding' : 'Needs Review',
      feedback: scorePercentage >= 80 
        ? 'Excellent work! You have a solid grasp of core concepts and principles.' 
        : 'Good effort! Review the cited document sections below to reinforce key concepts.',
      accuracyBadge: scorePercentage >= 80 ? 'High Accuracy' : scorePercentage >= 60 ? 'Moderate' : 'Needs Focus',
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
