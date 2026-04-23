export type ExamType = "jamb" | "waec" | "neco" | "ican";
export type SubscriptionTier = "free" | "premium" | "pro" | "ican_pro";
export type Platform = "web" | "whatsapp";
export type PracticeMode = "topic" | "mixed";

export interface SubjectTopic {
  name: string;
  slug: string;
  topics: string[];
}

export interface SubjectDefinition {
  examType: ExamType;
  name: string;
  slug: string;
  icon: string;
  topics: string[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  examType: ExamType;
  subjects: string[];
  examDate?: string | null;
  studyHoursPerDay: number;
  streakCount: number;
  lastActiveDate?: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: "inactive" | "active" | "past_due" | "cancelled";
  dailyQuestionsUsed: number;
  dailyTutorMessagesUsed: number;
  dailyResetDate: string;
  onboardingCompleted: boolean;
  onboardingSource?: Platform | null;
  referralCode?: string | null;
}

export interface QuestionOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: string;
  examType: ExamType;
  subject: string;
  topic: string;
  questionText: string;
  questionType: "multiple_choice" | "theory" | "computation";
  options: QuestionOption[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface PracticeSession {
  sessionId: string;
  userId: string;
  platform: Platform;
  examType: ExamType;
  subject: string;
  topic: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  startedAt: string;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  streakCount: number;
  nextQuestion?: Question | null;
}

export interface TutorMessage {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  readinessScore: number;
  streakCount: number;
  questionsPracticed: number;
  accuracyRate: number;
  examDate?: string | null;
  daysToExam?: number | null;
  subjectPerformance: Array<{
    subject: string;
    accuracy: number;
    total: number;
    weakTopics: string[];
  }>;
  weeklyActivity: Array<{
    day: string;
    web: number;
    whatsapp: number;
  }>;
}

export interface StudyPlanDay {
  day: string;
  focus: string;
  tasks: string[];
  durationMinutes: number;
  platformHint: Platform | "both";
}

export interface StudyPlan {
  weekOf: string;
  examType: ExamType;
  days: StudyPlanDay[];
}

export interface ConversationState {
  state:
    | "MAIN_MENU"
    | "ONBOARDING_EXAM"
    | "ONBOARDING_SUBJECTS"
    | "ONBOARDING_DATE"
    | "SELECT_SUBJECT"
    | "SELECT_TOPIC"
    | "PRACTICE_SESSION"
    | "MOCK_IN_PROGRESS"
    | "SELECT_TUTOR_SUBJECT"
    | "TUTOR_CHAT"
    | "SUBSCRIPTION_MENU";
  context: {
    examType?: ExamType;
    subject?: string;
    topic?: string;
    sessionId?: string;
    currentQuestionIndex?: number;
    currentQuestionId?: string;
    questionsAnswered?: number;
    mockExamId?: string;
    tutorSubject?: string;
    tutorHistory?: TutorMessage[];
    lastActivityAt?: number;
  };
}

