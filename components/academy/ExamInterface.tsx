'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { submitExam } from '@/lib/actions/academy';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExamInterfaceProps {
  courseId: string;
  courseTitle: string;
  questions: Question[];
  passingScore: number;
  previousAttempts?: number;
}

export default function ExamInterface({ courseId, courseTitle, questions, passingScore }: ExamInterfaceProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allAnswered = answers.every((a) => a !== -1);

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await submitExam(courseId, answers);
      if (response.success) {
        setResult({ passed: response.passed, score: response.score });
        router.refresh(); // Refresh to update sidebar progress
      }
    } catch (error) {
      console.error('Failed to submit exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-2xl mx-auto mt-8">
        <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {result.passed ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {result.passed ? 'Exam Passed!' : 'Exam Failed'}
        </h2>
        
        <p className="text-slate-500 mb-8 text-lg">
          You scored <span className="font-bold text-slate-900">{result.score}%</span>. 
          {result.passed 
            ? ' Congratulations on completing the course!' 
            : ` You need ${passingScore}% to pass. Please review the material and try again.`}
        </p>

        <div className="flex justify-center space-x-4">
          {result.passed ? (
            <button 
              onClick={() => router.push('/portal/partner/dashboard/academy')}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Back to Academy
            </button>
          ) : (
            <button 
              onClick={() => {
                setResult(null);
                setAnswers(new Array(questions.length).fill(-1));
                setCurrentQuestionIndex(0);
              }}
              className="flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Exam
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">Final Exam</h2>
          <h1 className="text-2xl font-bold text-slate-900">{courseTitle}</h1>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-slate-500">Question</span>
          <p className="text-xl font-bold text-slate-900">{currentQuestionIndex + 1} <span className="text-slate-400 text-base">/ {questions.length}</span></p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 min-h-[400px] flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-8">{currentQuestion.question}</h3>
        
        <div className="space-y-4 flex-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentQuestionIndex] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                    }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                    </div>
                    <span className="font-medium">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-100">
           <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-slate-500 font-bold hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              {!isSubmitting && <CheckCircle className="ml-2 h-4 w-4" />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
