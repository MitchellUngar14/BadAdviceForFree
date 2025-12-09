"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import QuestionCard from "@/components/QuestionCard";
import QuestionForm from "@/components/QuestionForm";

interface Question {
  id: string;
  title: string;
  body: string | null;
  user: {
    id: string;
    displayName: string;
    tier: number;
  } | null;
  _count: {
    answers: number;
  };
  createdAt: string;
}

export default function Home() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmitQuestion = async (title: string, body: string) => {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, body }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to submit question");
    }

    fetchQuestions();
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-[#fafafa]">
          Bad Advice For Free
        </h1>
        <p className="text-[#a3a3a3]">
          Ask questions. Get questionable answers. It&apos;s all free!
        </p>
      </div>

      <QuestionForm onSubmit={handleSubmitQuestion} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#fafafa]">Recent Questions</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl animate-pulse">
                <div className="h-5 bg-[#2e2e2e] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#2e2e2e] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-center">
            <p className="text-[#a3a3a3]">No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                id={question.id}
                title={question.title}
                body={question.body}
                user={question.user}
                answerCount={question._count.answers}
                createdAt={question.createdAt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
