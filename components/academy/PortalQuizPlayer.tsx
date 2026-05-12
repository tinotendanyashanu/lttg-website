'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitModuleQuiz, submitQuiz } from '@/lib/actions/portalAcademy';

interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export default function PortalQuizPlayer({
  courseId,
  moduleId,
  title,
  subtitle,
  questions,
  passingScore,
  attemptLimit,
  previousAttempts = 0,
}: {
  courseId: string;
  moduleId?: string;
  title: string;
  subtitle?: string;
  questions: QuizQuestion[];
  passingScore: number;
  attemptLimit?: number;
  previousAttempts?: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; scorePercentage: number; error?: string } | null>(null);

  const allAnswered = useMemo(() => answers.every((answer) => answer !== -1), [answers]);
  const current = questions[currentQuestion];
  const lastQuestion = currentQuestion === questions.length - 1;
  const attemptsRemaining = Math.max((attemptLimit || 3) - previousAttempts, 0);

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = optionIndex;
      return next;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = moduleId
      ? await submitModuleQuiz(courseId, moduleId, answers)
      : await submitQuiz(courseId, answers);
    setIsSubmitting(false);

    if (!response.success) {
      setResult({
        passed: false,
        scorePercentage: 0,
        error: response.error || 'Failed to submit quiz.',
      });
      return;
    }

    setResult({
      passed: Boolean(response.passed),
      scorePercentage: Number(response.scorePercentage || 0),
    });
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{moduleId ? 'Module assessment' : 'Final assessment'}</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Pass mark</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{passingScore}%</p>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-center dark:bg-[#1f1f22]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Attempts left</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{attemptsRemaining}</p>
            </div>
          </div>
        </div>
      </div>

      {result ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${result.passed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300'}`}>
            <span className="material-icons-outlined text-4xl">{result.passed ? 'verified' : 'warning'}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {result.error ? 'Submission failed' : result.passed ? 'Assessment passed' : 'Assessment not passed'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {result.error
              ? result.error
              : `You scored ${result.scorePercentage}%. ${result.passed ? 'Your progress has been updated and the next stage is now available.' : `You need ${passingScore}% to pass.`}`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/portal/employee/academy/courses/${courseId}`)}
              className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
            >
              Return to course
            </button>
            {!result.passed && !result.error && attemptsRemaining > 0 && (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers(new Array(questions.length).fill(-1));
                  setCurrentQuestion(0);
                }}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-primary hover:text-brand-primary dark:border-gray-700 dark:text-gray-300"
              >
                Retry assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-[#27272a]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Question</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{currentQuestion + 1} / {questions.length}</p>
            </div>
            <div className="w-48 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-2 rounded-full bg-brand-primary transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gray-50 p-6 dark:bg-[#1f1f22]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{current.question}</h3>
            </div>

            <div className="space-y-3">
              {current.options.map((option, index) => {
                const isSelected = answers[currentQuestion] === index;
                return (
                  <button
                    key={`${current.question}-${index}`}
                    onClick={() => handleAnswer(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-gray-200 hover:border-brand-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#1f1f22]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'}`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6 dark:border-gray-800">
            <button
              onClick={() => setCurrentQuestion((value) => Math.max(0, value - 1))}
              disabled={currentQuestion === 0}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white"
            >
              Previous
            </button>
            {lastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting || attemptsRemaining === 0}
                className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit assessment'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion((value) => Math.min(questions.length - 1, value + 1))}
                className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary"
              >
                Next question
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
