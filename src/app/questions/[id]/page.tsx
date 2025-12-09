"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AnswerCard from "@/components/AnswerCard";
import AnswerForm from "@/components/AnswerForm";
import { ArrowLeft, User, Shield, Pencil, Trash2 } from "lucide-react";

interface Answer {
  id: string;
  body: string;
  user: {
    id: string;
    displayName: string;
    tier: number;
  } | null;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  body: string | null;
  user: {
    id: string;
    displayName: string;
    tier: number;
  } | null;
  answers: Answer[];
  createdAt: string;
}

function TierBadge({ tier }: { tier: number }) {
  if (tier === 3) {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
        <Shield size={10} />
        Admin
      </span>
    );
  }
  if (tier === 2) {
    return (
      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
        Advisor
      </span>
    );
  }
  return null;
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const canEdit = user && question && (user.tier >= 3 || user.id === question.user?.id);
  const canDelete = user && user.tier >= 3;

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await fetch(`/api/questions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setEditTitle(data.question.title);
        setEditBody(data.question.body || "");
      } else if (res.status === 404) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSubmitAnswer = async (body: string) => {
    const res = await fetch(`/api/questions/${params.id}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to submit answer");
    }

    fetchQuestion();
  };

  const handleUpdateAnswer = async (answerId: string, body: string) => {
    const res = await fetch(`/api/answers/${answerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update answer");
    }

    fetchQuestion();
  };

  const handleDeleteAnswer = async (answerId: string) => {
    const res = await fetch(`/api/answers/${answerId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete answer");
    }

    fetchQuestion();
  };

  const handleUpdateQuestion = async () => {
    const res = await fetch(`/api/questions/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: editTitle, body: editBody }),
    });

    if (res.ok) {
      fetchQuestion();
      setIsEditing(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    const res = await fetch(`/api/questions/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[#2e2e2e] rounded w-3/4 mb-4" />
          <div className="h-4 bg-[#2e2e2e] rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-[#a3a3a3]">Question not found</p>
      </div>
    );
  }

  const formattedDate = new Date(question.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#a3a3a3] hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to questions
      </Link>

      <article className="p-4 sm:p-6 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] text-lg sm:text-xl font-semibold focus:outline-none focus:border-cyan-500"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              className="w-full p-3 bg-[#0a0a0a] border border-[#2e2e2e] rounded-lg text-[#fafafa] focus:outline-none focus:border-cyan-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateQuestion}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-[#a3a3a3] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-[#fafafa]">{question.title}</h1>
              {(canEdit || canDelete) && (
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-[#666] hover:text-cyan-400 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeleteQuestion}
                      className="p-2 text-[#666] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {question.body && (
              <p className="text-[#a3a3a3] mb-6 whitespace-pre-wrap">{question.body}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-[#666]">
              <div className="w-6 h-6 rounded-full bg-[#2e2e2e] flex items-center justify-center">
                <User size={12} className="text-[#a3a3a3]" />
              </div>
              <span className="text-[#a3a3a3]">{question.user?.displayName || "Anonymous"}</span>
              {question.user && <TierBadge tier={question.user.tier} />}
              <span>.</span>
              <span>{formattedDate}</span>
            </div>
          </>
        )}
      </article>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#fafafa]">
          {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {question.answers.length === 0 ? (
          <div className="p-4 sm:p-6 bg-[#141414] border border-[#2e2e2e] rounded-xl text-center">
            <p className="text-[#a3a3a3]">No answers yet. Be the first to share your wisdom!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {question.answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                id={answer.id}
                body={answer.body}
                user={answer.user}
                createdAt={answer.createdAt}
                onUpdate={handleUpdateAnswer}
                onDelete={handleDeleteAnswer}
              />
            ))}
          </div>
        )}
      </section>

      <AnswerForm onSubmit={handleSubmitAnswer} />
    </div>
  );
}
