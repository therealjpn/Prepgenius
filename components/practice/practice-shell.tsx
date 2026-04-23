"use client";

import { useState } from "react";
import type { PracticeSession } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PracticeShell({ initialSession }: { initialSession: PracticeSession }) {
  const [session, setSession] = useState(initialSession);
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    explanation: string;
    correctAnswer: string;
    hasNextQuestion: boolean;
  }>(null);

  const currentQuestion = session.questions[session.currentQuestionIndex];

  async function submitAnswer(optionId: string) {
    const response = await fetch("/api/practice/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        selectedAnswer: optionId
      })
    });

    const data = await response.json();
    setFeedback({
      correct: data.correct,
      explanation: data.explanation,
      correctAnswer: data.correctAnswer,
      hasNextQuestion: Boolean(data.nextQuestion)
    });

    setSession((current) => ({
      ...current,
      score: data.correct ? current.score + 1 : current.score
    }));
  }

  function moveToNextQuestion() {
    setSession((current) => ({
      ...current,
      currentQuestionIndex: current.currentQuestionIndex + 1
    }));
    setFeedback(null);
  }

  if (!currentQuestion) {
    return (
      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Session complete</p>
        <h2 className="mt-3 text-2xl font-bold">You answered {session.score} questions correctly.</h2>
        <p className="mt-2 text-sm text-ink-500">
          Jump into another topic or review your performance on the analytics screen.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <article className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-500">
              {session.subject} • {session.topic}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink-900">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </h2>
          </div>
          <div className="rounded-full bg-gold-500/15 px-4 py-2 text-sm font-semibold text-amber-500">
            Score {session.score}
          </div>
        </div>

        <p className="mt-6 text-lg font-semibold leading-8 text-ink-900">{currentQuestion.questionText}</p>

        <div className="mt-6 grid gap-3">
          {currentQuestion.options?.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => submitAnswer(option.id)}
              className={cn(
                "rounded-3xl border border-brand-100 px-4 py-4 text-left text-base font-medium transition",
                "hover:border-brand-500 hover:bg-brand-50"
              )}
            >
              <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                {option.id}
              </span>
              {option.text}
            </button>
          ))}
        </div>
      </article>

      {feedback ? (
        <article
          className={cn(
            "rounded-[28px] p-5 shadow-soft",
            feedback.correct ? "bg-brand-700 text-white" : "bg-danger text-white"
          )}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">
            {feedback.correct ? "Correct answer" : `Correct answer: ${feedback.correctAnswer}`}
          </p>
          <p className="mt-3 text-base leading-7">{feedback.explanation}</p>
          {feedback.hasNextQuestion ? (
            <button
              type="button"
              onClick={moveToNextQuestion}
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900"
            >
              Next Question
            </button>
          ) : null}
        </article>
      ) : null}
    </section>
  );
}
