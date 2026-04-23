import * as whatsapp from "@/lib/whatsapp/api";
import { getSession, setSession } from "@/lib/whatsapp/session";
import { listSubjects } from "@/lib/services/questions.service";
import { startPracticeSession, submitPracticeAnswer } from "@/lib/services/practice.service";
import { chatWithTutor } from "@/lib/services/tutor.service";
import { getAnalyticsOverview } from "@/lib/services/analytics.service";
import { getCurrentStudyPlan } from "@/lib/services/studyPlan.service";
import { getSubscriptionEntitlements } from "@/lib/services/subscription.service";
import { completeOnboarding, getOrCreateUserByPhone, getUserIdByPhone, getUserProfile } from "@/lib/services/user.service";
import { initializePaystackPayment } from "@/lib/paystack";
import type { ConversationState, ExamType } from "@/lib/types";

function normalizeText(message: any) {
  return (
    message?.text?.body?.toLowerCase()?.trim() ??
    message?.interactive?.button_reply?.id?.toLowerCase()?.trim() ??
    message?.interactive?.list_reply?.id?.toLowerCase()?.trim() ??
    ""
  );
}

async function sendMainMenu(phone: string) {
  return whatsapp.sendList(phone, "📚 *PrepGenius Menu*\n\nPick what you want to do:", "Open menu", [
    {
      title: "Study",
      rows: [
        { id: "practice", title: "📝 Practice Questions" },
        { id: "mock", title: "⏱️ Mock Exam" },
        { id: "tutor", title: "🧠 AI Tutor" }
      ]
    },
    {
      title: "Track",
      rows: [
        { id: "progress", title: "📊 My Progress" },
        { id: "study-plan", title: "📅 Study Plan" },
        { id: "bookmarks", title: "📖 Bookmarks" }
      ]
    },
    {
      title: "Account",
      rows: [
        { id: "subscribe", title: "💳 Subscribe / Manage Plan" },
        { id: "help", title: "❓ Help" }
      ]
    }
  ]);
}

async function sendQuestionPrompt(phone: string, text: string, optionsCount: number) {
  if (optionsCount <= 3) {
    return whatsapp.sendButtons(
      phone,
      text,
      [
        { id: "A", title: "A" },
        { id: "B", title: "B" },
        { id: "C", title: "C" }
      ].slice(0, optionsCount)
    );
  }

  return whatsapp.sendText(
    phone,
    `${text}\n\nReply with A, B, C, or D.`
  );
}

async function handleOnboarding(phone: string, message: any, session: ConversationState) {
  const text = normalizeText(message);

  if (session.state === "ONBOARDING_EXAM") {
    await setSession(phone, {
      state: "ONBOARDING_SUBJECTS",
      context: {
        examType: text as ExamType
      }
    });

    const subjects = await listSubjects(text as ExamType);
    return whatsapp.sendList(phone, "Nice one. Which subject do you want to start with?", "Choose subject", [
      {
        title: "Subjects",
        rows: subjects.slice(0, 10).map((subject) => ({
          id: subject.name.toLowerCase(),
          title: subject.name,
          description: subject.topics.slice(0, 2).join(", ")
        }))
      }
    ]);
  }

  if (session.state === "ONBOARDING_SUBJECTS") {
    const userId = await getOrCreateUserByPhone(phone);
    const profile = await completeOnboarding(
      userId,
      {
        examType: session.context.examType ?? "jamb",
        subjects: [text],
        whatsappPhone: phone
      },
      "whatsapp"
    );
    await setSession(phone, {
      state: "MAIN_MENU",
      context: {
        examType: session.context.examType,
        subject: text
      }
    });

    return whatsapp.sendText(
      phone,
      `Hey there! 👋 Welcome to *PrepGenius* 🎯\n\nYou're set up for *${session.context.examType?.toUpperCase()}* and starting with *${text}*.\n\nYour current plan is *${profile.subscriptionTier}*.\nReply *menu* any time to see all options.`
    );
  }

  await setSession(phone, { state: "ONBOARDING_EXAM", context: {} });
  return whatsapp.sendList(
    phone,
    "Hey there! 👋 Welcome to *PrepGenius* 🎯\n\nI'm your AI-powered exam prep buddy. Which exam are you preparing for?",
    "Choose exam",
    [
      {
        title: "Exams",
        rows: [
          { id: "jamb", title: "JAMB (UTME)" },
          { id: "waec", title: "WAEC (WASSCE)" },
          { id: "neco", title: "NECO" },
          { id: "ican", title: "ICAN Professional" }
        ]
      }
    ]
  );
}

