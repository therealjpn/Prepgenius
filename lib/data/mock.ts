import type { AnalyticsOverview, PracticeSession, Question, StudyPlan, SubscriptionTier, UserProfile } from "@/lib/types";
import { generateId } from "@/lib/utils";

export const mockUser: UserProfile = {
  id: "demo-user",
  fullName: "Adaeze Okafor",
  email: "adaeze@example.com",
  phone: "+2348012345678",
  whatsappPhone: "+2348012345678",
  examType: "jamb",
  subjects: ["Mathematics", "English", "Physics", "Chemistry"],
  examDate: "2026-05-30",
  studyHoursPerDay: 2,
  streakCount: 12,
  lastActiveDate: "2026-04-08",
  subscriptionTier: "premium",
  subscriptionStatus: "active",
  dailyQuestionsUsed: 8,
  dailyTutorMessagesUsed: 3,
  dailyResetDate: "2026-04-08",
  onboardingCompleted: true,
  onboardingSource: "web",
  referralCode: "ADAEZE12"
};

export const mockQuestions: Question[] = [
  {
    id: "q_math_1",
    examType: "jamb",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    questionText: "Solve for x: 2x² + 5x - 3 = 0",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "x = 1/2, x = -3" },
      { id: "B", text: "x = -1/2, x = 3" },
      { id: "C", text: "x = 1, x = -3" },
      { id: "D", text: "x = 1/2, x = 3" }
    ],
    correctAnswer: "A",
    explanation: "Factor the expression into (2x - 1)(x + 3) = 0, then solve each bracket.",
    difficulty: "medium"
  },
  {
    id: "q_eng_1",
    examType: "jamb",
    subject: "English",
    topic: "Comprehension",
    questionText: "Choose the option that best captures the tone of the passage.",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Sarcastic" },
      { id: "B", text: "Optimistic" },
      { id: "C", text: "Indifferent" },
      { id: "D", text: "Hostile" }
    ],
    correctAnswer: "B",
    explanation: "The writer repeatedly uses hopeful and forward-looking language, which points to optimism.",
    difficulty: "easy"
  },
  {
    id: "q_phy_1",
    examType: "jamb",
    subject: "Physics",
    topic: "Electricity",
    questionText: "A current of 2 A flows through a resistor of 5 Ω. What is the potential difference?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "2.5 V" },
      { id: "B", text: "7 V" },
      { id: "C", text: "10 V" },
      { id: "D", text: "25 V" }
    ],
    correctAnswer: "C",
    explanation: "Use Ohm's law: V = IR = 2 x 5 = 10 volts.",
    difficulty: "easy"
  }
];

export const mockPracticeSession: PracticeSession = {
  sessionId: generateId("session"),
  userId: mockUser.id,
  platform: "web",
  examType: "jamb",
  subject: "Mathematics",
  topic: "Quadratic Equations",
  questions: mockQuestions,
  currentQuestionIndex: 0,
  score: 0,
  startedAt: new Date().toISOString()
};

export const mockAnalytics: AnalyticsOverview = {
  readinessScore: 72,
  streakCount: 12,
  questionsPracticed: 847,
  accuracyRate: 68,
  examDate: mockUser.examDate,
  daysToExam: 52,
  subjectPerformance: [
    { subject: "Mathematics", accuracy: 78, total: 240, weakTopics: ["Logarithms"] },
    { subject: "English", accuracy: 62, total: 211, weakTopics: ["Summary", "Lexis"] },
    { subject: "Physics", accuracy: 52, total: 180, weakTopics: ["Waves", "Electricity"] },
    { subject: "Chemistry", accuracy: 71, total: 216, weakTopics: ["Organic Chemistry"] }
  ],
  weeklyActivity: [
    { day: "Mon", web: 12, whatsapp: 8 },
    { day: "Tue", web: 15, whatsapp: 9 },
    { day: "Wed", web: 9, whatsapp: 14 },
    { day: "Thu", web: 17, whatsapp: 12 },
    { day: "Fri", web: 11, whatsapp: 18 },
    { day: "Sat", web: 20, whatsapp: 7 },
    { day: "Sun", web: 8, whatsapp: 6 }
  ]
};

export const mockStudyPlan: StudyPlan = {
  weekOf: "2026-04-06",
  examType: "jamb",
  days: [
    {
      day: "Monday",
      focus: "Quadratic Equations",
      tasks: ["10 timed questions", "Review 2 bookmarks", "Ask tutor 1 concept question"],
      durationMinutes: 90,
      platformHint: "both"
    },
    {
      day: "Tuesday",
      focus: "English Summary",
      tasks: ["Practice 2 passages", "Revise new vocabulary", "Quick WhatsApp challenge"],
      durationMinutes: 75,
      platformHint: "whatsapp"
    },
    {
      day: "Wednesday",
      focus: "Physics Electricity",
      tasks: ["Solve 12 MCQs", "Review formulas", "Take mini mastery check"],
      durationMinutes: 90,
      platformHint: "web"
    }
  ]
};

export const subscriptionPlans: Record<
  SubscriptionTier,
  { label: string; amount: number; questionsPerDay: number; tutorMessagesPerDay: number; mockExamsPerMonth: number }
> = {
  free: {
    label: "Free",
    amount: 0,
    questionsPerDay: 20,
    tutorMessagesPerDay: 10,
    mockExamsPerMonth: 1
  },
  premium: {
    label: "Premium",
    amount: 2000,
    questionsPerDay: Number.POSITIVE_INFINITY,
    tutorMessagesPerDay: 50,
    mockExamsPerMonth: 5
  },
  pro: {
    label: "Pro",
    amount: 5000,
    questionsPerDay: Number.POSITIVE_INFINITY,
    tutorMessagesPerDay: Number.POSITIVE_INFINITY,
    mockExamsPerMonth: Number.POSITIVE_INFINITY
  },
  ican_pro: {
    label: "ICAN Pro",
    amount: 10000,
    questionsPerDay: Number.POSITIVE_INFINITY,
    tutorMessagesPerDay: Number.POSITIVE_INFINITY,
    mockExamsPerMonth: Number.POSITIVE_INFINITY
  }
};