async function handleSubjectSelection(phone: string, userId: string, message: any, session: ConversationState) {
  const subject = message?.interactive?.list_reply?.title ?? message?.text?.body ?? "Mathematics";
  await setSession(phone, {
    state: "SELECT_TOPIC",
    context: {
      ...session.context,
      subject
    }
  });

  const subjects = await listSubjects(session.context.examType ?? "jamb");
  const selected = subjects.find((item) => item.name.toLowerCase() === subject.toLowerCase()) ?? subjects[0];

  return whatsapp.sendList(phone, `📚 *${selected.name}*\n\nChoose a topic or practice across all topics.`, "Pick topic", [
    {
      title: "Topics",
      rows: selected.topics.slice(0, 9).map((topic) => ({
        id: topic.toLowerCase(),
        title: topic
      }))
    },
    {
      title: "Shortcuts",
      rows: [{ id: "all-topics", title: "All Topics" }]
    }
  ]);
}

async function handleTopicSelection(phone: string, userId: string, message: any, session: ConversationState) {
  const topic = message?.interactive?.list_reply?.title ?? message?.text?.body ?? "All Topics";
  const practiceSession = await startPracticeSession({
    userId,
    platform: "whatsapp",
    examType: session.context.examType ?? "jamb",
    subject: session.context.subject ?? "Mathematics",
    topic
  });
  const question = practiceSession.questions[0];

  await setSession(phone, {
    state: "PRACTICE_SESSION",
    context: {
      ...session.context,
      sessionId: practiceSession.sessionId,
      topic,
      currentQuestionId: question.id,
      currentQuestionIndex: 0
    }
  });

  const text = `📝 *${practiceSession.subject}* — ${topic}\nQuestion 1 of ${practiceSession.questions.length}\n\n${question.questionText}\n\n${question.options
    ?.map((option) => `${option.id}) ${option.text}`)
    .join("\n")}`;

  return sendQuestionPrompt(phone, text, question.options?.length ?? 0);
}

async function handlePracticeAnswer(phone: string, message: any, session: ConversationState) {
  const selectedAnswer =
    message?.interactive?.button_reply?.id ?? message?.text?.body?.trim().toUpperCase() ?? "A";
  const result = await submitPracticeAnswer({
    sessionId: session.context.sessionId ?? "",
    questionId: session.context.currentQuestionId ?? "",
    selectedAnswer
  });

  const responseText = result.correct
    ? `✅ *Correct!* Well done!\n\n💡 *Explanation:*\n${result.explanation}\n\nYour streak: 🔥 ${result.streakCount}`
    : `❌ Not quite. The correct answer is *${result.correctAnswer}*\n\n💡 *Explanation:*\n${result.explanation}`;

  await whatsapp.sendText(phone, responseText);

  if (!result.nextQuestion) {
    await setSession(phone, { state: "MAIN_MENU", context: {} });
    return whatsapp.sendButtons(phone, "📊 *Session Complete!*\n\nReply below to keep going.", [
      { id: "practice", title: "Practice Again" },
      { id: "menu", title: "Main Menu" },
      { id: "progress", title: "See Stats" }
    ]);
  }

  await setSession(phone, {
    state: "PRACTICE_SESSION",
    context: {
      ...session.context,
      currentQuestionIndex: (session.context.currentQuestionIndex ?? 0) + 1,
      currentQuestionId: result.nextQuestion.id
    }
  });

  const nextText = `📝 *${result.nextQuestion.subject}* — ${result.nextQuestion.topic}\nQuestion ${(session.context.currentQuestionIndex ?? 0) + 2}\n\n${result.nextQuestion.questionText}\n\n${result.nextQuestion.options
    ?.map((option) => `${option.id}) ${option.text}`)
    .join("\n")}`;

  return sendQuestionPrompt(phone, nextText, result.nextQuestion.options?.length ?? 0);
}

async function handleTutorMessage(phone: string, userId: string, message: any, session: ConversationState) {
  const prompt = message?.text?.body ?? "";

  if (prompt.toLowerCase() === "exit") {
    await setSession(phone, { state: "MAIN_MENU", context: {} });
    return sendMainMenu(phone);
  }

  const subject = session.context.tutorSubject ?? "Mathematics";
  const response = await chatWithTutor({
    userId,
    subject,
    prompt
  });

  return whatsapp.sendText(phone, `🧠 *AI Tutor Mode* — ${subject}\n\n${response.reply}\n\nType *exit* to go back.`);
}

async function handleSubscriptionSelection(phone: string, userId: string, message: any) {
  const selection = normalizeText(message);
  const tier =
    selection.includes("ican") ? "ican_pro" : selection.includes("pro") ? "pro" : "premium";
  const entitlements = getSubscriptionEntitlements(tier);
  const payment = await initializePaystackPayment({
    email: `${phone.replace("+", "")}@prepgenius.com.ng`,
    amount: entitlements.amount * 100,
    metadata: {
      userId,
      phone,
      source: "whatsapp",
      plan: tier
    }
  });

  await setSession(phone, { state: "MAIN_MENU", context: {} });
  return whatsapp.sendText(
    phone,
    `💳 Great choice! Here's your payment link:\n\n${payment.authorization_url}\n\nAfter payment confirms, your PrepGenius plan upgrades instantly.`
  );
}

async function handleMainMenu(phone: string, userId: string, message: any, session: ConversationState) {
  const text = normalizeText(message);

  if (text.includes("practice") || text === "1") {
    await setSession(phone, {
      state: "SELECT_SUBJECT",
      context: {
        examType: session.context.examType ?? "jamb"
      }
    });
    const subjects = await listSubjects(session.context.examType ?? "jamb");
    return whatsapp.sendList(phone, "Choose a subject to practice.", "Pick subject", [
      {
        title: "Subjects",
        rows: subjects.slice(0, 10).map((subject) => ({
          id: subject.slug,
          title: subject.name
        }))
      }
    ]);
  }

  if (text.includes("tutor") || text === "3") {
    await setSession(phone, {
      state: "TUTOR_CHAT",
      context: {
        ...session.context,
        tutorSubject: session.context.subject ?? "Mathematics"
      }
    });
    return whatsapp.sendText(
      phone,
      "🧠 *AI Tutor Mode* — Mathematics\n\nAsk me anything. Type your question or send *exit* to return to the menu."
    );
  }

  if (text.includes("progress") || text === "4") {
    const analytics = await getAnalyticsOverview(userId);
    return whatsapp.sendText(
      phone,
      `📊 *Your PrepGenius Stats*\n\n🔥 Study Streak: ${analytics.streakCount} days\n📝 Questions Practiced: ${analytics.questionsPracticed}\n✅ Overall Accuracy: ${analytics.accuracyRate}%\n\nFocus more on *${analytics.subjectPerformance[2]?.subject ?? "Physics"}* this week.`
    );
  }

  if (text.includes("study-plan") || text === "5") {
    const plan = await getCurrentStudyPlan(userId);
    const today = plan.days[0];
    return whatsapp.sendText(
      phone,
      `📅 *Today's Study Plan*\n\nFocus: *${today.focus}*\nTasks:\n${today.tasks.map((task) => `• ${task}`).join("\n")}`
    );
  }

  if (text.includes("subscribe") || text === "6") {
    await setSession(phone, { state: "SUBSCRIPTION_MENU", context: session.context });
    return whatsapp.sendButtons(
      phone,
      "Upgrade to unlock unlimited questions, deeper tutor access, and stronger exam analytics.",
      [
        { id: "premium", title: "Premium ₦2K" },
        { id: "pro", title: "Pro ₦5K" },
        { id: "ican_pro", title: "ICAN ₦10K" }
      ]
    );
  }

  return sendMainMenu(phone);
}

export async function routeWhatsAppMessage(phone: string, message: any) {
  const session = await getSession(phone);
  let userId = await getUserIdByPhone(phone);

  if (!userId) {
    return handleOnboarding(phone, message, session);
  }

  const text = normalizeText(message);
  if (["menu", "hi", "hello", "hey", "start", "0"].includes(text)) {
    await setSession(phone, { state: "MAIN_MENU", context: session.context });
    return sendMainMenu(phone);
  }

  switch (session.state) {
    case "MAIN_MENU":
      return handleMainMenu(phone, userId, message, session);
    case "SELECT_SUBJECT":
      return handleSubjectSelection(phone, userId, message, session);
    case "SELECT_TOPIC":
      return handleTopicSelection(phone, userId, message, session);
    case "PRACTICE_SESSION":
      return handlePracticeAnswer(phone, message, session);
    case "TUTOR_CHAT":
      return handleTutorMessage(phone, userId, message, session);
    case "SUBSCRIPTION_MENU":
      return handleSubscriptionSelection(phone, userId, message);
    default:
      await setSession(phone, { state: "MAIN_MENU", context: session.context });
      return sendMainMenu(phone);
  }
}
